import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/stats?testId=X — aggregate statistics (admin only)
export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdmin(req);
  if (authError) return authError;

  const testId = req.nextUrl.searchParams.get('testId');

  if (!testId) {
    return NextResponse.json({ error: 'testId required' }, { status: 400 });
  }

  const db = supabaseAdmin();

  // Get all attempts
  const { data: attempts, error } = await db
    .from('test_attempts')
    .select('score_percentage, passed, total_questions, correct_answers, answers, time_spent_secs')
    .eq('test_id', testId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get total assignments
  const { count: totalAssignments } = await db
    .from('recipient_test_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('test_id', testId);

  if (!attempts || attempts.length === 0) {
    return NextResponse.json({
      total_attempts: 0,
      total_assignments: totalAssignments || 0,
      completion_rate: 0,
      average_score: 0,
      median_score: 0,
      pass_rate: 0,
      average_time_secs: 0,
      avg_correct: 0,
      avg_total: 0,
      per_question_accuracy: {},
    });
  }

  const scores = attempts.map(a => a.score_percentage).sort((a, b) => a - b);
  const average = scores.reduce((s, v) => s + v, 0) / scores.length;
  const median = scores.length % 2 === 0
    ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
    : scores[Math.floor(scores.length / 2)];
  const passCount = attempts.filter(a => a.passed).length;
  const avgTime = attempts.reduce((s, a) => s + (a.time_spent_secs || 0), 0) / attempts.length;
  const avgCorrect = attempts.reduce((s, a) => s + (a.correct_answers || 0), 0) / attempts.length;
  const avgTotal = attempts.reduce((s, a) => s + (a.total_questions || 0), 0) / attempts.length;

  // Per-question accuracy
  const questionStats: Record<string, { correct: number; total: number }> = {};
  for (const attempt of attempts) {
    const answers = attempt.answers as Array<{ question_id: string; correct: boolean }>;
    if (Array.isArray(answers)) {
      for (const ans of answers) {
        if (!questionStats[ans.question_id]) {
          questionStats[ans.question_id] = { correct: 0, total: 0 };
        }
        questionStats[ans.question_id].total++;
        if (ans.correct) questionStats[ans.question_id].correct++;
      }
    }
  }

  const perQuestionAccuracy: Record<string, number> = {};
  for (const [qid, stat] of Object.entries(questionStats)) {
    perQuestionAccuracy[qid] = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
  }

  return NextResponse.json({
    total_attempts: attempts.length,
    total_assignments: totalAssignments || 0,
    completion_rate: totalAssignments ? Math.round((attempts.length / totalAssignments) * 100) : 0,
    average_score: Math.round(average * 100) / 100,
    median_score: Math.round(median * 100) / 100,
    pass_rate: Math.round((passCount / attempts.length) * 100),
    average_time_secs: Math.round(avgTime),
    avg_correct: Math.round(avgCorrect * 10) / 10,
    avg_total: Math.round(avgTotal * 10) / 10,
    per_question_accuracy: perQuestionAccuracy,
  });
}
