'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Settings, User, Plus, LayoutDashboard, CheckSquare, Code, Play, ArrowRight, ArrowLeft, Check, BookOpen, Clock, Moon, Sun, Shield, ShieldOff, AlertTriangle, Terminal, ChevronDown, ChevronRight, Info, Search, Database, ListChecks, Shuffle, X, Eye, RefreshCw, Link, BarChart3, Download, Copy, ExternalLink, Mail, Printer } from 'lucide-react';
import { PracticeView } from '@/app/practice-view';
import {
  getAllQuestions,
  getQuestions,
  getAvailableCount,
  ALL_TOPICS,
  type BankQuestion,
  type MCQuestion,
  type OpenQuestion,
  type CodingQuestion,
  type Topic,
  type Difficulty,
  type QuestionType,
} from '@/lib/question-bank';
import { buildTest, getDefaultConfig, getSwapCandidates, type TestConfig, type AssembledTest, type SelectionMode } from '@/lib/question-bank/test-builder';
import { usePyodide } from '@/lib/hooks/use-pyodide';

type ViewMode = 'admin' | 'taker' | 'practice';
type AdminTab = 'dashboard' | 'create' | 'bank' | 'results';
type TakerTab = 'list' | 'take';

const TOPICS = ALL_TOPICS;

interface MockTest {
  id: string;
  name: string;
  topics: string[];
  duration: string;
  questions: number;
  proctoring_enabled: boolean;
  assembledTest?: AssembledTest;
  supabaseId?: string; // UUID from Supabase
  status?: 'draft' | 'published';
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [takerTab, setTakerTab] = useState<TakerTab>('list');
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tests, setTests] = useState<MockTest[]>([]);

  // Fetch saved tests from Supabase on mount
  useEffect(() => {
    async function fetchTests() {
      try {
        const res = await fetch('/api/tests');
        if (!res.ok) return;
        const data = await res.json();
        const loaded: MockTest[] = (data || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          topics: t.config_json?.topics || [],
          duration: `${t.duration_minutes} min`,
          questions: t.total_questions,
          proctoring_enabled: t.config_json?.proctoring_enabled || false,
          supabaseId: t.id,
          status: t.status || 'published',
        }));
        setTests(loaded);
      } catch (err) {
        console.error('Failed to fetch tests:', err);
      }
    }
    fetchTests();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleTestCreated = async (test: MockTest) => {
    // Persist to Supabase
    if (test.assembledTest) {
      try {
        const res = await fetch('/api/tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: test.name,
            config_json: test.assembledTest.config,
            questions_json: test.assembledTest.questions,
            duration_minutes: test.assembledTest.config.duration,
            total_questions: test.assembledTest.questions.length,
            status: 'published',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          test.supabaseId = data.id;
          test.status = 'published';
        }
      } catch (err) {
        console.error('Failed to persist test to Supabase:', err);
      }
    }
    setTests(prev => [...prev, test]);
    setAdminTab('dashboard');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto transition-colors duration-200">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-ph-red brutal-border brutal-shadow flex items-center justify-center">
            <Code className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase">Py<span className="text-ph-red">Test</span></h1>
            <p className="font-mono text-sm font-bold opacity-70">v2.0.0 // Assessment Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 bg-ph-surface brutal-border brutal-shadow-sm flex items-center justify-center hover:bg-ph-dark/5 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="flex p-1 bg-ph-surface brutal-border brutal-shadow-sm">
            <button
              onClick={() => setViewMode('admin')}
              className={`px-6 py-2 font-bold flex items-center gap-2 transition-colors ${viewMode === 'admin' ? 'bg-ph-yellow text-black brutal-border' : 'hover:bg-ph-dark/5'}`}
            >
              <Settings className="w-4 h-4" />
              ADMIN
            </button>
            <button
              onClick={() => setViewMode('taker')}
              className={`px-6 py-2 font-bold flex items-center gap-2 transition-colors ${viewMode === 'taker' ? 'bg-ph-green text-black brutal-border' : 'hover:bg-ph-dark/5'}`}
            >
              <User className="w-4 h-4" />
              TAKER
            </button>
            <button
              onClick={() => setViewMode('practice')}
              className={`px-6 py-2 font-bold flex items-center gap-2 transition-colors ${viewMode === 'practice' ? 'bg-ph-red text-white brutal-border' : 'hover:bg-ph-dark/5'}`}
            >
              <Terminal className="w-4 h-4" />
              PRACTICE
            </button>
          </div>
        </div>
      </header>

      <main>
        {viewMode === 'admin' && (
          <AdminView tab={adminTab} setTab={setAdminTab} tests={tests} onTestCreated={handleTestCreated} />
        )}
        {viewMode === 'taker' && (
          <TakerView tab={takerTab} setTab={setTakerTab} selectedTest={selectedTest} setSelectedTest={setSelectedTest} tests={tests} />
        )}
        {viewMode === 'practice' && (
          <PracticeView />
        )}
      </main>
    </div>
  );
}

