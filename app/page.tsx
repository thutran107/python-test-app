'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Settings, User, Plus, LayoutDashboard, CheckSquare, Code, Play, ArrowRight, Check, BookOpen, Clock, Moon, Sun, Shield, ShieldOff, AlertTriangle, Terminal } from 'lucide-react';
import { getBaselineTest, BASELINE_TOPICS, type Question } from '@/lib/baseline-test';
import { PracticeView } from '@/app/practice-view';

type ViewMode = 'admin' | 'taker' | 'practice';
type AdminTab = 'dashboard' | 'create';
type TakerTab = 'list' | 'take';

const TOPICS = BASELINE_TOPICS;

const MOCK_TESTS = [
  { id: 'baseline', name: 'Python Fundamentals', topics: BASELINE_TOPICS, duration: '30 min', questions: 20, proctoring_enabled: false },
];

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [takerTab, setTakerTab] = useState<TakerTab>('list');
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
            <p className="font-mono text-sm font-bold opacity-70">v1.0.0 // Assessment Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 bg-ph-surface brutal-border brutal-shadow-sm flex items-center justify-center hover:bg-ph-dark/5 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* View Switcher */}
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

      {/* Main Content */}
      <main>
        {viewMode === 'admin' && (
          <AdminView tab={adminTab} setTab={setAdminTab} />
        )}
        {viewMode === 'taker' && (
          <TakerView tab={takerTab} setTab={setTakerTab} selectedTest={selectedTest} setSelectedTest={setSelectedTest} />
        )}
        {viewMode === 'practice' && (
          <PracticeView />
        )}
      </main>
    </div>
  );
}

