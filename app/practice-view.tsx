'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PenLine, FileCode, Bug, Eye, Lightbulb, Play, ChevronRight } from 'lucide-react';
import {
  getAllQuestions,
  ALL_TOPICS,
  type CodingQuestion,
  type Topic,
  type TestCase,
} from '@/lib/question-bank';

// ─── Types ───────────────────────────────────────────────────────────────────

type ExerciseType = 'fill_blank' | 'write_from_scratch' | 'fix_bug' | 'predict_output';
type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface Exercise {
  id: string;
  type: ExerciseType;
  title: string;
  topic: string;
  difficulty: DifficultyLevel;
  description: string;
  starter_code: string;
  solution_code: string;
  hint: string;
  test_cases: TestCase[];
}

interface RunResult {
  stdout: string;
  stderr: string;
  error: string | null;
}

interface TestResult {
  test_case: TestCase;
  passed: boolean;
  actual_output: string;
  error: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  fill_blank: 'Fill in the Blank',
  write_from_scratch: 'Write from Scratch',
  fix_bug: 'Fix the Bug',
  predict_output: 'Predict the Output',
};

const LEVEL_DEFINITIONS = {
  easy: {
    label: 'Easy',
    tagline: 'Single concept, guided structure',
    color: 'bg-ph-green text-black',
    goal: 'Build familiarity with Python syntax. One idea per exercise. No surprising edge cases.',
  },
  medium: {
    label: 'Medium',
    tagline: 'Multi-step logic, familiar patterns',
    color: 'bg-ph-yellow text-black',
    goal: 'Apply Python tools to solve small problems. Learner writes meaningful logic.',
  },
  hard: {
    label: 'Hard',
    tagline: 'Algorithm thinking, edge cases, composition',
    color: 'bg-ph-red text-white',
    goal: 'Solve problems that require combining multiple Python concepts. Edge cases matter.',
  },
} as const;

const DIFFICULTY_MAP: Record<string, DifficultyLevel> = {
  beginner: 'easy',
  intermediate: 'medium',
  advanced: 'hard',
};

function mapCodingToExercise(q: CodingQuestion): Exercise {
  return {
    id: q.id,
    type: q.exercise_type,
    title: q.title,
    topic: q.topic,
    difficulty: DIFFICULTY_MAP[q.difficulty],
    description: q.description,
    starter_code: q.starter_code,
    solution_code: q.solution_code,
    hint: q.hints[0] ?? '',
    test_cases: q.test_cases,
  };
}

// ─── Pyodide ─────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
  }
}

let pyodideCache: any = null;
let pyodideLoadPromise: Promise<any> | null = null;

