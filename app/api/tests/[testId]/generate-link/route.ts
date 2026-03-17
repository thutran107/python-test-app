import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import crypto from 'crypto';

// POST /api/tests/[testId]/generate-link — generate a magic link (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  const { error: authError } = await requireAdmin(req);
  if (authError) return authError;

  const { testId } = await params;
  const db = supabaseAdmin();

  // Verify test exists
  const { data: test, error: testError } = await db
    .from('tests')
    .select('id, name, status')
    .eq('id', testId)
    .single();

  if (testError || !test) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  }

  // Parse optional body
  let due_date: string | null = null;
  let custom_message: string | null = null;
  let email: string | null = null;
  try {
    const body = await req.json();
    due_date = body.due_date || null;
    custom_message = body.custom_message || null;
    email = body.email || null;
  } catch {
    // No body is fine
  }

  // Generate token
  const accessToken = crypto.randomBytes(32).toString('hex');

  // Create assignment
  const { data: assignment, error } = await db
    .from('recipient_test_assignments')
    .insert({
      test_id: testId,
      status: 'invited',
      access_token: accessToken,
      due_date,
      custom_message,
      invited_email: email,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const link = `${appUrl}/take-test/${testId}?token=${accessToken}`;

  return NextResponse.json({
    assignment_id: assignment.id,
    access_token: accessToken,
    link,
    test_name: test.name,
    email,
  }, { status: 201 });
}