function AdminView({ tab, setTab }: { tab: AdminTab, setTab: (t: AdminTab) => void }) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Admin Sidebar */}
      <div className="w-full md:w-64 flex flex-col gap-4">
        <button
          onClick={() => setTab('dashboard')}
          className={`brutal-button flex items-center gap-3 p-4 font-bold text-left ${tab === 'dashboard' ? 'bg-ph-blue text-white' : 'bg-ph-surface'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          DASHBOARD
        </button>
        <button
          onClick={() => setTab('create')}
          className={`brutal-button flex items-center gap-3 p-4 font-bold text-left ${tab === 'create' ? 'bg-ph-red text-white' : 'bg-ph-surface'}`}
        >
          <Plus className="w-5 h-5" />
          CREATE TEST
        </button>
      </div>

      {/* Admin Content */}
      <div className="flex-1">
        {tab === 'dashboard' ? <AdminDashboard setTab={setTab} /> : <AdminCreateTest setTab={setTab} />}
      </div>
    </div>
  );
}

function AdminDashboard({ setTab }: { setTab: (t: AdminTab) => void }) {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {MOCK_TESTS.map((test) => (
          <div key={test.id} className="brutal-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-bold">{test.name}</h3>
              <span className="bg-ph-dark text-ph-surface font-mono text-xs px-2 py-1 brutal-border">ID: #{test.id}</span>
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
        ))}
      </div>
    </div>
  );
}

function AdminCreateTest({ setTab }: { setTab: (t: AdminTab) => void }) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [testName, setTestName] = useState('');
  const [proctoringEnabled, setProctoringEnabled] = useState(false);

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

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
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="e.g., Midterm Python Evaluation"
            className="w-full p-4 text-lg brutal-border focus:outline-none focus:ring-4 focus:ring-ph-yellow/50 bg-ph-bg font-mono text-ph-dark placeholder-ph-dark/40"
          />
        </div>

        {/* Topics Selection */}
        <div className="space-y-4">
          <label className="block text-xl font-bold uppercase">Select Topics</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TOPICS.map(topic => {
              const isSelected = selectedTopics.includes(topic);
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

        {/* Settings */}
        <div className="grid grid-cols-2 gap-6 pt-6 border-t-2 border-ph-dark">
          <div className="space-y-3">
            <label className="block font-bold uppercase">Duration (mins)</label>
            <input type="number" defaultValue={30} className="w-full p-3 brutal-border bg-ph-bg font-mono text-ph-dark" />
          </div>
          <div className="space-y-3">
            <label className="block font-bold uppercase">Question Count</label>
            <input type="number" defaultValue={10} className="w-full p-3 brutal-border bg-ph-bg font-mono text-ph-dark" />
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
            className="brutal-button bg-ph-blue text-white px-8 py-4 font-bold text-lg flex-1 flex items-center justify-center gap-2"
            disabled={!testName || selectedTopics.length === 0}
          >
            GENERATE TEST <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TakerView({ tab, setTab, selectedTest, setSelectedTest }: { tab: TakerTab, setTab: (t: TakerTab) => void, selectedTest: any, setSelectedTest: (t: any) => void }) {
  const baselineTest = useMemo(() => getBaselineTest(), []);

  if (tab === 'take' && selectedTest) {
    return <ActiveTestView test={baselineTest} proctoringEnabled={selectedTest.proctoring_enabled} onExit={() => { setTab('list'); setSelectedTest(null); }} />;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4 py-8">
        <h2 className="text-5xl font-bold uppercase">Available Tests</h2>
        <p className="font-mono text-lg font-bold">Select an assessment to begin.</p>
      </div>

      <div className="space-y-6">
        {MOCK_TESTS.map((test) => (
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

function ActiveTestView({ test, proctoringEnabled, onExit }: {
  test: { name: string; questions: Question[] };
  proctoringEnabled: boolean;
  onExit: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [violations, setViolations] = useState(0);
  const [warningType, setWarningType] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const question = test.questions[currentIndex];
  const totalQuestions = test.questions.length;
  const selectedAnswer = answers[question.id] ?? null;
  const isLast = currentIndex === totalQuestions - 1;

  const selectAnswer = (idx: number) => {
    setAnswers(prev => ({ ...prev, [question.id]: idx }));
  };

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

    // Enter fullscreen
    document.documentElement.requestFullscreen?.().catch(() => {});

    const onVisibility = () => {
      if (document.hidden) handleViolation('tab_switch');
    };
    const onBlur = () => handleViolation('window_blur');
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) handleViolation('fullscreen_exit');
    };

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

  // Auto-submitted screen
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
        <button onClick={onExit} className="brutal-button bg-ph-dark text-ph-surface px-8 py-4 font-bold text-lg">
          EXIT
        </button>
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
            <button
              onClick={() => setShowWarning(false)}
              className="brutal-button bg-ph-dark text-ph-surface w-full py-4 font-bold text-lg"
            >
              I UNDERSTAND — RESUME TEST
            </button>
          </div>
        </div>
      )}

      {/* Test Header */}
      <div className="brutal-card p-6 flex justify-between items-center bg-ph-dark text-ph-surface">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{test.name}</h2>
            {proctoringEnabled && (
              <span className="bg-ph-red font-mono text-xs px-2 py-1 brutal-border flex items-center gap-1">
                <Shield className="w-3 h-3" /> PROCTORED
              </span>
            )}
          </div>
          <p className="font-mono text-sm opacity-80 mt-1">
            Topic: {question.topic} · Question {currentIndex + 1} of {totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {proctoringEnabled && violations > 0 && (
            <span className="font-mono text-sm font-bold bg-ph-yellow text-black px-3 py-1 brutal-border">
              ⚠ {violations}/{MAX_VIOLATIONS}
            </span>
          )}
          <button onClick={onExit} className="brutal-button bg-ph-red text-white px-4 py-2 font-bold text-sm">
            EXIT
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-ph-surface brutal-border">
        <div
          className="h-full bg-ph-blue transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Area */}
      <div className="brutal-card p-8 space-y-8 bg-ph-surface">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-ph-blue text-lg">QUESTION {currentIndex + 1}</span>
            <span className="bg-ph-surface brutal-border px-3 py-1 text-xs font-bold font-mono">{question.topic}</span>
          </div>
          <h3 className="text-2xl font-bold leading-relaxed whitespace-pre-line">{question.body}</h3>
        </div>

        {/* Answers */}
        <div className="space-y-4 pt-4">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => selectAnswer(idx)}
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
            onClick={() => setCurrentIndex(i => i + 1)}
            disabled={isLast && selectedAnswer === null}
            className="brutal-button bg-ph-blue text-white px-8 py-3 font-bold flex items-center gap-2"
          >
            {isLast ? 'SUBMIT TEST' : 'NEXT QUESTION'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