function AdminView({ tab, setTab, tests, onTestCreated }: { tab: AdminTab; setTab: (t: AdminTab) => void; tests: MockTest[]; onTestCreated: (t: MockTest) => void }) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64 flex flex-col gap-4">
        <button
          onClick={() => setTab('dashboard')}
          className={`brutal-button flex items-center gap-3 p-4 font-bold text-left ${tab === 'dashboard' ? 'bg-ph-blue text-white' : 'bg-ph-surface'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          DASHBOARD
        </button>
        <button
          onClick={() => setTab('bank')}
          className={`brutal-button flex items-center gap-3 p-4 font-bold text-left ${tab === 'bank' ? 'bg-ph-yellow text-black' : 'bg-ph-surface'}`}
        >
          <Database className="w-5 h-5" />
          QUESTION BANK
        </button>
        <button
          onClick={() => setTab('create')}
          className={`brutal-button flex items-center gap-3 p-4 font-bold text-left ${tab === 'create' ? 'bg-ph-red text-white' : 'bg-ph-surface'}`}
        >
          <Plus className="w-5 h-5" />
          CREATE TEST
        </button>
        <button
          onClick={() => setTab('results')}
          className={`brutal-button flex items-center gap-3 p-4 font-bold text-left ${tab === 'results' ? 'bg-ph-green text-black' : 'bg-ph-surface'}`}
        >
          <BarChart3 className="w-5 h-5" />
          RESULTS
        </button>
      </div>

      <div className="flex-1">
        {tab === 'dashboard' && <AdminDashboard setTab={setTab} tests={tests} />}
        {tab === 'bank' && <QuestionBankBrowser />}
        {tab === 'create' && <AdminCreateTest setTab={setTab} onTestCreated={onTestCreated} />}
        {tab === 'results' && <AdminResultsDashboard tests={tests} />}
      </div>
    </div>
  );
}

function AdminDashboard({ setTab, tests }: { setTab: (t: AdminTab) => void; tests: MockTest[] }) {
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);

  if (selectedTest) {
    return <TestDetailView test={selectedTest} onBack={() => setSelectedTest(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b-4 border-ph-dark pb-4">
        <div>
          <h2 className="text-4xl font-bold uppercase">Dashboard</h2>
          <p className="font-mono mt-2 font-bold">Manage your Python assessments.</p>
        </div>
        <button onClick={() => setTab('create')} className="brutal-button bg-ph-yellow text-black px-6 py-3 font-bold flex items-center gap-2">
          <Plus className="w-5 h-5" /> NEW TEST
        </button>
      </div>

      {/* Question Bank Stats */}
      <div className="brutal-card p-6 bg-ph-surface">
        <h3 className="text-lg font-bold uppercase mb-4">Question Bank</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            const all = getAllQuestions();
            const mc = all.filter(q => q.type === 'multiple_choice').length;
            const oa = all.filter(q => q.type === 'open_answer').length;
            const code = all.filter(q => q.type === 'coding').length;
            return (
              <>
                <div className="brutal-border p-3 text-center">
                  <div className="text-2xl font-bold">{all.length}</div>
                  <div className="font-mono text-xs font-bold opacity-70">TOTAL</div>
                </div>
                <div className="brutal-border p-3 text-center">
                  <div className="text-2xl font-bold text-ph-blue">{mc}</div>
                  <div className="font-mono text-xs font-bold opacity-70">MC</div>
                </div>
                <div className="brutal-border p-3 text-center">
                  <div className="text-2xl font-bold text-ph-green">{oa}</div>
                  <div className="font-mono text-xs font-bold opacity-70">OPEN</div>
                </div>
                <div className="brutal-border p-3 text-center">
                  <div className="text-2xl font-bold text-ph-red">{code}</div>
                  <div className="font-mono text-xs font-bold opacity-70">CODING</div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {tests.map((test) => (
          <TestDashboardCard key={test.id} test={test} onSelect={() => setSelectedTest(test)} />
        ))}
      </div>
    </div>
  );
}

// ─── Question Bank Browser ──────────────────────────────────────────────────

const TYPE_LABELS: Record<QuestionType, string> = { multiple_choice: 'MC', open_answer: 'OPEN', coding: 'CODE' };
const TYPE_COLORS: Record<QuestionType, string> = { multiple_choice: 'bg-ph-blue text-white', open_answer: 'bg-ph-green text-black', coding: 'bg-ph-red text-white' };
const DIFF_COLORS: Record<Difficulty, string> = { beginner: 'bg-ph-green text-black', intermediate: 'bg-ph-yellow text-black', advanced: 'bg-ph-red text-white' };

function getQuestionPreview(q: BankQuestion): string {
  if (q.type === 'multiple_choice') return q.body;
  if (q.type === 'open_answer') return q.body;
  return q.title + ' — ' + q.description;
}

function QuestionBankBrowser() {
  const allQuestions = useMemo(() => getAllQuestions(), []);
  const [topicFilter, setTopicFilter] = useState<Topic | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return allQuestions.filter(q => {
      if (topicFilter !== 'all' && q.topic !== topicFilter) return false;
      if (typeFilter !== 'all' && q.type !== typeFilter) return false;
      if (diffFilter !== 'all' && q.difficulty !== diffFilter) return false;
      if (searchText) {
        const text = searchText.toLowerCase();
        const preview = getQuestionPreview(q).toLowerCase();
        const id = q.id.toLowerCase();
        if (!preview.includes(text) && !id.includes(text) && !q.topic.toLowerCase().includes(text)) return false;
      }
      return true;
    });
  }, [allQuestions, topicFilter, typeFilter, diffFilter, searchText]);

  return (
    <div className="space-y-6">
      <div className="border-b-4 border-ph-dark pb-4">
        <h2 className="text-4xl font-bold uppercase">Question Bank</h2>
        <p className="font-mono mt-2 font-bold">Browse all {allQuestions.length} questions across {TOPICS.length} topics.</p>
      </div>

      {/* Filters */}
      <div className="brutal-card p-6 bg-ph-surface space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-12 pr-4 py-3 brutal-border bg-ph-bg font-mono focus:outline-none focus:ring-2 focus:ring-ph-yellow"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Topic filter */}
          <div className="space-y-1">
            <label className="font-bold text-xs uppercase opacity-60">Topic</label>
            <div className="flex flex-wrap gap-1">
              <button onClick={() => setTopicFilter('all')} className={`px-3 py-1 brutal-border font-mono text-xs font-bold ${topicFilter === 'all' ? 'bg-ph-dark text-ph-surface' : 'bg-ph-surface'}`}>ALL</button>
              {TOPICS.map(t => (
                <button key={t} onClick={() => setTopicFilter(t)} className={`px-3 py-1 brutal-border font-mono text-xs font-bold ${topicFilter === t ? 'bg-ph-dark text-ph-surface' : 'bg-ph-surface'}`}>{t}</button>
              ))}
            </div>
          </div>
          {/* Type filter */}
          <div className="space-y-1">
            <label className="font-bold text-xs uppercase opacity-60">Type</label>
            <div className="flex gap-1">
              <button onClick={() => setTypeFilter('all')} className={`px-3 py-1 brutal-border font-mono text-xs font-bold ${typeFilter === 'all' ? 'bg-ph-dark text-ph-surface' : 'bg-ph-surface'}`}>ALL</button>
              {(['multiple_choice', 'open_answer', 'coding'] as QuestionType[]).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1 brutal-border font-mono text-xs font-bold ${typeFilter === t ? TYPE_COLORS[t] : 'bg-ph-surface'}`}>{TYPE_LABELS[t]}</button>
              ))}
            </div>
          </div>
          {/* Difficulty filter */}
          <div className="space-y-1">
            <label className="font-bold text-xs uppercase opacity-60">Difficulty</label>
            <div className="flex gap-1">
              <button onClick={() => setDiffFilter('all')} className={`px-3 py-1 brutal-border font-mono text-xs font-bold ${diffFilter === 'all' ? 'bg-ph-dark text-ph-surface' : 'bg-ph-surface'}`}>ALL</button>
              {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map(d => (
                <button key={d} onClick={() => setDiffFilter(d)} className={`px-3 py-1 brutal-border font-mono text-xs font-bold capitalize ${diffFilter === d ? DIFF_COLORS[d] : 'bg-ph-surface'}`}>{d}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="font-mono text-sm font-bold opacity-60">
          Showing {filtered.length} of {allQuestions.length} questions
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {filtered.map(q => (
          <QuestionCard key={q.id} question={q} expanded={expandedId === q.id} onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)} />
        ))}
        {filtered.length === 0 && (
          <div className="brutal-card p-12 text-center bg-ph-surface">
            <p className="font-bold text-lg">No questions match your filters.</p>
            <p className="font-mono text-sm opacity-60 mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ question: q, expanded, onToggle, selectable, selected, onSelect }: {
  question: BankQuestion;
  expanded: boolean;
  onToggle: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <div className={`brutal-border bg-ph-surface transition-all ${selected ? 'ring-2 ring-ph-blue' : ''}`}>
      <div className="p-4 flex items-start gap-3 cursor-pointer" onClick={onToggle}>
        {selectable && (
          <button
            onClick={e => { e.stopPropagation(); onSelect?.(); }}
            className={`w-6 h-6 brutal-border flex items-center justify-center shrink-0 mt-0.5 ${selected ? 'bg-ph-blue text-white' : 'bg-ph-surface'}`}
          >
            {selected && <Check className="w-4 h-4" />}
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`px-2 py-0.5 brutal-border text-xs font-bold font-mono ${TYPE_COLORS[q.type]}`}>{TYPE_LABELS[q.type]}</span>
            <span className="brutal-border px-2 py-0.5 text-xs font-bold font-mono bg-ph-surface">{q.topic}</span>
            <span className={`brutal-border px-2 py-0.5 text-xs font-bold font-mono capitalize ${DIFF_COLORS[q.difficulty]}`}>{q.difficulty}</span>
            {q.subtopic && <span className="font-mono text-xs opacity-50">{q.subtopic}</span>}
            <span className="font-mono text-xs opacity-30 ml-auto">{q.id}</span>
          </div>
          <p className="font-bold text-sm leading-snug truncate">{getQuestionPreview(q)}</p>
        </div>
        <ChevronRight className={`w-4 h-4 shrink-0 mt-1 opacity-40 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>

      {expanded && (
        <div className="border-t-2 border-ph-dark p-4 space-y-3 bg-ph-bg/50">
          {q.type === 'multiple_choice' && (
            <>
              <p className="font-bold whitespace-pre-line">{q.body}</p>
              <div className="space-y-1">
                {q.options.map((opt, i) => (
                  <div key={i} className={`font-mono text-sm px-3 py-1.5 brutal-border ${i === q.correct_index ? 'bg-ph-green/20 font-bold' : 'bg-ph-surface'}`}>
                    <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][i]}.</span>{opt}
                    {i === q.correct_index && <span className="ml-2 text-ph-green text-xs font-bold">CORRECT</span>}
                  </div>
                ))}
              </div>
              <div className="font-mono text-xs opacity-70 bg-ph-surface brutal-border p-2">
                <span className="font-bold">Explanation:</span> {q.explanation}
              </div>
            </>
          )}
          {q.type === 'open_answer' && (
            <>
              <p className="font-bold whitespace-pre-line">{q.body}</p>
              <div className="font-mono text-sm">
                <span className="font-bold">Acceptable answers:</span>{' '}
                {q.acceptable_answers.map((a, i) => (
                  <span key={i} className="inline-block bg-ph-green/20 brutal-border px-2 py-0.5 mr-1 mb-1">{a}</span>
                ))}
              </div>
              <div className="font-mono text-xs opacity-70 bg-ph-surface brutal-border p-2">
                <span className="font-bold">Explanation:</span> {q.explanation}
              </div>
              {q.grading_hint && (
                <div className="font-mono text-xs opacity-50">
                  <span className="font-bold">Grading hint:</span> {q.grading_hint}
                </div>
              )}
            </>
          )}
          {q.type === 'coding' && (
            <>
              <div>
                <span className="font-bold">{q.title}</span>
                <span className="font-mono text-xs ml-2 opacity-50">{q.exercise_type.replace(/_/g, ' ')}</span>
              </div>
              <p className="font-mono text-sm opacity-70">{q.description}</p>
              <div className="space-y-2">
                <div>
                  <div className="font-mono text-xs font-bold opacity-50 mb-1">STARTER CODE</div>
                  <pre className="bg-[#1d1d1d] text-[#e5e7eb] font-mono text-xs p-3 brutal-border overflow-x-auto whitespace-pre">{q.starter_code}</pre>
                </div>
                <div>
                  <div className="font-mono text-xs font-bold opacity-50 mb-1">SOLUTION</div>
                  <pre className="bg-[#1d1d1d] text-[#b8e986] font-mono text-xs p-3 brutal-border overflow-x-auto whitespace-pre">{q.solution_code}</pre>
                </div>
              </div>
              <div className="font-mono text-xs opacity-60">
                <span className="font-bold">Test cases:</span> {q.test_cases.length} · <span className="font-bold">Hints:</span> {q.hints.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Admin Create Test ──────────────────────────────────────────────────────

function AdminCreateTest({ setTab, onTestCreated }: { setTab: (t: AdminTab) => void; onTestCreated: (t: MockTest) => void }) {
  const [config, setConfig] = useState<TestConfig>(getDefaultConfig);
  const [proctoringEnabled, setProctoringEnabled] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [autoPreviewQuestions, setAutoPreviewQuestions] = useState<BankQuestion[] | null>(null);
  const [swapTarget, setSwapTarget] = useState<BankQuestion | null>(null);

  const allQuestions = useMemo(() => getAllQuestions(), []);

  const availableCounts = useMemo(() => {
    const difficulties: Difficulty[] | undefined =
      config.difficulty === 'mixed' ? undefined : [config.difficulty];
    return getAvailableCount({
      topics: config.selectedTopics.length > 0 ? config.selectedTopics : undefined,
      difficulties,
    });
  }, [config.selectedTopics, config.difficulty]);

  const totalSelected = config.selectionMode === 'manual'
    ? config.manuallySelected.length
    : (config.questionTypes.multiple_choice.enabled ? config.questionTypes.multiple_choice.count : 0)
      + (config.questionTypes.open_answer.enabled ? config.questionTypes.open_answer.count : 0)
      + (config.questionTypes.coding.enabled ? config.questionTypes.coding.count : 0);

  const toggleTopic = (topic: Topic) => {
    setConfig(prev => ({
      ...prev,
      selectedTopics: prev.selectedTopics.includes(topic)
        ? prev.selectedTopics.filter(t => t !== topic)
        : [...prev.selectedTopics, topic],
    }));
  };

  const toggleQuestion = (id: string) => {
    setConfig(prev => ({
      ...prev,
      manuallySelected: prev.manuallySelected.includes(id)
        ? prev.manuallySelected.filter(qid => qid !== id)
        : [...prev.manuallySelected, id],
    }));
  };

  // Generate test
  const handleGenerate = () => {
    const effectiveConfig = {
      ...config,
      selectedTopics: config.selectionMode === 'manual'
        ? [...new Set(allQuestions.filter(q => config.manuallySelected.includes(q.id)).map(q => q.topic))] as Topic[]
        : config.selectedTopics,
    };
    const { test } = buildTest(effectiveConfig);
    if (test) {
      const topics = config.selectionMode === 'manual'
        ? [...new Set(test.questions.map(q => q.topic))]
        : config.selectedTopics;
      const mockTest: MockTest = {
        id: test.id,
        name: test.name,
        topics,
        duration: `${config.duration} min`,
        questions: test.questions.length,
        proctoring_enabled: proctoringEnabled,
        assembledTest: test,
      };
      onTestCreated(mockTest);
    }
  };

  // Preview auto-selected questions before generating
  const handlePreview = () => {
    const effectiveConfig = {
      ...config,
      selectedTopics: config.selectedTopics,
    };
    const { test } = buildTest(effectiveConfig);
    if (test) {
      setAutoPreviewQuestions(test.questions);
    }
  };

  // Generate test from previewed questions
  const handleGenerateFromPreview = () => {
    if (!autoPreviewQuestions || autoPreviewQuestions.length === 0) return;
    const topics = [...new Set(autoPreviewQuestions.map(q => q.topic))];
    const mockTest: MockTest = {
      id: `test-${Date.now()}`,
      name: config.name,
      topics,
      duration: `${config.duration} min`,
      questions: autoPreviewQuestions.length,
      proctoring_enabled: proctoringEnabled,
      assembledTest: {
        id: `test-${Date.now()}`,
        name: config.name,
        questions: autoPreviewQuestions,
        config,
      },
    };
    onTestCreated(mockTest);
  };

  const removePreviewQuestion = (id: string) => {
    setAutoPreviewQuestions(prev => prev ? prev.filter(q => q.id !== id) : null);
  };

  const handleSwap = (oldId: string, newQuestion: BankQuestion) => {
    setAutoPreviewQuestions(prev =>
      prev ? prev.map(q => q.id === oldId ? newQuestion : q) : null
    );
    setSwapTarget(null);
  };

  const canGenerate = config.name && totalSelected > 0 && (config.selectionMode === 'manual' || config.selectedTopics.length > 0);

  // ─── PREVIEW PANEL (auto mode) ─────────────────────────────────────────────
  if (autoPreviewQuestions !== null) {
    const mcCount = autoPreviewQuestions.filter(q => q.type === 'multiple_choice').length;
    const oaCount = autoPreviewQuestions.filter(q => q.type === 'open_answer').length;
    const codeCount = autoPreviewQuestions.filter(q => q.type === 'coding').length;
    const previewTopics = [...new Set(autoPreviewQuestions.map(q => q.topic))];

    return (
      <div className="space-y-8 max-w-3xl">
        <div className="border-b-4 border-ph-dark pb-4">
          <h2 className="text-4xl font-bold uppercase">Preview Test</h2>
          <p className="font-mono mt-2 font-bold">Review auto-selected questions before generating.</p>
        </div>

        <div className="brutal-card p-8 space-y-6 bg-ph-surface">
          {/* Header with back button */}
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold uppercase">{config.name}</h3>
            <button
              onClick={() => setAutoPreviewQuestions(null)}
              className="brutal-button bg-ph-surface px-5 py-2 font-bold flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> BACK TO CONFIG
            </button>
          </div>

          {/* Summary badges */}
          <div className="flex flex-wrap gap-2">
            <span className="brutal-border bg-ph-dark text-ph-surface px-3 py-1 font-mono text-xs font-bold">{autoPreviewQuestions.length} TOTAL</span>
            {mcCount > 0 && <span className="brutal-border bg-ph-blue text-white px-3 py-1 font-mono text-xs font-bold">{mcCount} MC</span>}
            {oaCount > 0 && <span className="brutal-border bg-ph-green text-black px-3 py-1 font-mono text-xs font-bold">{oaCount} OPEN</span>}
            {codeCount > 0 && <span className="brutal-border bg-ph-red text-white px-3 py-1 font-mono text-xs font-bold">{codeCount} CODE</span>}
            {previewTopics.map(t => <span key={t} className="brutal-border bg-ph-surface px-2 py-1 font-mono text-xs font-bold">{t}</span>)}
          </div>

          {/* Question list */}
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {autoPreviewQuestions.map((q, i) => (
              <div key={q.id} className="brutal-border p-3 flex items-center gap-3 bg-ph-surface">
                <span className="font-mono text-xs font-bold opacity-40 w-6 text-right shrink-0">{i + 1}.</span>
                <span className={`px-2 py-0.5 brutal-border text-xs font-bold font-mono shrink-0 ${TYPE_COLORS[q.type]}`}>{TYPE_LABELS[q.type]}</span>
                <span className="brutal-border px-2 py-0.5 text-xs font-bold font-mono shrink-0">{q.topic}</span>
                <span className={`brutal-border px-2 py-0.5 text-xs font-bold font-mono shrink-0 capitalize ${DIFF_COLORS[q.difficulty]}`}>{q.difficulty}</span>
                <span className="font-bold text-sm truncate flex-1">{getQuestionPreview(q)}</span>
                <button
                  onClick={() => setSwapTarget(q)}
                  className="shrink-0 w-6 h-6 brutal-border bg-ph-blue/10 hover:bg-ph-blue/20 flex items-center justify-center"
                  title="Swap question"
                >
                  <RefreshCw className="w-3 h-3 text-ph-blue" />
                </button>
                <button
                  onClick={() => removePreviewQuestion(q.id)}
                  className="shrink-0 w-6 h-6 brutal-border bg-ph-red/10 hover:bg-ph-red/20 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-ph-red" />
                </button>
              </div>
            ))}
            {swapTarget && (
              <SwapQuestionModal
                question={swapTarget}
                alreadySelectedIds={autoPreviewQuestions.map(q => q.id)}
                onSwap={(newQ) => handleSwap(swapTarget.id, newQ)}
                onClose={() => setSwapTarget(null)}
              />
            )}
            {autoPreviewQuestions.length === 0 && (
              <div className="brutal-border bg-ph-bg p-8 text-center">
                <p className="font-bold">All questions removed.</p>
                <p className="font-mono text-sm opacity-60 mt-1">Re-shuffle to get new questions or go back to config.</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t-2 border-ph-dark">
            <button
              onClick={handlePreview}
              className="brutal-button bg-ph-surface px-6 py-4 font-bold text-lg flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" /> RE-SHUFFLE
            </button>
            <button
              onClick={handleGenerateFromPreview}
              className="brutal-button bg-ph-blue text-white px-8 py-4 font-bold text-lg flex-1 flex items-center justify-center gap-2"
              disabled={autoPreviewQuestions.length === 0}
            >
              GENERATE TEST <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── CONFIG PANEL (default view) ──────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="border-b-4 border-ph-dark pb-4">
        <h2 className="text-4xl font-bold uppercase">Create Test</h2>
        <p className="font-mono mt-2 font-bold">Configure a new Python assessment.</p>
      </div>

      <div className="brutal-card p-8 space-y-8 bg-ph-surface">
        {/* Test Name */}
        <div className="space-y-3">
          <label className="block text-xl font-bold uppercase">Test Name</label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Midterm Python Evaluation"
            className="w-full p-4 text-lg brutal-border focus:outline-none focus:ring-4 focus:ring-ph-yellow/50 bg-ph-bg font-mono text-ph-dark placeholder-ph-dark/40"
          />
        </div>

        {/* Selection Mode Toggle */}
        <div className="space-y-3 pt-6 border-t-2 border-ph-dark">
          <label className="block text-xl font-bold uppercase">Selection Mode</label>
          <div className="flex gap-3">
            <button
              onClick={() => setConfig(prev => ({ ...prev, selectionMode: 'auto' }))}
              className={`flex-1 p-4 brutal-border font-bold flex items-center gap-3 transition-all ${
                config.selectionMode === 'auto' ? 'bg-ph-blue text-white brutal-shadow-sm translate-x-[2px] translate-y-[2px]' : 'bg-ph-surface brutal-shadow hover:bg-ph-dark/5'
              }`}
            >
              <Shuffle className="w-5 h-5" />
              <div className="text-left">
                <div>AUTO SELECT</div>
                <div className="text-xs opacity-70 font-mono">Pick by topic, type & count</div>
              </div>
            </button>
            <button
              onClick={() => setConfig(prev => ({ ...prev, selectionMode: 'manual' }))}
              className={`flex-1 p-4 brutal-border font-bold flex items-center gap-3 transition-all ${
                config.selectionMode === 'manual' ? 'bg-ph-yellow text-black brutal-shadow-sm translate-x-[2px] translate-y-[2px]' : 'bg-ph-surface brutal-shadow hover:bg-ph-dark/5'
              }`}
            >
              <ListChecks className="w-5 h-5" />
              <div className="text-left">
                <div>HAND PICK</div>
                <div className="text-xs opacity-70 font-mono">Choose individual questions</div>
              </div>
            </button>
          </div>
        </div>

        {/* AUTO MODE */}
        {config.selectionMode === 'auto' && (
          <>
            {/* Topics Selection */}
            <div className="space-y-4">
              <label className="block text-xl font-bold uppercase">Select Topics</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TOPICS.map(topic => {
                  const isSelected = config.selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={`p-4 brutal-border flex items-center justify-between transition-all ${
                        isSelected ? 'bg-ph-green text-black brutal-shadow-sm translate-x-[2px] translate-y-[2px]' : 'bg-ph-surface hover:bg-ph-dark/5 brutal-shadow'
                      }`}
                    >
                      <span className="font-bold text-lg">{topic}</span>
                      <div className={`w-6 h-6 brutal-border flex items-center justify-center ${isSelected ? 'bg-ph-dark text-ph-surface' : 'bg-ph-surface'}`}>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Types */}
            <div className="space-y-4 pt-6 border-t-2 border-ph-dark">
              <label className="block text-xl font-bold uppercase">Question Types</label>
              {(['multiple_choice', 'open_answer', 'coding'] as QuestionType[]).map(qType => {
                const labels: Record<QuestionType, string> = { multiple_choice: 'Multiple Choice', open_answer: 'Open Answer', coding: 'Coding Exercise' };
                const colors: Record<QuestionType, string> = { multiple_choice: 'bg-ph-blue', open_answer: 'bg-ph-green', coding: 'bg-ph-red' };
                const typeConfig = config.questionTypes[qType];
                const available = availableCounts[qType];
                const overLimit = typeConfig.enabled && typeConfig.count > available;

                return (
                  <div key={qType} className="brutal-border p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          questionTypes: {
                            ...prev.questionTypes,
                            [qType]: { ...prev.questionTypes[qType], enabled: !prev.questionTypes[qType].enabled },
                          },
                        }))}
                        className={`w-8 h-8 brutal-border flex items-center justify-center shrink-0 ${typeConfig.enabled ? `${colors[qType]} text-white` : 'bg-ph-surface'}`}
                      >
                        {typeConfig.enabled && <Check className="w-4 h-4" />}
                      </button>
                      <div>
                        <span className="font-bold">{labels[qType]}</span>
                        <span className="font-mono text-xs ml-2 opacity-60">({available} available)</span>
                      </div>
                    </div>
                    {typeConfig.enabled && (
                      <div className="flex items-center gap-2">
                        <label className="font-mono text-sm font-bold">Count:</label>
                        <input
                          type="number"
                          min={0}
                          max={available}
                          value={typeConfig.count}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            questionTypes: {
                              ...prev.questionTypes,
                              [qType]: { ...prev.questionTypes[qType], count: Math.max(0, parseInt(e.target.value) || 0) },
                            },
                          }))}
                          className={`w-20 p-2 brutal-border bg-ph-bg font-mono text-center ${overLimit ? 'border-ph-red ring-2 ring-ph-red/50' : ''}`}
                        />
                        {overLimit && (
                          <span className="text-ph-red text-xs font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Max {available}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Difficulty */}
            <div className="space-y-3 pt-6 border-t-2 border-ph-dark">
              <label className="block text-xl font-bold uppercase">Difficulty</label>
              <div className="flex flex-wrap gap-3">
                {(['mixed', 'beginner', 'intermediate', 'advanced'] as const).map(d => {
                  const labels: Record<string, string> = { mixed: 'Mixed', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
                  const colors: Record<string, string> = { mixed: 'bg-ph-dark text-ph-surface', beginner: 'bg-ph-green text-black', intermediate: 'bg-ph-yellow text-black', advanced: 'bg-ph-red text-white' };
                  return (
                    <button
                      key={d}
                      onClick={() => setConfig(prev => ({ ...prev, difficulty: d }))}
                      className={`px-5 py-2 brutal-border font-bold transition-all ${
                        config.difficulty === d ? `${colors[d]} brutal-shadow-sm translate-x-[2px] translate-y-[2px]` : 'bg-ph-surface brutal-shadow hover:bg-ph-dark/5'
                      }`}
                    >
                      {labels[d]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability Preview */}
            {config.selectedTopics.length > 0 && (
              <div className="brutal-border bg-ph-blue/10 p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-ph-blue shrink-0 mt-0.5" />
                <div className="font-mono text-sm font-bold">
                  <div>Available for selected topics & difficulty:</div>
                  <div className="mt-1 flex gap-4">
                    <span className="text-ph-blue">{availableCounts.multiple_choice} MC</span>
                    <span className="text-ph-green">{availableCounts.open_answer} Open</span>
                    <span className="text-ph-red">{availableCounts.coding} Coding</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* MANUAL MODE — Question Picker */}
        {config.selectionMode === 'manual' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xl font-bold uppercase">Selected Questions</label>
              <button
                onClick={() => setPickerOpen(true)}
                className="brutal-button bg-ph-yellow text-black px-5 py-2 font-bold flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> BROWSE & SELECT
              </button>
            </div>

            {config.manuallySelected.length === 0 ? (
              <div className="brutal-border bg-ph-bg p-8 text-center">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-bold">No questions selected yet.</p>
                <p className="font-mono text-sm opacity-60 mt-1">Click "Browse & Select" to pick questions from the bank.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Summary badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {(() => {
                    const selected = allQuestions.filter(q => config.manuallySelected.includes(q.id));
                    const mc = selected.filter(q => q.type === 'multiple_choice').length;
                    const oa = selected.filter(q => q.type === 'open_answer').length;
                    const code = selected.filter(q => q.type === 'coding').length;
                    const topics = [...new Set(selected.map(q => q.topic))];
                    return (
                      <>
                        <span className="brutal-border bg-ph-dark text-ph-surface px-3 py-1 font-mono text-xs font-bold">{selected.length} TOTAL</span>
                        {mc > 0 && <span className="brutal-border bg-ph-blue text-white px-3 py-1 font-mono text-xs font-bold">{mc} MC</span>}
                        {oa > 0 && <span className="brutal-border bg-ph-green text-black px-3 py-1 font-mono text-xs font-bold">{oa} OPEN</span>}
                        {code > 0 && <span className="brutal-border bg-ph-red text-white px-3 py-1 font-mono text-xs font-bold">{code} CODE</span>}
                        {topics.map(t => <span key={t} className="brutal-border bg-ph-surface px-2 py-1 font-mono text-xs font-bold">{t}</span>)}
                      </>
                    );
                  })()}
                </div>
                {/* Selected question list */}
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {config.manuallySelected.map(id => {
                    const q = allQuestions.find(q => q.id === id);
                    if (!q) return null;
                    return (
                      <div key={id} className="brutal-border p-3 flex items-center gap-3 bg-ph-surface">
                        <span className={`px-2 py-0.5 brutal-border text-xs font-bold font-mono shrink-0 ${TYPE_COLORS[q.type]}`}>{TYPE_LABELS[q.type]}</span>
                        <span className="brutal-border px-2 py-0.5 text-xs font-bold font-mono shrink-0">{q.topic}</span>
                        <span className={`brutal-border px-2 py-0.5 text-xs font-bold font-mono shrink-0 capitalize ${DIFF_COLORS[q.difficulty]}`}>{q.difficulty}</span>
                        <span className="font-bold text-sm truncate flex-1">{getQuestionPreview(q)}</span>
                        <button
                          onClick={() => toggleQuestion(id)}
                          className="shrink-0 w-6 h-6 brutal-border bg-ph-red/10 hover:bg-ph-red/20 flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-ph-red" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-2 gap-6 pt-6 border-t-2 border-ph-dark">
          <div className="space-y-3">
            <label className="block font-bold uppercase">Duration (mins)</label>
            <input
              type="number"
              value={config.duration}
              onChange={(e) => setConfig(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
              className="w-full p-3 brutal-border bg-ph-bg font-mono text-ph-dark"
            />
          </div>
          <div className="space-y-3">
            <label className="block font-bold uppercase">Total Questions</label>
            <div className="w-full p-3 brutal-border bg-ph-bg font-mono text-ph-dark">
              {totalSelected}
            </div>
          </div>
        </div>

        {/* Proctoring */}
        <div className="pt-6 border-t-2 border-ph-dark">
          <div className="flex items-center justify-between gap-4">
            <div>
              <label className="block font-bold uppercase">Proctoring</label>
              <p className="font-mono text-sm opacity-70 mt-1">
                Detect tab switches, window blur, and fullscreen exit. Auto-submits after 3 violations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setProctoringEnabled(p => !p)}
              className={`brutal-button px-6 py-3 font-bold flex items-center gap-2 shrink-0 ${proctoringEnabled ? 'bg-ph-red text-white' : 'bg-ph-surface'}`}
            >
              {proctoringEnabled ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
              {proctoringEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-8">
          <button
            onClick={() => setTab('dashboard')}
            className="brutal-button bg-ph-surface px-8 py-4 font-bold text-lg"
          >
            CANCEL
          </button>
          <button
            onClick={config.selectionMode === 'auto' ? handlePreview : handleGenerate}
            className="brutal-button bg-ph-blue text-white px-8 py-4 font-bold text-lg flex-1 flex items-center justify-center gap-2"
            disabled={!canGenerate}
          >
            {config.selectionMode === 'auto' ? (
              <><Eye className="w-5 h-5" /> PREVIEW TEST</>
            ) : (
              <>GENERATE TEST <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>

      {/* Question Picker Modal */}
      {pickerOpen && (
        <QuestionPickerModal
          allQuestions={allQuestions}
          selectedIds={config.manuallySelected}
          onToggle={toggleQuestion}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

function QuestionPickerModal({ allQuestions, selectedIds, onToggle, onClose }: {
  allQuestions: BankQuestion[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  const [topicFilter, setTopicFilter] = useState<Topic | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return allQuestions.filter(q => {
      if (topicFilter !== 'all' && q.topic !== topicFilter) return false;
      if (typeFilter !== 'all' && q.type !== typeFilter) return false;
      if (diffFilter !== 'all' && q.difficulty !== diffFilter) return false;
      if (searchText) {
        const text = searchText.toLowerCase();
        const preview = getQuestionPreview(q).toLowerCase();
        if (!preview.includes(text) && !q.id.toLowerCase().includes(text) && !q.topic.toLowerCase().includes(text)) return false;
      }
      return true;
    });
  }, [allQuestions, topicFilter, typeFilter, diffFilter, searchText]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="brutal-card bg-ph-surface w-full max-w-4xl">
        {/* Header */}
        <div className="p-6 border-b-4 border-ph-dark flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold uppercase">Browse & Select Questions</h3>
            <p className="font-mono text-sm font-bold opacity-60 mt-1">{selectedIds.length} selected · Click to expand, checkbox to select</p>
          </div>
          <button onClick={onClose} className="brutal-button bg-ph-dark text-ph-surface px-6 py-2 font-bold flex items-center gap-2">
            DONE <Check className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b-2 border-ph-dark space-y-3 bg-ph-bg/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-2 brutal-border bg-ph-surface font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ph-yellow"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-wrap gap-1">
              <button onClick={() => setTopicFilter('all')} className={`px-2 py-1 brutal-border font-mono text-xs font-bold ${topicFilter === 'all' ? 'bg-ph-dark text-ph-surface' : 'bg-ph-surface'}`}>ALL TOPICS</button>
              {TOPICS.map(t => (
                <button key={t} onClick={() => setTopicFilter(t)} className={`px-2 py-1 brutal-border font-mono text-xs font-bold ${topicFilter === t ? 'bg-ph-dark text-ph-surface' : 'bg-ph-surface'}`}>{t}</button>
              ))}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setTypeFilter('all')} className={`px-2 py-1 brutal-border font-mono text-xs font-bold ${typeFilter === 'all' ? 'bg-ph-dark text-ph-surface' : 'bg-ph-surface'}`}>ALL</button>
              {(['multiple_choice', 'open_answer', 'coding'] as QuestionType[]).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} className={`px-2 py-1 brutal-border font-mono text-xs font-bold ${typeFilter === t ? TYPE_COLORS[t] : 'bg-ph-surface'}`}>{TYPE_LABELS[t]}</button>
              ))}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setDiffFilter('all')} className={`px-2 py-1 brutal-border font-mono text-xs font-bold ${diffFilter === 'all' ? 'bg-ph-dark text-ph-surface' : 'bg-ph-surface'}`}>ALL</button>
              {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map(d => (
                <button key={d} onClick={() => setDiffFilter(d)} className={`px-2 py-1 brutal-border font-mono text-xs font-bold capitalize ${diffFilter === d ? DIFF_COLORS[d] : 'bg-ph-surface'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="font-mono text-xs font-bold opacity-50">
            {filtered.length} questions · {filtered.filter(q => selectedIds.includes(q.id)).length} selected in view
          </div>
        </div>

        {/* Question list */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {filtered.map(q => (
            <QuestionCard
              key={q.id}
              question={q}
              expanded={expandedId === q.id}
              onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)}
              selectable
              selected={selectedIds.includes(q.id)}
              onSelect={() => onToggle(q.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center">
              <p className="font-bold">No questions match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SwapQuestionModal({ question, alreadySelectedIds, onSwap, onClose }: {
  question: BankQuestion;
  alreadySelectedIds: string[];
  onSwap: (newQuestion: BankQuestion) => void;
  onClose: () => void;
}) {
  const candidates = useMemo(
    () => getSwapCandidates(question, alreadySelectedIds),
    [question, alreadySelectedIds]
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="brutal-card bg-ph-surface w-full max-w-3xl">
        {/* Header */}
        <div className="p-6 border-b-4 border-ph-dark flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold uppercase">Swap Question</h3>
            <p className="font-mono text-sm font-bold opacity-60 mt-1">
              {question.topic} / <span className="capitalize">{question.difficulty}</span> — {candidates.length} alternative{candidates.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="brutal-button bg-ph-dark text-ph-surface px-6 py-2 font-bold flex items-center gap-2">
            CANCEL <X className="w-4 h-4" />
          </button>
        </div>

        {/* Candidate list */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {candidates.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-bold">No alternative questions available for {question.topic} at {question.difficulty} level</p>
            </div>
          ) : (
            candidates.map(q => (
              <div key={q.id}>
                <QuestionCard
                  question={q}
                  expanded={expandedId === q.id}
                  onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)}
                />
                {expandedId === q.id && (
                  <div className="flex justify-end -mt-1 mb-2 mr-1">
                    <button
                      onClick={() => onSwap(q)}
                      className="brutal-button bg-ph-blue text-white px-6 py-2 font-bold flex items-center gap-2"
                    >
                      USE THIS <Check className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TakerView({ tab, setTab, selectedTest, setSelectedTest, tests }: {
  tab: TakerTab;
  setTab: (t: TakerTab) => void;
  selectedTest: MockTest | null;
  setSelectedTest: (t: MockTest | null) => void;
  tests: MockTest[];
}) {
  if (tab === 'take' && selectedTest) {
    const bankQuestions: BankQuestion[] = selectedTest.assembledTest
      ? selectedTest.assembledTest.questions
      : getQuestions({ topics: selectedTest.topics as Topic[] });

    return (
      <ActiveTestView
        testName={selectedTest.name}
        questions={bankQuestions.slice(0, selectedTest.questions)}
        proctoringEnabled={selectedTest.proctoring_enabled}
        duration={selectedTest.duration}
        onExit={() => { setTab('list'); setSelectedTest(null); }}
      />
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4 py-8">
        <h2 className="text-5xl font-bold uppercase">Available Tests</h2>
        <p className="font-mono text-lg font-bold">Select an assessment to begin.</p>
      </div>

      <div className="space-y-6">
        {tests.map((test) => (
          <div key={test.id} className="brutal-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-ph-yellow/10 transition-colors">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-3xl font-bold">{test.name}</h3>
                {test.proctoring_enabled && (
                  <span className="bg-ph-red text-white font-mono text-xs px-2 py-1 brutal-border flex items-center gap-1">
                    <Shield className="w-3 h-3" /> PROCTORED
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {test.topics.map(topic => (
                  <span key={topic} className="bg-ph-surface brutal-border px-3 py-1 text-sm font-bold">
                    {topic}
                  </span>
                ))}
              </div>
              <div className="flex gap-6 font-mono font-bold text-ph-dark/70">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {test.duration}</div>
                <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> {test.questions} Questions</div>
              </div>
            </div>
            <button
              onClick={() => { setSelectedTest(test); setTab('take'); }}
              className="brutal-button bg-ph-green text-black px-8 py-4 font-bold text-xl flex items-center gap-3 whitespace-nowrap w-full md:w-auto justify-center"
            >
              START TEST <Play className="w-6 h-6 fill-current" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const VIOLATION_LABELS: Record<string, string> = {
  tab_switch: 'Tab switch detected',
  window_blur: 'Window focus lost',
  fullscreen_exit: 'Fullscreen exited',
};

const MAX_VIOLATIONS = 3;

// ─── ActiveTestView ─────────────────────────────────────────────────────────

function ActiveTestView({ testName, questions, proctoringEnabled, duration, onExit }: {
  testName: string;
  questions: BankQuestion[];
  proctoringEnabled: boolean;
  duration: string;
  onExit: () => void;
}) {
  const parseDuration = (d: string): number => {
    const match = d.match(/(\d+)\s*min/i);
    return match ? parseInt(match[1]) * 60 : 30 * 60;
  };
  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({});
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [codeAnswers, setCodeAnswers] = useState<Record<string, string>>({});
  const [violations, setViolations] = useState(0);
  const [warningType, setWarningType] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => parseDuration(duration));
  const [timeExpired, setTimeExpired] = useState(false);

  const { status: pyStatus, runCode } = usePyodide();

  const question = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLast = currentIndex === totalQuestions - 1;

  const handleViolation = useCallback((type: string) => {
    setViolations(prev => {
      const next = prev + 1;
      if (next >= MAX_VIOLATIONS) {
        setAutoSubmitted(true);
      } else {
        setWarningType(type);
        setShowWarning(true);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!proctoringEnabled) return;
    document.documentElement.requestFullscreen?.().catch(() => {});
    const onVisibility = () => { if (document.hidden) handleViolation('tab_switch'); };
    const onBlur = () => handleViolation('window_blur');
    const onFullscreenChange = () => { if (!document.fullscreenElement) handleViolation('fullscreen_exit'); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.exitFullscreen?.().catch(() => {});
    };
  }, [proctoringEnabled, handleViolation]);

  useEffect(() => {
    if (submitted || autoSubmitted || timeExpired) return;
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
  }, [submitted, autoSubmitted, timeExpired]);

  if (timeExpired) {
    return (
      <div className="max-w-2xl mx-auto mt-16 brutal-card p-12 text-center space-y-6 bg-ph-surface">
        <div className="w-16 h-16 bg-ph-red brutal-border brutal-shadow mx-auto flex items-center justify-center">
          <Clock className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold uppercase">Time&apos;s Up!</h2>
        <p className="font-mono font-bold opacity-70">
          Your time has expired. Your test has been automatically submitted.
        </p>
        <button onClick={onExit} className="brutal-button bg-ph-dark text-ph-surface px-8 py-4 font-bold text-lg">EXIT</button>
      </div>
    );
  }

  if (autoSubmitted) {
    return (
      <div className="max-w-2xl mx-auto mt-16 brutal-card p-12 text-center space-y-6 bg-ph-surface">
        <div className="w-16 h-16 bg-ph-red brutal-border brutal-shadow mx-auto flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold uppercase">Test Auto-Submitted</h2>
        <p className="font-mono font-bold opacity-70">
          {MAX_VIOLATIONS} suspicious activities were detected. Your test has been automatically submitted and flagged for review.
        </p>
        <button onClick={onExit} className="brutal-button bg-ph-dark text-ph-surface px-8 py-4 font-bold text-lg">EXIT</button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-16 brutal-card p-12 text-center space-y-6 bg-ph-surface">
        <div className="w-16 h-16 bg-ph-green brutal-border brutal-shadow mx-auto flex items-center justify-center">
          <Check className="w-10 h-10 text-black" />
        </div>
        <h2 className="text-3xl font-bold uppercase">Test Submitted</h2>
        <p className="font-mono font-bold opacity-70">
          Your answers have been recorded. Thank you!
        </p>
        <button onClick={onExit} className="brutal-button bg-ph-dark text-ph-surface px-8 py-4 font-bold text-lg">EXIT</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Violation Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="brutal-card bg-ph-surface p-10 max-w-md w-full text-center space-y-6">
            <div className="w-14 h-14 bg-ph-yellow brutal-border mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-black" />
            </div>
            <div>
              <h3 className="text-2xl font-bold uppercase">Warning</h3>
              <p className="font-mono font-bold mt-2">{VIOLATION_LABELS[warningType]}</p>
            </div>
            <p className="font-mono text-sm opacity-70">
              Violation {violations} of {MAX_VIOLATIONS}. Your test will be auto-submitted on the {MAX_VIOLATIONS}rd violation.
            </p>
            <button onClick={() => setShowWarning(false)} className="brutal-button bg-ph-dark text-ph-surface w-full py-4 font-bold text-lg">
              I UNDERSTAND — RESUME TEST
            </button>
          </div>
        </div>
      )}

      {/* Test Header */}
      <div className="brutal-card p-6 flex justify-between items-center bg-ph-dark text-ph-surface">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{testName}</h2>
            {proctoringEnabled && (
              <span className="bg-ph-red font-mono text-xs px-2 py-1 brutal-border flex items-center gap-1">
                <Shield className="w-3 h-3" /> PROCTORED
              </span>
            )}
          </div>
          <p className="font-mono text-sm opacity-80 mt-1">
            Topic: {question.topic} · Question {currentIndex + 1} of {totalQuestions}
            <span className="ml-2 opacity-60">
              [{question.type === 'multiple_choice' ? 'MC' : question.type === 'open_answer' ? 'OPEN' : 'CODE'}]
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm font-bold px-3 py-1 brutal-border flex items-center gap-1 bg-ph-surface text-ph-dark">
            {currentIndex + 1} / {totalQuestions}
          </span>
          <span className={`font-mono text-sm font-bold px-3 py-1 brutal-border flex items-center gap-1 ${timeLeft < 120 ? 'bg-ph-red text-white' : 'bg-ph-blue text-white'}`}>
            <Clock className="w-4 h-4" /> {fmt(timeLeft)}
          </span>
          {proctoringEnabled && violations > 0 && (
            <span className="font-mono text-sm font-bold bg-ph-yellow text-black px-3 py-1 brutal-border">
              {violations}/{MAX_VIOLATIONS}
            </span>
          )}
          <button onClick={onExit} className="brutal-button bg-ph-red text-white px-4 py-2 font-bold text-sm">EXIT</button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-ph-surface brutal-border">
        <div className="h-full bg-ph-blue transition-all duration-300" style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }} />
      </div>

      {/* Question Area */}
      <div className="brutal-card p-8 space-y-8 bg-ph-surface">
        {question.type === 'multiple_choice' && (
          <MCQuestionView
            question={question}
            index={currentIndex}
            selectedAnswer={mcAnswers[question.id] ?? null}
            onSelect={(idx) => setMcAnswers(prev => ({ ...prev, [question.id]: idx }))}
          />
        )}
        {question.type === 'open_answer' && (
          <OpenQuestionView
            question={question}
            index={currentIndex}
            answer={openAnswers[question.id] ?? ''}
            onChange={(val) => setOpenAnswers(prev => ({ ...prev, [question.id]: val }))}
          />
        )}
        {question.type === 'coding' && (
          <CodingQuestionView
            question={question}
            index={currentIndex}
            code={codeAnswers[question.id] ?? question.starter_code}
            onChange={(val) => setCodeAnswers(prev => ({ ...prev, [question.id]: val }))}
            pyStatus={pyStatus}
            runCode={runCode}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-8 border-t-2 border-ph-dark">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(i => i - 1)}
            className="brutal-button bg-ph-surface px-6 py-3 font-bold"
          >
            PREVIOUS
          </button>
          <button
            onClick={() => {
              if (isLast) {
                setSubmitted(true);
              } else {
                setCurrentIndex(i => i + 1);
              }
            }}
            className="brutal-button bg-ph-blue text-white px-8 py-3 font-bold flex items-center gap-2"
          >
            {isLast ? 'SUBMIT TEST' : 'NEXT QUESTION'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Question Type Renderers ────────────────────────────────────────────────

function MCQuestionView({ question, index, selectedAnswer, onSelect }: {
  question: MCQuestion;
  index: number;
  selectedAnswer: number | null;
  onSelect: (idx: number) => void;
}) {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-ph-blue text-lg">QUESTION {index + 1}</span>
          <span className="bg-ph-surface brutal-border px-3 py-1 text-xs font-bold font-mono">{question.topic}</span>
          <span className="bg-ph-blue/10 brutal-border px-2 py-1 text-xs font-bold font-mono">MC</span>
        </div>
        <h3 className="text-2xl font-bold leading-relaxed whitespace-pre-line">{question.body}</h3>
      </div>
      <div className="space-y-4 pt-4">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={`w-full p-6 brutal-border text-left font-mono text-lg font-bold transition-all flex items-center gap-4 ${
              selectedAnswer === idx
                ? 'bg-ph-yellow text-black brutal-shadow-sm translate-x-[2px] translate-y-[2px]'
                : 'bg-ph-surface hover:bg-ph-dark/5 brutal-shadow'
            }`}
          >
            <div className={`w-8 h-8 brutal-border flex items-center justify-center shrink-0 ${selectedAnswer === idx ? 'bg-ph-dark text-ph-surface' : 'bg-ph-surface'}`}>
              {['A', 'B', 'C', 'D'][idx]}
            </div>
            {option}
          </button>
        ))}
      </div>
    </>
  );
}

function OpenQuestionView({ question, index, answer, onChange }: {
  question: OpenQuestion;
  index: number;
  answer: string;
  onChange: (val: string) => void;
}) {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-ph-green text-lg">QUESTION {index + 1}</span>
          <span className="bg-ph-surface brutal-border px-3 py-1 text-xs font-bold font-mono">{question.topic}</span>
          <span className="bg-ph-green/10 brutal-border px-2 py-1 text-xs font-bold font-mono">OPEN</span>
        </div>
        <h3 className="text-2xl font-bold leading-relaxed whitespace-pre-line">{question.body}</h3>
      </div>
      <div className="pt-4">
        <textarea
          value={answer}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here..."
          rows={4}
          className="w-full bg-ph-bg font-mono text-lg p-5 brutal-border resize-none focus:outline-none focus:ring-2 focus:ring-ph-green"
        />
      </div>
    </>
  );
}

function CodingQuestionView({ question, index, code, onChange, pyStatus, runCode }: {
  question: CodingQuestion;
  index: number;
  code: string;
  onChange: (val: string) => void;
  pyStatus: string;
  runCode: (code: string) => Promise<{ stdout: string; stderr: string; error: string | null }>;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Array<{ description: string; passed: boolean; actual: string }>>([]);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    setTestResults([]);

    if (question.exercise_type === 'predict_output') {
      const results = question.test_cases.map(tc => ({
        description: tc.description,
        passed: code.trim().replace(/\r\n/g, '\n') === tc.expected_output.trim(),
        actual: code.trim(),
      }));
      setTestResults(results);
      setIsRunning(false);
      return;
    }

    const results: Array<{ description: string; passed: boolean; actual: string }> = [];
    let lastOutput = '';

    for (const tc of question.test_cases) {
      const parts = [code, tc.setup_code, tc.call_code].filter(Boolean);
      const result = await runCode(parts.join('\n'));
      lastOutput = result.error || result.stdout;
      const passed = !result.error && result.stdout.trim().replace(/\r\n/g, '\n') === tc.expected_output.trim();
      results.push({ description: tc.description, passed, actual: result.error || result.stdout });
    }

    setOutput(lastOutput);
    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono font-bold text-ph-red text-lg">QUESTION {index + 1}</span>
          <span className="bg-ph-surface brutal-border px-3 py-1 text-xs font-bold font-mono">{question.topic}</span>
          <span className="bg-ph-red/10 brutal-border px-2 py-1 text-xs font-bold font-mono">CODE</span>
          <span className="bg-ph-dark/10 brutal-border px-2 py-1 text-xs font-bold font-mono">{question.exercise_type.replace('_', ' ').toUpperCase()}</span>
        </div>
        <h3 className="text-xl font-bold">{question.title}</h3>
        <p className="font-mono text-sm opacity-70">{question.description}</p>
      </div>

      {question.exercise_type === 'predict_output' ? (
        <div className="space-y-4 pt-4">
          <pre className="bg-[#1d1d1d] text-[#e5e7eb] font-mono text-sm p-5 brutal-border overflow-x-auto leading-relaxed whitespace-pre">
            {question.starter_code}
          </pre>
          <label className="block font-bold uppercase text-sm">Your Answer</label>
          <textarea
            value={code}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type the exact output here..."
            rows={4}
            className="w-full bg-ph-bg font-mono text-sm p-4 brutal-border resize-none focus:outline-none focus:ring-2 focus:ring-ph-red"
          />
        </div>
      ) : (
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          rows={12}
          className="w-full bg-[#1d1d1d] text-[#e5e7eb] font-mono text-sm p-5 brutal-border resize-y focus:outline-none focus:ring-2 focus:ring-ph-red leading-relaxed"
        />
      )}

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={pyStatus !== 'ready' && question.exercise_type !== 'predict_output'}
        className="brutal-button bg-ph-red text-white px-6 py-2 font-bold flex items-center gap-2 text-sm"
      >
        {isRunning ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> RUNNING...</>
        ) : (
          <><Play className="w-4 h-4 fill-current" /> {question.exercise_type === 'predict_output' ? 'CHECK ANSWER' : 'RUN CODE'}</>
        )}
      </button>

      {/* Results */}
      {testResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold uppercase text-sm">
            Test Results —{' '}
            <span className="text-ph-green">{testResults.filter(r => r.passed).length} passed</span>
            {' / '}
            <span className="text-ph-red">{testResults.filter(r => !r.passed).length} failed</span>
          </h4>
          {testResults.map((tr, i) => (
            <div key={i} className={`brutal-border p-3 font-mono text-sm ${tr.passed ? 'bg-ph-green/10' : 'bg-ph-red/10'}`}>
              <div className="flex justify-between items-center">
                <span className="font-bold">{tr.description}</span>
                <span className={`px-2 py-1 brutal-border font-bold text-xs ${tr.passed ? 'bg-ph-green text-black' : 'bg-ph-red text-white'}`}>
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

// ─── Test Dashboard Card with Magic Link ─────────────────────────────────────

function TestDashboardCard({ test, onSelect }: { test: MockTest; onSelect: () => void }) {
  return (
    <div
      className="brutal-card p-6 flex flex-col gap-4 cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-bold">{test.name}</h3>
        <div className="flex items-center gap-2">
          {test.supabaseId && (
            <span className="bg-ph-green text-black font-mono text-xs px-2 py-1 brutal-border">PUBLISHED</span>
          )}
          <span className="bg-ph-dark text-ph-surface font-mono text-xs px-2 py-1 brutal-border">
            ID: #{test.supabaseId ? test.supabaseId.slice(0, 8) : test.id}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {test.topics.map(topic => (
          <span key={topic} className="bg-ph-dark/5 brutal-border px-3 py-1 text-sm font-bold">
            {topic}
          </span>
        ))}
      </div>
      <div className="flex gap-6 mt-4 pt-4 border-t-2 border-ph-dark font-mono text-sm font-bold">
        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {test.duration}</div>
        <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4" /> {test.questions} Qs</div>
      </div>
    </div>
  );
}

// ─── Test Detail View ─────────────────────────────────────────────────────────

interface AssignmentRecord {
  id: string;
  invited_email: string | null;
  status: string;
  access_token: string;
  due_date: string | null;
  assigned_at: string;
  recipients: { email: string; name: string } | null;
}

function TestDetailView({ test, onBack }: { test: MockTest; onBack: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const fetchAssignments = useCallback(async () => {
    if (!test.supabaseId) return;
    setLoadingAssignments(true);
    try {
      const res = await fetch(`/api/tests/${test.supabaseId}/assignments`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
    setLoadingAssignments(false);
  }, [test.supabaseId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleModalDone = () => {
    setShowModal(false);
    fetchAssignments();
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="border-b-4 border-ph-dark pb-4">
        <button onClick={onBack} className="brutal-button bg-ph-surface px-4 py-2 font-bold text-sm flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold">{test.name}</h2>
            <p className="font-mono mt-1 text-sm font-bold opacity-60">
              ID: {test.supabaseId ? test.supabaseId.slice(0, 8) : test.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {test.supabaseId && (
              <span className="bg-ph-green text-black font-mono text-xs px-2 py-1 brutal-border">PUBLISHED</span>
            )}
          </div>
        </div>
      </div>

      {/* Test Info */}
      <div className="brutal-card p-6 bg-ph-surface">
        <div className="flex flex-wrap gap-2 mb-4">
          {test.topics.map(topic => (
            <span key={topic} className="bg-ph-dark/5 brutal-border px-3 py-1 text-sm font-bold">{topic}</span>
          ))}
        </div>
        <div className="flex gap-6 font-mono text-sm font-bold">
          <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {test.duration}</div>
          <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4" /> {test.questions} Questions</div>
        </div>
      </div>

      {/* Generate Link Button */}
      {test.supabaseId && (
        <button
          onClick={() => setShowModal(true)}
          className="brutal-button bg-ph-blue text-white px-6 py-3 font-bold flex items-center gap-2"
        >
          <Link className="w-5 h-5" /> GENERATE INVITE LINK
        </button>
      )}

      {/* Assignments List */}
      <div className="brutal-card p-6 bg-ph-surface">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold uppercase">Assignments ({assignments.length})</h3>
          <button onClick={fetchAssignments} disabled={loadingAssignments} className="brutal-button bg-ph-surface px-3 py-1.5 font-bold text-xs flex items-center gap-1">
            <RefreshCw className={`w-3 h-3 ${loadingAssignments ? 'animate-spin' : ''}`} /> REFRESH
          </button>
        </div>
        {assignments.length === 0 ? (
          <p className="font-mono text-sm opacity-60">No assignments yet. Generate invite links to get started.</p>
        ) : (
          <div className="space-y-2">
            {assignments.map(a => (
              <div key={a.id} className="brutal-border p-3 flex items-center justify-between bg-ph-bg">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 opacity-40" />
                  <div>
                    <span className="font-bold text-sm">
                      {a.invited_email || a.recipients?.email || 'No email'}
                    </span>
                    {a.due_date && (
                      <span className="font-mono text-xs opacity-50 ml-2">
                        Due: {new Date(a.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`font-mono text-xs px-2 py-1 brutal-border font-bold ${
                  a.status === 'completed' ? 'bg-ph-green text-black' :
                  a.status === 'in_progress' ? 'bg-ph-yellow text-black' :
                  'bg-ph-surface'
                }`}>
                  {a.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Link Modal */}
      {showModal && test.supabaseId && (
        <GenerateLinkModal testId={test.supabaseId} testName={test.name} onClose={handleModalDone} />
      )}
    </div>
  );
}

// ─── Generate Link Modal (Two-Phase) ────────────────────────────────────────

interface GeneratedLink {
  email: string;
  link: string;
  assignment_id: string;
}

function GenerateLinkModal({ testId, testName, onClose }: { testId: string; testName: string; onClose: () => void }) {
  const [phase, setPhase] = useState<'form' | 'results'>('form');
  const [emailsText, setEmailsText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedLink[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const parsedEmails = useMemo(() => {
    return emailsText
      .split(/[,;\n]+/)
      .map(e => e.trim())
      .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  }, [emailsText]);

  const handleGenerate = async () => {
    if (parsedEmails.length === 0) return;
    setGenerating(true);
    const generated: GeneratedLink[] = [];

    for (const email of parsedEmails) {
      try {
        const res = await fetch(`/api/tests/${testId}/generate-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            due_date: dueDate || undefined,
            custom_message: customMessage || undefined,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          generated.push({ email, link: data.link, assignment_id: data.assignment_id });
        }
      } catch (err) {
        console.error(`Failed to generate link for ${email}:`, err);
      }
    }

    setResults(generated);
    setPhase('results');
    setGenerating(false);
  };

  const handleCopy = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="brutal-card bg-ph-surface w-full max-w-lg">
        {/* Header */}
        <div className="p-6 border-b-4 border-ph-dark flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold uppercase">Generate Invite Links</h3>
            <p className="font-mono text-sm font-bold opacity-60 mt-1">{testName}</p>
          </div>
          <button onClick={onClose} className="brutal-button bg-ph-surface px-3 py-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {phase === 'form' ? (
          <div className="p-6 space-y-4">
            {/* Email addresses */}
            <div className="space-y-2">
              <label className="font-bold text-sm uppercase">Email Addresses</label>
              <textarea
                value={emailsText}
                onChange={e => setEmailsText(e.target.value)}
                placeholder="Enter email addresses separated by commas, semicolons, or new lines..."
                rows={4}
                className="w-full p-3 brutal-border bg-ph-bg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ph-yellow resize-none"
              />
              <p className="font-mono text-xs font-bold opacity-60">
                {parsedEmails.length} valid email{parsedEmails.length !== 1 ? 's' : ''} detected
              </p>
            </div>

            {/* Due date */}
            <div className="space-y-2">
              <label className="font-bold text-sm uppercase">Due Date <span className="opacity-40">(optional)</span></label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full p-3 brutal-border bg-ph-bg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ph-yellow"
              />
            </div>

            {/* Custom message */}
            <div className="space-y-2">
              <label className="font-bold text-sm uppercase">Custom Message <span className="opacity-40">(optional)</span></label>
              <textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                placeholder="Add a personal message for recipients..."
                rows={2}
                className="w-full p-3 brutal-border bg-ph-bg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ph-yellow resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="brutal-button bg-ph-surface px-6 py-2 font-bold">
                CANCEL
              </button>
              <button
                onClick={handleGenerate}
                disabled={parsedEmails.length === 0 || generating}
                className="brutal-button bg-ph-blue text-white px-6 py-2 font-bold flex items-center gap-2 disabled:opacity-50"
              >
                <Link className="w-4 h-4" />
                {generating ? 'GENERATING...' : `GENERATE ${parsedEmails.length} LINK${parsedEmails.length !== 1 ? 'S' : ''}`}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Success banner */}
            <div className="bg-ph-green text-black brutal-border p-4 flex items-center gap-3">
              <Check className="w-5 h-5" />
              <span className="font-bold">{results.length} Link{results.length !== 1 ? 's' : ''} Generated</span>
            </div>
            <p className="font-mono text-sm font-bold opacity-60">Copy and share these links with the recipients.</p>

            {/* Links list */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {results.map(r => (
                <div key={r.assignment_id} className="brutal-border p-3 space-y-2 bg-ph-bg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{r.email}</span>
                    <span className="bg-ph-green text-black font-mono text-xs px-2 py-0.5 brutal-border font-bold">READY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={r.link}
                      className="flex-1 font-mono text-xs p-2 brutal-border bg-ph-surface truncate"
                    />
                    <button
                      onClick={() => handleCopy(r.link, r.assignment_id)}
                      className="brutal-button bg-ph-surface px-3 py-2 font-bold text-xs flex items-center gap-1 shrink-0"
                    >
                      {copiedId === r.assignment_id ? <><Check className="w-3 h-3" /> COPIED</> : <><Copy className="w-3 h-3" /> COPY</>}
                    </button>
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brutal-button bg-ph-surface px-3 py-2 font-bold text-xs flex items-center gap-1 shrink-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Done */}
            <div className="flex justify-end pt-2">
              <button onClick={onClose} className="brutal-button bg-ph-dark text-ph-surface px-6 py-2 font-bold flex items-center gap-2">
                DONE <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Results Dashboard ─────────────────────────────────────────────────

interface AttemptAnswer {
  question_id: string;
  type: string;
  correct: boolean;
  response: string | number;
  details?: {
    correct_answer?: string | number;
    explanation?: string;
    test_results?: Array<{ test_case_id: number; passed: boolean; actual: string }>;
  };
}

interface AttemptData {
  id: string;
  score_percentage: number;
  correct_answers: number;
  total_questions: number;
  passed: boolean;
  time_spent_secs: number | null;
  completed_at: string | null;
  answers: AttemptAnswer[];
  recipients: { email: string; name: string } | null;
}

interface QuestionInfo {
  id: string;
  type: string;
  topic: string;
  body?: string;
  title?: string;
  options?: string[];
}

interface StatsData {
  total_attempts: number;
  total_assignments: number;
  completion_rate: number;
  average_score: number;
  median_score: number;
  pass_rate: number;
  average_time_secs: number;
  per_question_accuracy: Record<string, number>;
}

function AdminResultsDashboard({ tests }: { tests: MockTest[] }) {
  const publishedTests = tests.filter(t => t.supabaseId);
  const [selectedTestId, setSelectedTestId] = useState<string>(publishedTests[0]?.supabaseId || '');
  const [attempts, setAttempts] = useState<AttemptData[]>([]);
  const [questions, setQuestions] = useState<QuestionInfo[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptData | null>(null);

  useEffect(() => {
    if (!selectedTestId) return;
    async function fetchData() {
      setLoading(true);
      try {
        const [resultsRes, statsRes] = await Promise.all([
          fetch(`/api/admin/results?testId=${selectedTestId}`),
          fetch(`/api/admin/stats?testId=${selectedTestId}`),
        ]);
        const resultsData = await resultsRes.json();
        const statsData = await statsRes.json();
        setAttempts(Array.isArray(resultsData.attempts) ? resultsData.attempts : Array.isArray(resultsData) ? resultsData : []);
        setQuestions(Array.isArray(resultsData.questions) ? resultsData.questions : []);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to fetch results:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedTestId]);

  const handleExport = () => {
    if (!selectedTestId) return;
    window.open(`/api/admin/export?testId=${selectedTestId}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b-4 border-ph-dark pb-4">
        <div>
          <h2 className="text-4xl font-bold uppercase">Results</h2>
          <p className="font-mono mt-2 font-bold">View test taker performance.</p>
        </div>
      </div>

      {publishedTests.length === 0 ? (
        <div className="brutal-card p-12 text-center bg-ph-surface">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-bold text-lg">No published tests yet.</p>
          <p className="font-mono text-sm opacity-60 mt-1">Create and publish a test to see results here.</p>
        </div>
      ) : (
        <>
          {/* Test Selector */}
          <div className="brutal-card p-4 bg-ph-surface flex items-center gap-4">
            <label className="font-bold uppercase text-sm">Test:</label>
            <select
              value={selectedTestId}
              onChange={e => setSelectedTestId(e.target.value)}
              className="flex-1 p-3 brutal-border bg-ph-bg font-mono"
            >
              {publishedTests.map(t => (
                <option key={t.supabaseId} value={t.supabaseId}>{t.name}</option>
              ))}
            </select>
            <button onClick={handleExport} className="brutal-button bg-ph-surface px-4 py-2 font-bold text-sm flex items-center gap-2">
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>

          {loading ? (
            <div className="brutal-card p-12 text-center bg-ph-surface">
              <div className="w-10 h-10 border-4 border-ph-dark border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-bold mt-4">Loading results...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="brutal-card p-4 text-center bg-ph-surface">
                    <div className="text-3xl font-bold">{stats.total_attempts}</div>
                    <div className="font-mono text-xs font-bold opacity-60">SUBMISSIONS</div>
                  </div>
                  <div className="brutal-card p-4 text-center bg-ph-surface">
                    <div className="text-3xl font-bold text-ph-blue">{stats.average_score}%</div>
                    <div className="font-mono text-xs font-bold opacity-60">AVG SCORE</div>
                  </div>
                  <div className="brutal-card p-4 text-center bg-ph-surface">
                    <div className="text-3xl font-bold text-ph-green">{stats.pass_rate}%</div>
                    <div className="font-mono text-xs font-bold opacity-60">PASS RATE</div>
                  </div>
                  <div className="brutal-card p-4 text-center bg-ph-surface">
                    <div className="text-3xl font-bold">{stats.median_score}%</div>
                    <div className="font-mono text-xs font-bold opacity-60">MEDIAN</div>
                  </div>
                </div>
              )}

              {/* Sessions Table */}
              {attempts.length === 0 ? (
                <div className="brutal-card p-12 text-center bg-ph-surface">
                  <p className="font-bold">No submissions yet.</p>
                  <p className="font-mono text-sm opacity-60 mt-1">Share an invite link and wait for takers to complete the test.</p>
                </div>
              ) : (
                <>
                <div className="brutal-card bg-ph-surface overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-4 border-ph-dark">
                        <th className="p-4 text-left font-bold uppercase text-sm">Name</th>
                        <th className="p-4 text-left font-bold uppercase text-sm">Email</th>
                        <th className="p-4 text-center font-bold uppercase text-sm">Score</th>
                        <th className="p-4 text-center font-bold uppercase text-sm">Status</th>
                        <th className="p-4 text-center font-bold uppercase text-sm">Time</th>
                        <th className="p-4 text-center font-bold uppercase text-sm">Date</th>
                        <th className="p-4 text-center font-bold uppercase text-sm">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map(a => (
                        <tr key={a.id} className="border-b-2 border-ph-dark hover:bg-ph-dark/5 transition-colors">
                          <td className="p-4 font-bold">{a.recipients?.name || 'Unknown'}</td>
                          <td className="p-4 font-mono text-sm">{a.recipients?.email || '—'}</td>
                          <td className="p-4 text-center font-bold text-lg">{a.score_percentage}%</td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1 brutal-border font-bold text-xs ${a.passed ? 'bg-ph-green text-black' : 'bg-ph-red text-white'}`}>
                              {a.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono text-sm">
                            {a.time_spent_secs ? `${Math.round(a.time_spent_secs / 60)}m` : '—'}
                          </td>
                          <td className="p-4 text-center font-mono text-xs">
                            {a.completed_at ? new Date(a.completed_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setSelectedAttempt(a)}
                              className="px-3 py-1 brutal-border font-bold text-xs bg-ph-blue text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[3px_3px_0px_#1d1d1d] transition-all flex items-center gap-1 mx-auto"
                            >
                              <Eye className="w-3 h-3" /> VIEW
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Detail Modal */}
                {selectedAttempt && (
                  <ResultDetailModal
                    attempt={selectedAttempt}
                    questions={questions}
                    onClose={() => setSelectedAttempt(null)}
                  />
                )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Result Detail Modal ──────────────────────────────────────────────────────

function ResultDetailModal({
  attempt,
  questions,
  onClose,
}: {
  attempt: AttemptData;
  questions: QuestionInfo[];
  onClose: () => void;
}) {
  const [hoveredQ, setHoveredQ] = useState<number | null>(null);

  const questionMap = useMemo(() => {
    const m: Record<string, QuestionInfo> = {};
    for (const q of questions) m[q.id] = q;
    return m;
  }, [questions]);

  // Topic performance
  const topicPerformance = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    for (const ans of attempt.answers || []) {
      const q = questionMap[ans.question_id];
      const topic = q?.topic || 'Unknown';
      if (!map[topic]) map[topic] = { correct: 0, total: 0 };
      map[topic].total++;
      if (ans.correct) map[topic].correct++;
    }
    return Object.entries(map)
      .map(([topic, { correct, total }]) => ({
        topic,
        correct,
        total,
        percentage: Math.round((correct / total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [attempt.answers, questionMap]);

  const handleCSV = () => {
    const rows = [['#', 'Type', 'Topic', 'Question', 'User Answer', 'Correct Answer', 'Result']];
    (attempt.answers || []).forEach((ans, i) => {
      const q = questionMap[ans.question_id];
      const qText = (q?.body || q?.title || '').replace(/"/g, '""');
      const userAns = String(ans.response).replace(/"/g, '""');
      const correctAns = (!ans.correct && ans.details?.correct_answer !== undefined)
        ? String(ans.details.correct_answer).replace(/"/g, '""')
        : '';
      rows.push([
        String(i + 1),
        ans.type === 'multiple_choice' ? 'MC' : ans.type === 'open_answer' ? 'Open' : 'Coding',
        q?.topic || 'Unknown',
        `"${qText}"`,
        `"${userAns}"`,
        `"${correctAns}"`,
        ans.correct ? 'Correct' : 'Incorrect',
      ]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${attempt.recipients?.name || 'attempt'}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto" onClick={onClose}>
      {/* Modal */}
      <div className="relative w-full max-w-3xl brutal-card bg-ph-surface p-0 print:shadow-none print:border-none print:mx-0 print:max-w-none" id="result-detail-modal" onClick={e => e.stopPropagation()}>
        {/* Score Header */}
        <div className={`p-6 border-b-4 border-ph-dark ${attempt.passed ? 'bg-ph-green/10' : 'bg-ph-red/10'}`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold">{attempt.recipients?.name || 'Unknown'}</h2>
              <p className="font-mono text-sm opacity-70">{attempt.recipients?.email || '—'}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-4xl font-bold">{attempt.score_percentage}%</div>
              <span className={`px-3 py-1 brutal-border font-bold text-sm ${attempt.passed ? 'bg-ph-green text-black' : 'bg-ph-red text-white'}`}>
                {attempt.passed ? 'PASSED' : 'FAILED'}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 brutal-border flex items-center justify-center font-bold bg-white hover:bg-ph-red hover:text-white transition-colors print:hidden shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-6 mt-3 font-mono text-sm font-bold opacity-70">
            <span>{attempt.correct_answers}/{attempt.total_questions} correct</span>
            {attempt.time_spent_secs && <span><Clock className="w-3 h-3 inline" /> {Math.round(attempt.time_spent_secs / 60)}m</span>}
            {attempt.completed_at && <span>{new Date(attempt.completed_at).toLocaleDateString()}</span>}
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 border-b-2 border-ph-dark flex gap-2 print:hidden">
          <button onClick={handleCSV} className="brutal-button bg-ph-surface px-3 py-2 font-bold text-xs flex items-center gap-1">
            <Download className="w-3 h-3" /> CSV
          </button>
          <button onClick={handlePrint} className="brutal-button bg-ph-surface px-3 py-2 font-bold text-xs flex items-center gap-1">
            <Printer className="w-3 h-3" /> PRINT / PDF
          </button>
        </div>

        {/* Topic Performance */}
        {topicPerformance.length > 1 && (
          <div className="p-6 border-b-2 border-ph-dark space-y-3">
            <h3 className="font-bold uppercase text-sm">Performance by Topic</h3>
            <div className="space-y-2">
              {topicPerformance.map(tp => {
                const classification = tp.percentage >= 80 ? 'strong' : tp.percentage >= 50 ? 'developing' : 'needs_work';
                const badgeBg = classification === 'strong' ? 'bg-ph-green/20' : classification === 'developing' ? 'bg-ph-yellow/20' : 'bg-ph-red/20';
                const barBg = classification === 'strong' ? 'bg-ph-green' : classification === 'developing' ? 'bg-ph-yellow' : 'bg-ph-red';
                const label = classification === 'strong' ? 'Strong' : classification === 'developing' ? 'Developing' : 'Needs work';
                return (
                  <div key={tp.topic} className="brutal-border p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs capitalize">{tp.topic}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold">{tp.correct}/{tp.total} ({tp.percentage}%)</span>
                        <span className={`px-2 py-0.5 border-2 border-ph-dark text-xs font-bold font-mono ${badgeBg}`}>
                          {label}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 border-2 border-ph-dark bg-white">
                      <div className={`h-full ${barBg}`} style={{ width: `${tp.percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Breakdown */}
        <div className="p-6 space-y-3">
          <h3 className="font-bold uppercase text-sm">Question Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(attempt.answers || []).map((ans, i) => {
              const q = questionMap[ans.question_id];
              const typeLabel = ans.type === 'multiple_choice' ? 'MC' : ans.type === 'open_answer' ? 'OPEN' : 'CODE';
              return (
                <div
                  key={i}
                  className={`relative brutal-border p-2 font-mono text-xs cursor-default ${ans.correct ? 'bg-ph-green/10' : 'bg-ph-red/10'}`}
                  onMouseEnter={() => setHoveredQ(i)}
                  onMouseLeave={() => setHoveredQ(null)}
                >
                  <span className="font-bold">Q{i + 1}</span>
                  <span className="ml-1 opacity-60">[{typeLabel}]</span>
                  <span className={`ml-2 font-bold ${ans.correct ? 'text-ph-green' : 'text-ph-red'}`}>
                    {ans.correct ? 'CORRECT' : 'WRONG'}
                  </span>

                  {/* Hover tooltip */}
                  {hoveredQ === i && (
                    <div className="absolute z-10 left-0 top-full mt-1 w-72 brutal-border bg-white p-3 shadow-[4px_4px_0px_#1d1d1d] space-y-2 text-xs print:hidden">
                      {q && <p className="font-bold text-sm leading-snug">{q.body || q.title || 'Question'}</p>}
                      {q?.topic && <p className="opacity-60">Topic: <span className="font-bold capitalize">{q.topic}</span></p>}
                      <p>Your answer: <span className="font-bold">{String(ans.response)}</span></p>
                      {!ans.correct && ans.details?.correct_answer !== undefined && (
                        <p className="text-ph-green">Correct: <span className="font-bold">{String(ans.details.correct_answer)}</span></p>
                      )}
                      {ans.details?.explanation && (
                        <p className="opacity-60 italic">{ans.details.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
