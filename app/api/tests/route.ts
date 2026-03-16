import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/tests — list all tests
export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from('tests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST /api/tests — create a test (snapshot questions)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, config_json, questions_json, duration_minutes, total_questions, pass_threshold, status } = body;

  if (!name || !questions_json || !duration_minutes) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from('tests')
    .insert({
      name,
      config_json: config_json || {},
      questions_json,
      duration_minutes,
      total_questions: total_questions || questions_json.length,
      pass_threshold: pass_threshold ?? 70,
      status: status || 'published',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
