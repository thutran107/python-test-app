'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, Check, Play, ArrowRight, AlertTriangle, Code, LogIn } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';
import { usePyodide } from '@/lib/hooks/use-pyodide';
import type { AnswerSubmission } from '@/lib/grading';

interface TestInfo {
  id: string;
  name: string;
  duration_minutes: number;
  total_questions: number;
  pass_threshold: number;
}

interface SanitizedQuestion {
  id: string;
  type: 'multiple_choice' | 'open_answer' | 'coding';
  topic: string;
  subtopic?: string;
  difficulty: string;
  body?: string;
  options?: string[];
  grading_hint?: string;
  title?: string;
  description?: string;
  exercise_type?: string;
  starter_code?: string;
  hints?: string[];
  test_cases?: Array<{
    id: number;
    description: string;
    setup_code: string;
    call_code: string;
    expected_output: string;
  }>;
}

interface AssignmentInfo {
  id: string;
  status: string;
  started_at: string;
}

interface GradedAnswer {
  question_id: string;
  type: string;
  response: string | number;
  correct: boolean;
  details: {
    correct_answer?: string | number;
    explanation?: string;
    test_results?: Array<{ test_case_id: number; passed: boolean; actual: string }>;
  };
}

interface TestResult {
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  passed: boolean;
  graded_answers: GradedAnswer[];
}

export function TakeTestClient({ testId, token }: { testId: string; token: string }) {
  const [phase, setPhase] = useState<'loading' | 'error' | 'auth' | 'test' | 'submitting' | 'results' | 'already_done'>('loading');
  const [error, setError] = useState('');
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [questions, setQuestions] = useState<SanitizedQuestion[]>([]);
  const [assignment, setAssignment] = useState<AssignmentInfo | null>(null);
  const [authSession, setAuthSession] = useState<any>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [existingScore, setExistingScore] = useState<number | null>(null);

  // Check auth state
  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => {
      if (data.session) setAuthSession(data.session);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Validate token
  useEffect(() => {
    if (!token) {
      setError('No access token provided. Please use the link shared with you.');
      setPhase('error');
      return;
    }

    async function validate() {
      try {
        const headers: Record<string, string> = {};
        if (authSession?.access_token) {
          headers['Authorization'] = `Bearer ${authSession.access_token}`;
        }

        const res = await fetch(`/api/take-test/${testId}?token=${token}`, { headers });

        if (res.status === 410) {
          const data = await res.json();
          setExistingScore(data.score);
          setPhase('already_done');
          return;
        }

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to load test');
          setPhase('error');
          return;
        }

        const data = await res.json();
        setTestInfo(data.test);
        setQuestions(data.questions);
        setAssignment(data.assignment);

        if (data.requires_auth && !authSession) {
          setPhase('auth');
        } else {
          setPhase('test');
        }
      } catch {
        setError('Failed to connect to server');
        setPhase('error');
      }
    }

    validate();
  }, [testId, token, authSession]);

  const handleSignIn = async () => {
    const sb = supabaseBrowser();
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/take-test/${testId}?token=${token}`,
      },
    });
  };

  const handleSubmit = async (answers: AnswerSubmission[]) => {
    setPhase('submitting');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authSession?.access_token) {
        headers['Authorization'] = `Bearer ${authSession.access_token}`;
      }

      const res = await fetch(`/api/take-test/${testId}?token=${token}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to submit');
        setPhase('error');
        return;
      }

      const data = await res.json();
      setResult(data);
      setPhase('results');
    } catch {
      setError('Failed to submit test');
      setPhase('error');
    }
  };

  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="brutal-card p-12 bg-white text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#1d1d1d] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-lg">Loading test...</p>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="brutal-card p-12 bg-white text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-[#f54e00] border-3 border-[#1d1d1d] shadow-[6px_6px_0px_#1d1d1d] mx-auto flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold uppercase">Error</h2>
          <p className="font-mono font-bold opacity-70">{error}</p>
        </div>
      </div>
    );
  }

  if (phase === 'already_done') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="brutal-card p-12 bg-white text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-[#00d084] border-3 border-[#1d1d1d] shadow-[6px_6px_0px_#1d1d1d] mx-auto flex items-center justify-center">
            <Check className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-2xl font-bold uppercase">Already Completed</h2>
          <p className="font-mono font-bold opacity-70">
            You have already submitted this test.
          </p>
          {existingScore !== null && (
            <div className="text-4xl font-bold mt-4">{existingScore}%</div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'auth') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="brutal-card p-12 bg-white text-center space-y-6 max-w-md">
          <div className="w-16 h-16 bg-[#1d4aff] border-3 border-[#1d1d1d] shadow-[6px_6px_0px_#1d1d1d] mx-auto flex items-center justify-center">
            <Code className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold uppercase">{testInfo?.name}</h2>
            <div className="flex justify-center gap-6 mt-4 font-mono font-bold opacity-70">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {testInfo?.duration_minutes} min</span>
              <span>{testInfo?.total_questions} questions</span>
            </div>
          </div>
          <p className="font-mono text-sm opacity-60">Sign in with Google to begin your test.</p>
          <button
            onClick={handleSignIn}
            className="w-full p-4 bg-[#1d1d1d] text-white border-3 border-[#1d1d1d] shadow-[6px_6px_0px_#1d1d1d] font-bold text-lg flex items-center justify-center gap-3 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_#1d1d1d] transition-all active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
          >
            <LogIn className="w-5 h-5" /> SIGN IN WITH GOOGLE
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'submitting') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="brutal-card p-12 bg-white text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#1d1d1d] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-lg">Submitting & grading...</p>
        </div>
      </div>
    );
  }

  if (phase === 'results' && result) {
    return <ResultsView result={result} testName={testInfo?.name || 'Test'} questions={questions} passThreshold={testInfo?.pass_threshold ?? 70} />;
  }

  if (phase === 'test' && testInfo && questions.length > 0 && assignment) {
    return (
      <TestTakingView
        testInfo={testInfo}
        questions={questions}
        assignment={assignment}
        onSubmit={handleSubmit}
      />
    );
  }

  return null;
}

