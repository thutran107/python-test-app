import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/results?testId=X — all attempts for a test, plus the test's questions
export async function GET(req: NextRequest) {
  const testId = req.nextUrl.searchParams.get('testId');

  if (!testId) {
    return NextResponse.json({ error: 'testId required' }, { status: 400 });
  }

  const db = supabaseAdmin();

  const [attemptsResult, testResult] = await Promise.all([
    db
      .from('test_attempts')
      .select(`
        *,
        recipients (id, email, name)
      `)
      .eq('test_id', testId)
      .order('completed_at', { ascending: false }),
    db
      .from('tests')
      .select('questions_json')
      .eq('id', testId)
      .single(),
  ]);

  if (attemptsResult.error) {
    return NextResponse.json({ error: attemptsResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    attempts: attemptsResult.data || [],
    questions: testResult.data?.questions_json || [],
  });
}
