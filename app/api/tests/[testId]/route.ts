import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/tests/[testId]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  const { testId } = await params;
  const db = supabaseAdmin();
  const { data, error } = await db.from('tests').select('*').eq('id', testId).single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json(data);
}

// PATCH /api/tests/[testId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  const { testId } = await params;
  const body = await req.json();
  const db = supabaseAdmin();

  const { data, error } = await db
    .from('tests')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', testId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE /api/tests/[testId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  const { testId } = await params;
  const db = supabaseAdmin();

  // Cascade delete: remove child rows first
  const { error: attemptsError } = await db
    .from('test_attempts')
    .delete()
    .eq('test_id', testId);
  if (attemptsError) {
    return NextResponse.json({ error: attemptsError.message }, { status: 500 });
  }

  const { error: assignmentsError } = await db
    .from('recipient_test_assignments')
    .delete()
    .eq('test_id', testId);
  if (assignmentsError) {
    return NextResponse.json({ error: assignmentsError.message }, { status: 500 });
  }

  const { error } = await db.from('tests').delete().eq('id', testId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