// ─── Test Taking View ────────────────────────────────────────────────────────

function TestTakingView({
  testInfo,
  questions,
  assignment,
  onSubmit,
}: {
  testInfo: TestInfo;
  questions: SanitizedQuestion[];
  assignment: AssignmentInfo;
  onSubmit: (answers: AnswerSubmission[]) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({});
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [codeAnswers, setCodeAnswers] = useState<Record<string, string>>({});
  const [codingResults, setCodingResults] = useState<Record<string, Array<{ test_case_id: number; passed: boolean; actual: string }>>>({});

  const { status: pyStatus, runCode } = usePyodide();

  // Timer based on server started_at
  const [timeLeft, setTimeLeft] = useState(() => {
    const started = new Date(assignment.started_at).getTime();
    const deadline = started + testInfo.duration_minutes * 60 * 1000;
    return Math.max(0, Math.floor((deadline - Date.now()) / 1000));
  });
  const [timeExpired, setTimeExpired] = useState(false);

  useEffect(() => {
    if (timeExpired) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timeExpired]);

  // Auto-submit on timeout
  useEffect(() => {
    if (timeExpired) {
      handleSubmit();
    }
  }, [timeExpired]);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleSubmit = () => {
    const answers: AnswerSubmission[] = questions.map(q => {
      switch (q.type) {
        case 'multiple_choice':
          return {
            question_id: q.id,
            type: 'multiple_choice' as const,
            response: mcAnswers[q.id] ?? -1,
          };
        case 'open_answer':
          return {
            question_id: q.id,
            type: 'open_answer' as const,
            response: openAnswers[q.id] || '',
          };
        case 'coding':
          return {
            question_id: q.id,
            type: 'coding' as const,
            response: codeAnswers[q.id] || q.starter_code || '',
            coding_results: codingResults[q.id],
          };
        default:
          return { question_id: q.id, type: q.type, response: '' };
      }
    });
    onSubmit(answers);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="brutal-card p-6 flex justify-between items-center bg-[#1d1d1d] text-white">
        <div>
          <h2 className="text-2xl font-bold">{testInfo.name}</h2>
          <p className="font-mono text-sm opacity-80 mt-1">
            Question {currentIndex + 1} of {questions.length} · {question.topic}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm font-bold px-3 py-1 border-3 border-white flex items-center gap-1 bg-white text-[#1d1d1d]">
            {currentIndex + 1} / {questions.length}
          </span>
          <span className={`font-mono text-sm font-bold px-3 py-1 border-3 border-white flex items-center gap-1 ${timeLeft < 120 ? 'bg-[#f54e00]' : 'bg-[#1d4aff]'}`}>
            <Clock className="w-4 h-4" /> {fmt(timeLeft)}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-white border-3 border-[#1d1d1d]">
        <div className="h-full bg-[#1d4aff] transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="brutal-card p-8 space-y-8 bg-white">
        {question.type === 'multiple_choice' && question.options && (
          <TakerMCQuestion
            question={question}
            index={currentIndex}
            selected={mcAnswers[question.id] ?? null}
            onSelect={(idx) => setMcAnswers(p => ({ ...p, [question.id]: idx }))}
          />
        )}
        {question.type === 'open_answer' && (
          <TakerOpenQuestion
            question={question}
            index={currentIndex}
            answer={openAnswers[question.id] ?? ''}
            onChange={(v) => setOpenAnswers(p => ({ ...p, [question.id]: v }))}
          />
        )}
        {question.type === 'coding' && (
          <TakerCodingQuestion
            question={question}
            index={currentIndex}
            code={codeAnswers[question.id] ?? question.starter_code ?? ''}
            onChange={(v) => setCodeAnswers(p => ({ ...p, [question.id]: v }))}
            onResults={(r) => setCodingResults(p => ({ ...p, [question.id]: r }))}
            pyStatus={pyStatus}
            runCode={runCode}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-8 border-t-2 border-[#1d1d1d]">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(i => i - 1)}
            className="px-6 py-3 font-bold border-3 border-[#1d1d1d] shadow-[4px_4px_0px_#1d1d1d] bg-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1d1d1d] transition-all disabled:opacity-40"
          >
            PREVIOUS
          </button>
          <button
            onClick={() => {
              if (isLast) handleSubmit();
              else setCurrentIndex(i => i + 1);
            }}
            className="px-8 py-3 font-bold border-3 border-[#1d1d1d] shadow-[4px_4px_0px_#1d1d1d] bg-[#1d4aff] text-white flex items-center gap-2 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1d1d1d] transition-all"
          >
            {isLast ? 'SUBMIT TEST' : 'NEXT'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Question Navigator */}
      <div className="brutal-card p-4 bg-white">
        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => {
            const answered = q.type === 'multiple_choice' ? mcAnswers[q.id] !== undefined
              : q.type === 'open_answer' ? !!openAnswers[q.id]
              : !!codeAnswers[q.id];
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-10 h-10 border-3 border-[#1d1d1d] font-mono font-bold text-sm transition-all ${
                  i === currentIndex ? 'bg-[#1d4aff] text-white' :
                  answered ? 'bg-[#00d084] text-black' : 'bg-white'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Question Renderers (Taker) ──────────────────────────────────────────────

function TakerMCQuestion({ question, index, selected, onSelect }: {
  question: SanitizedQuestion;
  index: number;
  selected: number | null;
  onSelect: (idx: number) => void;
}) {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-[#1d4aff] text-lg">Q{index + 1}</span>
          <span className="border-3 border-[#1d1d1d] px-3 py-1 text-xs font-bold font-mono">{question.topic}</span>
          <span className="border-3 border-[#1d1d1d] px-2 py-1 text-xs font-bold font-mono bg-[#1d4aff]/10">MC</span>
        </div>
        <h3 className="text-2xl font-bold leading-relaxed whitespace-pre-line">{question.body}</h3>
      </div>
      <div className="space-y-4 pt-4">
        {question.options?.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={`w-full p-6 border-3 border-[#1d1d1d] text-left font-mono text-lg font-bold flex items-center gap-4 transition-all ${
              selected === idx
                ? 'bg-[#ffc025] shadow-[3px_3px_0px_#1d1d1d] translate-x-[2px] translate-y-[2px]'
                : 'bg-white shadow-[6px_6px_0px_#1d1d1d] hover:bg-gray-50'
            }`}
          >
            <div className={`w-8 h-8 border-3 border-[#1d1d1d] flex items-center justify-center shrink-0 ${selected === idx ? 'bg-[#1d1d1d] text-white' : ''}`}>
              {['A', 'B', 'C', 'D'][idx]}
            </div>
            {option}
          </button>
        ))}
      </div>
    </>
  );
}

function TakerOpenQuestion({ question, index, answer, onChange }: {
  question: SanitizedQuestion;
  index: number;
  answer: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-[#00d084] text-lg">Q{index + 1}</span>
          <span className="border-3 border-[#1d1d1d] px-3 py-1 text-xs font-bold font-mono">{question.topic}</span>
          <span className="border-3 border-[#1d1d1d] px-2 py-1 text-xs font-bold font-mono bg-[#00d084]/10">OPEN</span>
        </div>
        <h3 className="text-2xl font-bold leading-relaxed whitespace-pre-line">{question.body}</h3>
      </div>
      <textarea
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        rows={4}
        className="w-full bg-[#f4f4f0] font-mono text-lg p-5 border-3 border-[#1d1d1d] resize-none focus:outline-none focus:ring-2 focus:ring-[#00d084]"
      />
    </>
  );
}

function TakerCodingQuestion({ question, index, code, onChange, onResults, pyStatus, runCode }: {
  question: SanitizedQuestion;
  index: number;
  code: string;
  onChange: (v: string) => void;
  onResults: (r: Array<{ test_case_id: number; passed: boolean; actual: string }>) => void;
  pyStatus: string;
  runCode: (code: string) => Promise<{ stdout: string; stderr: string; error: string | null }>;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ description: string; passed: boolean; actual: string; test_case_id: number }>>([]);

  const handleRun = async () => {
    setIsRunning(true);
    setTestResults([]);

    if (question.exercise_type === 'predict_output') {
      const results = (question.test_cases || []).map(tc => ({
        test_case_id: tc.id,
        description: tc.description,
        passed: code.trim().replace(/\r\n/g, '\n') === tc.expected_output.trim(),
        actual: code.trim(),
      }));
      setTestResults(results);
      onResults(results.map(r => ({ test_case_id: r.test_case_id, passed: r.passed, actual: r.actual })));
      setIsRunning(false);
      return;
    }

    const results: Array<{ test_case_id: number; description: string; passed: boolean; actual: string }> = [];
    for (const tc of (question.test_cases || [])) {
      const parts = [code, tc.setup_code, tc.call_code].filter(Boolean);
      const result = await runCode(parts.join('\n'));
      const passed = !result.error && result.stdout.trim().replace(/\r\n/g, '\n') === tc.expected_output.trim();
      results.push({ test_case_id: tc.id, description: tc.description, passed, actual: result.error || result.stdout });
    }

    setTestResults(results);
    onResults(results.map(r => ({ test_case_id: r.test_case_id, passed: r.passed, actual: r.actual })));
    setIsRunning(false);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono font-bold text-[#f54e00] text-lg">Q{index + 1}</span>
          <span className="border-3 border-[#1d1d1d] px-3 py-1 text-xs font-bold font-mono">{question.topic}</span>
          <span className="border-3 border-[#1d1d1d] px-2 py-1 text-xs font-bold font-mono bg-[#f54e00]/10">CODE</span>
          {question.exercise_type && (
            <span className="border-3 border-[#1d1d1d] px-2 py-1 text-xs font-bold font-mono bg-gray-100">
              {question.exercise_type.replace(/_/g, ' ').toUpperCase()}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold">{question.title}</h3>
        <p className="font-mono text-sm opacity-70">{question.description}</p>
      </div>

      {question.exercise_type === 'predict_output' ? (
        <div className="space-y-4 pt-4">
          <pre className="bg-[#1d1d1d] text-[#e5e7eb] font-mono text-sm p-5 border-3 border-[#1d1d1d] overflow-x-auto whitespace-pre">
            {question.starter_code}
          </pre>
          <label className="block font-bold uppercase text-sm">Your Answer</label>
          <textarea
            value={code}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type the exact output..."
            rows={4}
            className="w-full bg-[#f4f4f0] font-mono text-sm p-4 border-3 border-[#1d1d1d] resize-none focus:outline-none focus:ring-2 focus:ring-[#f54e00]"
          />
        </div>
      ) : (
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          rows={12}
          className="w-full bg-[#1d1d1d] text-[#e5e7eb] font-mono text-sm p-5 border-3 border-[#1d1d1d] resize-y focus:outline-none focus:ring-2 focus:ring-[#f54e00] leading-relaxed"
        />
      )}

      <button
        onClick={handleRun}
        disabled={pyStatus !== 'ready' && question.exercise_type !== 'predict_output'}
        className="px-6 py-2 font-bold border-3 border-[#1d1d1d] shadow-[4px_4px_0px_#1d1d1d] bg-[#f54e00] text-white flex items-center gap-2 text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1d1d1d] transition-all disabled:opacity-40"
      >
        {isRunning ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> RUNNING...</>
        ) : (
          <><Play className="w-4 h-4 fill-current" /> {question.exercise_type === 'predict_output' ? 'CHECK' : 'RUN CODE'}</>
        )}
      </button>

      {testResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold uppercase text-sm">
            Test Results —{' '}
            <span className="text-[#00d084]">{testResults.filter(r => r.passed).length} passed</span>
            {' / '}
            <span className="text-[#f54e00]">{testResults.filter(r => !r.passed).length} failed</span>
          </h4>
          {testResults.map((tr, i) => (
            <div key={i} className={`border-3 border-[#1d1d1d] p-3 font-mono text-sm ${tr.passed ? 'bg-[#00d084]/10' : 'bg-[#f54e00]/10'}`}>
              <div className="flex justify-between items-center">
                <span className="font-bold">{tr.description}</span>
                <span className={`px-2 py-1 border-3 border-[#1d1d1d] font-bold text-xs ${tr.passed ? 'bg-[#00d084]' : 'bg-[#f54e00] text-white'}`}>
                  {tr.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Results View ────────────────────────────────────────────────────────────

function ResultsView({ result, testName, questions, passThreshold }: {
  result: TestResult;
  testName: string;
  questions: SanitizedQuestion[];
  passThreshold: number;
}) {
  const mcAnswers = result.graded_answers.filter(a => a.type === 'multiple_choice');
  const openAnswers = result.graded_answers.filter(a => a.type === 'open_answer');
  const codingAnswers = result.graded_answers.filter(a => a.type === 'coding');

  const breakdown = [
    { label: 'MC', items: mcAnswers, color: '#1d4aff' },
    { label: 'Open', items: openAnswers, color: '#00d084' },
    { label: 'Coding', items: codingAnswers, color: '#f54e00' },
  ].filter(b => b.items.length > 0);

  // ─── Topic Performance ──────────────────────────────────────────────────────
  const topicPerformance = (() => {
    const map: Record<string, { correct: number; total: number }> = {};
    for (const ga of result.graded_answers) {
      const q = questions.find(q => q.id === ga.question_id);
      const topic = q?.topic || 'Unknown';
      if (!map[topic]) map[topic] = { correct: 0, total: 0 };
      map[topic].total++;
      if (ga.correct) map[topic].correct++;
    }
    return Object.entries(map)
      .map(([topic, { correct, total }]) => ({
        topic,
        correct,
        total,
        percentage: Math.round((correct / total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  })();

  // ─── Level Achievement ──────────────────────────────────────────────────────
  const difficulties = [...new Set(questions.map(q => q.difficulty).filter(Boolean))];
  const levelLabel = difficulties.length === 1
    ? difficulties[0].charAt(0).toUpperCase() + difficulties[0].slice(1)
    : 'Mixed';

  const achievementBanner = (() => {
    if (result.score_percentage >= 90) {
      return {
        bg: 'bg-[#00d084]/15',
        border: 'border-[#00d084]',
        icon: '★',
        title: `Outstanding! You've exceeded the expected ${levelLabel} level.`,
        subtitle: "You're ready for the next challenge.",
      };
    }
    if (result.score_percentage >= passThreshold) {
      return {
        bg: 'bg-[#00d084]/10',
        border: 'border-[#00d084]',
        icon: '✓',
        title: `Well done! You've reached the expected ${levelLabel} level.`,
        subtitle: 'You demonstrated solid understanding of the material.',
      };
    }
    return {
      bg: 'bg-[#ffc025]/10',
      border: 'border-[#ffc025]',
      icon: '→',
      title: "Keep going! You're building your skills.",
      subtitle: 'Review the topics below and try again.',
    };
  })();

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Level Achievement Banner */}
      <div className={`brutal-card p-6 ${achievementBanner.bg} border-l-8 ${achievementBanner.border}`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 border-3 border-[#1d1d1d] shadow-[4px_4px_0px_#1d1d1d] flex items-center justify-center text-2xl font-bold bg-white shrink-0">
            {achievementBanner.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold">{achievementBanner.title}</h2>
            <p className="font-mono text-sm mt-1 opacity-70">{achievementBanner.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Score Header */}
      <div className={`brutal-card p-8 text-center space-y-4 ${result.passed ? 'bg-[#00d084]/10' : 'bg-[#f54e00]/10'}`}>
        <div className={`w-20 h-20 border-3 border-[#1d1d1d] shadow-[6px_6px_0px_#1d1d1d] mx-auto flex items-center justify-center ${result.passed ? 'bg-[#00d084]' : 'bg-[#f54e00]'}`}>
          {result.passed ? <Check className="w-12 h-12 text-black" /> : <AlertTriangle className="w-12 h-12 text-white" />}
        </div>
        <h1 className="text-4xl font-bold uppercase">{testName}</h1>
        <div className="text-6xl font-bold">{result.score_percentage}%</div>
        <p className="font-mono font-bold text-lg">
          {result.correct_answers} / {result.total_questions} correct
        </p>
        <span className={`inline-block px-4 py-2 border-3 border-[#1d1d1d] font-bold text-lg ${result.passed ? 'bg-[#00d084]' : 'bg-[#f54e00] text-white'}`}>
          {result.passed ? 'PASSED' : 'NOT PASSED'}
        </span>
      </div>

      {/* Breakdown */}
      {breakdown.length > 1 && (
        <div className="brutal-card p-6 bg-white">
          <h3 className="font-bold uppercase mb-4">Score Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            {breakdown.map(b => {
              const correct = b.items.filter(a => a.correct).length;
              return (
                <div key={b.label} className="border-3 border-[#1d1d1d] p-4 text-center">
                  <div className="font-bold text-sm opacity-60">{b.label}</div>
                  <div className="text-2xl font-bold" style={{ color: b.color }}>{correct}/{b.items.length}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Topic Performance */}
      {topicPerformance.length > 1 && (
        <div className="brutal-card p-6 bg-white space-y-4">
          <h3 className="font-bold uppercase">Performance by Topic</h3>
          <div className="space-y-3">
            {topicPerformance.map(tp => {
              const classification = tp.percentage >= 80 ? 'strong' : tp.percentage >= 50 ? 'developing' : 'needs_work';
              const barColor = classification === 'strong' ? '#00d084' : classification === 'developing' ? '#ffc025' : '#f54e00';
              const label = classification === 'strong' ? 'Strong' : classification === 'developing' ? 'Developing' : 'Needs work';
              return (
                <div key={tp.topic} className="border-3 border-[#1d1d1d] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm capitalize">{tp.topic}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold">{tp.correct}/{tp.total} ({tp.percentage}%)</span>
                      <span
                        className="px-2 py-0.5 border-2 border-[#1d1d1d] text-xs font-bold font-mono"
                        style={{ backgroundColor: barColor + '30', color: '#1d1d1d' }}
                      >
                        {label}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 border-2 border-[#1d1d1d] bg-white">
                    <div
                      className="h-full"
                      style={{ width: `${tp.percentage}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Summary */}
          <div className="font-mono text-sm space-y-1 pt-2 border-t-2 border-[#1d1d1d]">
            {topicPerformance.some(tp => tp.percentage < 50) && (
              <p><span className="font-bold">Focus areas:</span> {topicPerformance.filter(tp => tp.percentage < 50).map(tp => tp.topic).join(', ')}</p>
            )}
            {topicPerformance.some(tp => tp.percentage >= 80) && (
              <p><span className="font-bold">Strengths:</span> {topicPerformance.filter(tp => tp.percentage >= 80).map(tp => tp.topic).join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* Per-question detail */}
      <div className="brutal-card p-6 bg-white space-y-4">
        <h3 className="font-bold uppercase">Question Details</h3>
        {result.graded_answers.map((ga, i) => {
          const q = questions.find(q => q.id === ga.question_id);
          return (
            <div key={ga.question_id} className={`border-3 border-[#1d1d1d] p-4 ${ga.correct ? 'bg-[#00d084]/10' : 'bg-[#f54e00]/10'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold">Q{i + 1}</span>
                  <span className="border-2 border-[#1d1d1d] px-2 py-0.5 text-xs font-bold font-mono">
                    {ga.type === 'multiple_choice' ? 'MC' : ga.type === 'open_answer' ? 'OPEN' : 'CODE'}
                  </span>
                  {q && <span className="font-mono text-xs opacity-60">{q.topic}</span>}
                </div>
                <span className={`px-3 py-1 border-3 border-[#1d1d1d] font-bold text-sm ${ga.correct ? 'bg-[#00d084]' : 'bg-[#f54e00] text-white'}`}>
                  {ga.correct ? 'CORRECT' : 'INCORRECT'}
                </span>
              </div>
              {q && <p className="font-bold text-sm mt-2">{q.body || q.title || ''}</p>}
              <div className="font-mono text-sm mt-2 space-y-1">
                <div>Your answer: <span className="font-bold">{String(ga.response)}</span></div>
                {!ga.correct && ga.details.correct_answer !== undefined && (
                  <div className="text-[#00d084]">Correct: <span className="font-bold">{String(ga.details.correct_answer)}</span></div>
                )}
                {ga.details.explanation && (
                  <div className="opacity-60 text-xs mt-1">{ga.details.explanation}</div>
                )}
                {ga.details.test_results && ga.details.test_results.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {ga.details.test_results.map((tr, j) => (
                      <div key={j} className={`px-2 py-1 text-xs border-2 border-[#1d1d1d] ${tr.passed ? 'bg-[#00d084]/20' : 'bg-[#f54e00]/20'}`}>
                        Test {tr.test_case_id}: {tr.passed ? 'PASS' : 'FAIL'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
