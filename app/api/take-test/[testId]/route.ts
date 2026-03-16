import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { gradeTest, type AnswerSubmission } from '@/lib/grading';
import type { BankQuestion } from '@/lib/question-bank/types';

function sanitizeQuestions(questions: BankQuestion[]): any[] {
  return questions.map(q => {
    const base = { id: q.id, type: q.type, topic: q.topic, subtopic: q.subtopic, difficulty: q.difficulty };
    switch (q.type) {
      case 'multiple_choice':
        return { ...base, body: q.body, options: q.options };
      case 'open_answer':
        return { ...base, body: q.body, grading_hint: q.grading_hint };
      case 'coding':
        return {
          ...base,
          title: q.title,
          description: q.description,
          exercise_type: q.exercise_type,
          starter_code: q.starter_code,
          hints: q.hints,
          test_cases: q.test_cases,
        };
      default:
        return base;
    }
  });
}

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user } } = await client.auth.getUser();
  return user;
}

// GET /api/take-test/[testId]?token=X — validate token, return test
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  const { testId } = await params;
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
  }

  const db = supabaseAdmin();

  // Validate token
  const { data: assignment, error: assignErr } = await db
    .from('recipient_test_assignments')
    .select('*')
    .eq('access_token', token)
    .eq('test_id', testId)
    .single();

  if (assignErr || !assignment) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
  }

  if (assignment.status === 'completed' || assignment.status === 'timed_out') {
    // Fetch the attempt and test info so the client can show full results
    const { data: attempt } = await db
      .from('test_attempts')
      .select('total_questions, correct_answers, score_percentage, passed, answers')
      .eq('assignment_id', assignment.id)
      .single();

    const { data: test } = await db
      .from('tests')
      .select('name, questions_json, pass_threshold')
      .eq('id', testId)
      .single();

    const result = attempt ? {
      total_questions: attempt.total_questions,
      correct_answers: attempt.correct_answers,
      score_percentage: attempt.score_percentage,
      passed: attempt.passed,
      graded_answers: attempt.answers,
    } : null;

    return NextResponse.json({
      error: 'Test already completed',
      status: assignment.status,
      score: assignment.score,
      result,
      test: test ? {
        id: testId,
        name: test.name,
        pass_threshold: test.pass_threshold,
      } : null,
      questions: test ? sanitizeQuestions(test.questions_json as BankQuestion[]) : [],
    }, { status: 410 });
  }

  // Get test
  const { data: test, error: testErr } = await db
    .from('tests')
    .select('*')
    .eq('id', testId)
    .single();

  if (testErr || !test) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  }

  // Check auth — upsert recipient if authenticated
  const user = await getAuthUser(req);
  if (user?.email) {
    // Upsert recipient
    const { data: recipient } = await db
      .from('recipients')
      .upsert(
        { email: user.email, name: user.user_metadata?.full_name || user.email },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (recipient && !assignment.recipient_id) {
      await db
        .from('recipient_test_assignments')
        .update({ recipient_id: recipient.id })
        .eq('id', assignment.id);
    }
  }

  // Mark as started if first access
  if (assignment.status === 'invited' || assignment.status === 'pending') {
    await db
      .from('recipient_test_assignments')
      .update({ status: 'started', started_at: new Date().toISOString() })
      .eq('id', assignment.id);
  }

  const questions = test.questions_json as BankQuestion[];

  return NextResponse.json({
    test: {
      id: test.id,
      name: test.name,
      duration_minutes: test.duration_minutes,
      total_questions: test.total_questions,
      pass_threshold: test.pass_threshold,
    },
    questions: sanitizeQuestions(questions),
    assignment: {
      id: assignment.id,
      status: assignment.status === 'started' ? 'started' : 'started',
      started_at: assignment.started_at || new Date().toISOString(),
    },
    requires_auth: !user,
  });
}

// POST /api/take-test/[testId]?token=X — submit answers
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  const { testId } = await params;
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
  }

  const db = supabaseAdmin();

  // Validate token
  const { data: assignment, error: assignErr } = await db
    .from('recipient_test_assignments')
    .select('*')
    .eq('access_token', token)
    .eq('test_id', testId)
    .single();

  if (assignErr || !assignment) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  if (assignment.status === 'completed') {
    return NextResponse.json({ error: 'Already submitted' }, { status: 410 });
  }

  // Get test questions (with answers)
  const { data: test } = await db
    .from('tests')
    .select('questions_json, pass_threshold')
    .eq('id', testId)
    .single();

  if (!test) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  }

  const questions = test.questions_json as BankQuestion[];
  const body = await req.json();
  const submissions: AnswerSubmission[] = body.answers;

  // Grade
  const result = gradeTest(questions, submissions, test.pass_threshold || 70);

  // Get or create recipient from auth
  let recipientId = assignment.recipient_id;
  if (!recipientId) {
    const user = await getAuthUser(req);
    if (user?.email) {
      const { data: recipient } = await db
        .from('recipients')
        .upsert(
          { email: user.email, name: user.user_metadata?.full_name || user.email },
          { onConflict: 'email' }
        )
        .select()
        .single();
      recipientId = recipient?.id;
    }
  }

  if (!recipientId) {
    return NextResponse.json({ error: 'Authentication required to submit' }, { status: 401 });
  }

  const now = new Date().toISOString();
  const startedAt = assignment.started_at || now;
  const timeSpent = Math.floor((new Date(now).getTime() - new Date(startedAt).getTime()) / 1000);

  // Insert attempt
  const { data: attempt, error: attemptErr } = await db
    .from('test_attempts')
    .insert({
      test_id: testId,
      recipient_id: recipientId,
      assignment_id: assignment.id,
      started_at: startedAt,
      completed_at: now,
      time_spent_secs: timeSpent,
      total_questions: result.total_questions,
      correct_answers: result.correct_answers,
      score_percentage: result.score_percentage,
      passed: result.passed,
      answers: result.graded_answers,
    })
    .select()
    .single();

  if (attemptErr) {
    return NextResponse.json({ error: attemptErr.message }, { status: 500 });
  }

  // Update assignment
  await db
    .from('recipient_test_assignments')
    .update({
      status: 'completed',
      completed_at: now,
      score: result.score_percentage,
      recipient_id: recipientId,
    })
    .eq('id', assignment.id);

  return NextResponse.json({
    attempt_id: attempt.id,
    ...result,
  });
}