function usePyodide() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    if (pyodideCache) {
      pyodideRef.current = pyodideCache;
      setStatus('ready');
      return;
    }

    setStatus('loading');

    if (!pyodideLoadPromise) {
      pyodideLoadPromise = new Promise<any>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.onload = async () => {
          try {
            const pyodide = await window.loadPyodide({
              indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
            });
            resolve(pyodide);
          } catch (e) {
            reject(e);
          }
        };
        script.onerror = () => reject(new Error('Failed to load Pyodide script from CDN.'));
        document.head.appendChild(script);
      });
    }

    pyodideLoadPromise
      .then((pyodide) => {
        pyodideCache = pyodide;
        pyodideRef.current = pyodide;
        setStatus('ready');
      })
      .catch((e) => {
        setErrorMessage(String(e));
        setStatus('error');
        pyodideLoadPromise = null;
      });
  }, []);

  const runCode = useCallback(async (code: string): Promise<RunResult> => {
    const pyodide = pyodideRef.current;
    if (!pyodide) return { stdout: '', stderr: '', error: 'Pyodide not ready.' };

    try {
      await pyodide.runPythonAsync(
        `import sys, io\n_out = io.StringIO()\n_err = io.StringIO()\nsys.stdout = _out\nsys.stderr = _err`
      );
      await pyodide.runPythonAsync(code);
      const stdout: string = await pyodide.runPythonAsync('_out.getvalue()');
      const stderr: string = await pyodide.runPythonAsync('_err.getvalue()');
      await pyodide.runPythonAsync('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
      return { stdout: stdout.trim(), stderr: stderr.trim(), error: null };
    } catch (err: any) {
      try {
        await pyodide.runPythonAsync('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
      } catch {}
      return { stdout: '', stderr: '', error: String(err) };
    }
  }, []);

  return { status, errorMessage, runCode };
}

// ─── UI Constants ────────────────────────────────────────────────────────────

const TYPE_ICON: Record<ExerciseType, React.ReactNode> = {
  fill_blank: <PenLine className="w-3.5 h-3.5" />,
  write_from_scratch: <FileCode className="w-3.5 h-3.5" />,
  fix_bug: <Bug className="w-3.5 h-3.5" />,
  predict_output: <Eye className="w-3.5 h-3.5" />,
};

const TYPE_COLOR: Record<ExerciseType, string> = {
  fill_blank: 'bg-ph-blue text-white',
  write_from_scratch: 'bg-ph-green text-black',
  fix_bug: 'bg-ph-red text-white',
  predict_output: 'bg-ph-yellow text-black',
};

const TYPE_FILTERS: Array<{ value: ExerciseType | 'all'; label: string }> = [
  { value: 'all', label: 'ALL' },
  { value: 'fill_blank', label: 'FILL BLANK' },
  { value: 'write_from_scratch', label: 'WRITE' },
  { value: 'fix_bug', label: 'FIX BUG' },
  { value: 'predict_output', label: 'PREDICT' },
];

const normalize = (s: string) => s.trim().replace(/\r\n/g, '\n');

// ─── PracticeView ─────────────────────────────────────────────────────────────

const LEVELS: DifficultyLevel[] = ['easy', 'medium', 'hard'];

export function PracticeView() {
  const { status, errorMessage, runCode } = usePyodide();

  const exercises = useMemo(() => {
    return getAllQuestions()
      .filter((q): q is CodingQuestion => q.type === 'coding')
      .map(mapCodingToExercise);
  }, []);

  const [activeLevel, setActiveLevel] = useState<DifficultyLevel>('easy');
  const [typeFilter, setTypeFilter] = useState<ExerciseType | 'all'>('all');
  const [topicFilter, setTopicFilter] = useState<Topic | 'all'>('all');

  const byLevel = exercises.filter(e => e.difficulty === activeLevel);
  const firstInLevel = byLevel[0];

  const [activeId, setActiveId] = useState(firstInLevel?.id ?? exercises[0]?.id ?? '');
  const [userCode, setUserCode] = useState(firstInLevel?.starter_code ?? '');
  const [userAnswer, setUserAnswer] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showHint, setShowHint] = useState(false);

  const handleLevelChange = (level: DifficultyLevel) => {
    const inLevel = exercises.filter(e => e.difficulty === level);
    setActiveLevel(level);
    setTypeFilter('all');
    setTopicFilter('all');
    setActiveId(inLevel[0]?.id ?? '');
    setUserCode(inLevel[0]?.starter_code ?? '');
    setUserAnswer('');
    setRunResult(null);
    setTestResults([]);
    setShowHint(false);
  };

  const exercise = exercises.find(e => e.id === activeId);
  const filtered = byLevel.filter(e =>
    (typeFilter === 'all' || e.type === typeFilter) &&
    (topicFilter === 'all' || e.topic === topicFilter)
  );

  // Reset state when exercise changes
  useEffect(() => {
    if (!exercise) return;
    setUserCode(exercise.starter_code);
    setUserAnswer('');
    setRunResult(null);
    setTestResults([]);
    setShowHint(false);
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRun = async () => {
    if (!exercise) return;
    setIsRunning(true);
    setTestResults([]);
    setRunResult(null);

    if (exercise.type === 'predict_output') {
      const results: TestResult[] = exercise.test_cases.map(tc => ({
        test_case: tc,
        passed: normalize(userAnswer) === normalize(tc.expected_output),
        actual_output: userAnswer.trim(),
        error: null,
      }));
      setTestResults(results);
      setRunResult({ stdout: userAnswer.trim(), stderr: '', error: null });
      setIsRunning(false);
      return;
    }

    const results: TestResult[] = [];
    let lastResult: RunResult = { stdout: '', stderr: '', error: null };

    for (const tc of exercise.test_cases) {
      const parts = [userCode, tc.setup_code, tc.call_code].filter(Boolean);
      const fullCode = parts.join('\n');
      const result = await runCode(fullCode);
      lastResult = result;
      const passed = !result.error && normalize(result.stdout) === normalize(tc.expected_output);
      results.push({ test_case: tc, passed, actual_output: result.stdout, error: result.error });
    }

    setTestResults(results);
    setRunResult(lastResult);
    setIsRunning(false);
  };

  const canRun = exercise
    ? exercise.type === 'predict_output'
      ? userAnswer.trim().length > 0
      : status === 'ready' && !isRunning
    : false;

  return (
    <div className="space-y-4">
      {/* Level tabs */}
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          {LEVELS.map(level => {
            const def = LEVEL_DEFINITIONS[level];
            const count = exercises.filter(e => e.difficulty === level).length;
            const isActive = activeLevel === level;
            return (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                className={`px-6 py-3 font-bold brutal-border flex items-center gap-2 transition-all ${
                  isActive
                    ? `${def.color} brutal-shadow-sm translate-x-[2px] translate-y-[2px]`
                    : 'bg-ph-surface brutal-shadow hover:bg-ph-dark/5'
                }`}
              >
                {def.label}
                <span className={`font-mono text-xs px-1.5 py-0.5 brutal-border ${isActive ? 'bg-black/10' : 'bg-ph-dark/10'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <p className="font-mono text-xs font-bold opacity-60">{LEVEL_DEFINITIONS[activeLevel].tagline}</p>
      </div>

      {/* Pyodide status */}
      {status === 'loading' && (
        <div className="brutal-border bg-ph-blue/10 px-4 py-3 flex items-center gap-3 font-mono text-sm font-bold">
          <div className="w-4 h-4 border-2 border-ph-blue border-t-transparent rounded-full animate-spin shrink-0" />
          Loading Python runtime (Pyodide)... this may take 15–30s on first load.
        </div>
      )}
      {status === 'error' && (
        <div className="brutal-border border-ph-red bg-ph-red/10 px-4 py-3 font-mono text-sm font-bold text-ph-red">
          Failed to load Pyodide: {errorMessage}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-3">
          {/* Topic filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTopicFilter('all')}
              className={`px-3 py-1 font-mono text-xs font-bold brutal-border transition-colors ${
                topicFilter === 'all' ? 'bg-ph-dark text-ph-surface' : 'bg-ph-surface hover:bg-ph-dark/5'
              }`}
            >
              ALL TOPICS
            </button>
            {ALL_TOPICS.map(t => (
              <button
                key={t}
                onClick={() => setTopicFilter(t)}
                className={`px-3 py-1 font-mono text-xs font-bold brutal-border transition-colors ${
                  topicFilter === t ? 'bg-ph-dark text-ph-surface' : 'bg-ph-surface hover:bg-ph-dark/5'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`px-3 py-1 font-mono text-xs font-bold brutal-border transition-colors ${
                  typeFilter === f.value ? 'bg-ph-dark text-ph-surface' : 'bg-ph-surface hover:bg-ph-dark/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Exercise list */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map(ex => (
              <button
                key={ex.id}
                onClick={() => setActiveId(ex.id)}
                className={`w-full text-left p-3 brutal-border flex items-start gap-3 transition-all ${
                  activeId === ex.id
                    ? 'bg-ph-dark text-ph-surface brutal-shadow-sm translate-x-[2px] translate-y-[2px]'
                    : 'bg-ph-surface brutal-shadow hover:bg-ph-dark/5'
                }`}
              >
                <span className={`mt-0.5 px-1.5 py-0.5 brutal-border flex items-center gap-1 text-xs font-bold shrink-0 ${TYPE_COLOR[ex.type]}`}>
                  {TYPE_ICON[ex.type]}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-sm leading-tight">{ex.title}</div>
                  <div className="font-mono text-xs opacity-70 mt-0.5">{ex.topic}</div>
                </div>
                {activeId === ex.id && <ChevronRight className="w-4 h-4 shrink-0 ml-auto mt-0.5" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="brutal-border bg-ph-surface p-6 text-center space-y-2">
                <p className="font-bold text-sm">No exercises yet</p>
                <p className="font-mono text-xs opacity-60">Check back soon.</p>
              </div>
            )}
          </div>
        </div>

        {/* Exercise panel */}
        <div className="flex-1 min-w-0 space-y-4">
          {!exercise ? (
            <div className="brutal-card p-12 text-center space-y-3 bg-ph-surface">
              <p className="text-2xl font-bold">{LEVEL_DEFINITIONS[activeLevel].label} — Coming Soon</p>
              <p className="font-mono text-sm opacity-60">{LEVEL_DEFINITIONS[activeLevel].goal}</p>
            </div>
          ) : (<>
          {/* Header */}
          <div className="border-b-4 border-ph-dark pb-4">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className={`px-2 py-1 brutal-border flex items-center gap-1.5 text-xs font-bold font-mono ${TYPE_COLOR[exercise.type]}`}>
                {TYPE_ICON[exercise.type]} {EXERCISE_TYPE_LABELS[exercise.type].toUpperCase()}
              </span>
              <span className="brutal-border px-2 py-1 text-xs font-bold font-mono bg-ph-surface">{exercise.topic}</span>
              <span className={`brutal-border px-2 py-1 text-xs font-bold font-mono ${LEVEL_DEFINITIONS[exercise.difficulty].color}`}>
                {LEVEL_DEFINITIONS[exercise.difficulty].label.toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-bold">{exercise.title}</h2>
            <p className="font-mono text-sm mt-1 opacity-70">{exercise.description}</p>
          </div>

          {/* Code area */}
          {exercise.type === 'fill_blank' && (
            <FillBlankEditor
              key={exercise.id}
              starterCode={exercise.starter_code}
              onChange={setUserCode}
            />
          )}

          {(exercise.type === 'write_from_scratch' || exercise.type === 'fix_bug') && (
            <textarea
              value={userCode}
              onChange={e => setUserCode(e.target.value)}
              spellCheck={false}
              rows={12}
              className="w-full bg-[#1d1d1d] text-[#e5e7eb] font-mono text-sm p-5 brutal-border resize-y focus:outline-none focus:ring-2 focus:ring-ph-blue leading-relaxed"
            />
          )}

          {exercise.type === 'predict_output' && (
            <div className="space-y-4">
              <pre className="bg-[#1d1d1d] text-[#e5e7eb] font-mono text-sm p-5 brutal-border overflow-x-auto leading-relaxed whitespace-pre">
                {exercise.starter_code}
              </pre>
              <div className="space-y-2">
                <label className="block font-bold uppercase text-sm">Your Answer</label>
                <textarea
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  placeholder={`Type the exact output here...\n(one line per line)`}
                  rows={4}
                  className="w-full bg-ph-bg font-mono text-sm p-4 brutal-border resize-none focus:outline-none focus:ring-2 focus:ring-ph-blue"
                />
              </div>
            </div>
          )}

          {/* Hint */}
          <div className="space-y-2">
            <button
              onClick={() => setShowHint(h => !h)}
              className="brutal-button bg-ph-surface px-4 py-2 font-bold text-sm flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4 text-ph-yellow" />
              {showHint ? 'HIDE HINT' : 'SHOW HINT'}
            </button>
            {showHint && (
              <div className="brutal-border border-ph-yellow bg-ph-yellow/10 p-4">
                <p className="font-mono text-sm font-bold">{exercise.hint}</p>
              </div>
            )}
          </div>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={!canRun}
            className="brutal-button bg-ph-blue text-white px-8 py-3 font-bold flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                RUNNING...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                {exercise.type === 'predict_output' ? 'CHECK ANSWER' : 'RUN CODE'}
              </>
            )}
          </button>

          {/* Output panel */}
          {(runResult || testResults.length > 0) && (
            <div className="space-y-3">
              {/* Terminal output (not for predict_output) */}
              {exercise.type !== 'predict_output' && runResult && (
                <div className="bg-[#1d1d1d] brutal-border p-4 font-mono text-sm leading-relaxed">
                  <div className="text-ph-green/50 text-xs font-bold mb-2">// OUTPUT</div>
                  {runResult.error ? (
                    <span className="text-ph-red whitespace-pre-wrap">{runResult.error}</span>
                  ) : (
                    <>
                      <span className="text-ph-green whitespace-pre-wrap">
                        {runResult.stdout || '(no output)'}
                      </span>
                      {runResult.stderr && (
                        <div className="text-ph-yellow mt-2 whitespace-pre-wrap">{runResult.stderr}</div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Test results */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase text-sm">
                  Test Results —{' '}
                  <span className="text-ph-green">{testResults.filter(r => r.passed).length} passed</span>
                  {' / '}
                  <span className="text-ph-red">{testResults.filter(r => !r.passed).length} failed</span>
                </h4>
                {testResults.map((tr, i) => (
                  <div
                    key={i}
                    className={`brutal-border p-3 flex items-start justify-between gap-4 font-mono text-sm ${
                      tr.passed ? 'bg-ph-green/10' : 'bg-ph-red/10'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold">{tr.test_case.description}</div>
                      {!tr.passed && (
                        <div className="mt-1 opacity-80 text-xs space-y-0.5">
                          <div>Expected: <span className="font-bold">{tr.test_case.expected_output || '(empty)'}</span></div>
                          <div>Got: <span className="font-bold">{tr.error || tr.actual_output || '(empty)'}</span></div>
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 brutal-border font-bold text-xs shrink-0 ${tr.passed ? 'bg-ph-green text-black' : 'bg-ph-red text-white'}`}>
                      {tr.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          </>)}
        </div>
      </div>
    </div>
  );
}

// ─── FillBlankEditor ─────────────────────────────────────────────────────────

function FillBlankEditor({ starterCode, onChange }: {
  starterCode: string;
  onChange: (code: string) => void;
}) {
  const parts = starterCode.split('____');
  const [answers, setAnswers] = useState<string[]>(() => Array(parts.length - 1).fill(''));

  // Notify parent of initial (empty) code on mount
  useEffect(() => {
    const reconstructed = parts.reduce((acc, part, i) => acc + part + (answers[i] ?? ''), '');
    onChange(reconstructed);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (idx: number, val: string) => {
    const next = [...answers];
    next[idx] = val;
    setAnswers(next);
    const reconstructed = parts.reduce((acc, part, i) => acc + part + (next[i] ?? ''), '');
    onChange(reconstructed);
  };

  return (
    <div className="bg-[#1d1d1d] brutal-border p-5 font-mono text-sm leading-relaxed overflow-x-auto">
      <div className="text-ph-green/50 text-xs font-bold mb-3">// Fill in the blanks</div>
      <pre className="whitespace-pre-wrap">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            <span className="text-[#e5e7eb]">{part}</span>
            {i < parts.length - 1 && (
              <input
                type="text"
                value={answers[i]}
                onChange={e => handleChange(i, e.target.value)}
                placeholder="____"
                className="bg-ph-yellow text-ph-dark font-mono font-bold px-1 focus:outline-none focus:bg-ph-yellow/80 border-b-2 border-ph-yellow min-w-[4ch] inline-block align-baseline"
                style={{ width: `${Math.max((answers[i]?.length ?? 0) + 2, 4)}ch` }}
                spellCheck={false}
              />
            )}
          </React.Fragment>
        ))}
      </pre>
    </div>
  );
}
