import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// GET /api/tests/[testId]/assignments — list all assignments for a test (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  const { error: authError } = await requireAdmin(req);
  if (authError) return authError;

  const { testId } = await params;
  const db = supabaseAdmin();

  const { data, error } = await db
    .from('recipient_test_assignments')
    .select(`
      *,
      recipients (id, email, name)
    `)
    .eq('test_id', testId)
    .order('assigned_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
