import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/export?testId=X&format=csv
export async function GET(req: NextRequest) {
  const testId = req.nextUrl.searchParams.get('testId');

  if (!testId) {
    return NextResponse.json({ error: 'testId required' }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: test } = await db
    .from('tests')
    .select('name')
    .eq('id', testId)
    .single();

  const { data: attempts, error } = await db
    .from('test_attempts')
    .select(`
      *,
      recipients (email, name)
    `)
    .eq('test_id', testId)
    .order('completed_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build CSV
  const headers = ['Name', 'Email', 'Score (%)', 'Correct', 'Total', 'Passed', 'Time (min)', 'Completed At'];
  const rows = (attempts || []).map(a => {
    const r = a.recipients as { email: string; name: string } | null;
    return [
      r?.name || 'Unknown',
      r?.email || 'Unknown',
      a.score_percentage,
      a.correct_answers,
      a.total_questions,
      a.passed ? 'Yes' : 'No',
      a.time_spent_secs ? Math.round(a.time_spent_secs / 60) : 'N/A',
      a.completed_at || '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const filename = `${(test?.name || 'test').replace(/[^a-zA-Z0-9]/g, '_')}_results.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
