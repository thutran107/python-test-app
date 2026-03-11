import React, { useState, useEffect } from 'react';
import { Settings, User, Plus, LayoutDashboard, CheckSquare, Code, Play, ArrowRight, Check, BookOpen, Clock, Moon, Sun } from 'lucide-react';

type ViewMode = 'admin' | 'taker';
type AdminTab = 'dashboard' | 'create';
type TakerTab = 'list' | 'take';

const TOPICS = ['String', 'Loops', 'Tuples', 'List', 'Dictionaries'];

// Mock Data
const MOCK_TESTS = [
  { id: 1, name: 'Python Basics 101', topics: ['String', 'List'], duration: '30 min', questions: 10 },
  { id: 2, name: 'Data Structures Deep Dive', topics: ['Tuples', 'Dictionaries', 'List'], duration: '45 min', questions: 15 },
  { id: 3, name: 'Control Flow Mastery', topics: ['Loops', 'String'], duration: '20 min', questions: 8 },
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {viewMode === 'admin' ? (
          <AdminView tab={adminTab} setTab={setAdminTab} />
        ) : (
          <TakerView tab={takerTab} setTab={setTakerTab} selectedTest={selectedTest} setSelectedTest={setSelectedTest} />
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
  if (tab === 'take' && selectedTest) {
    return <ActiveTestView test={selectedTest} onExit={() => { setTab('list'); setSelectedTest(null); }} />;
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
              <h3 className="text-3xl font-bold">{test.name}</h3>
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

function ActiveTestView({ test, onExit }: { test: any, onExit: () => void }) {
  const [currentQ, setCurrentQ] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Test Header */}
      <div className="brutal-card p-6 flex justify-between items-center bg-ph-dark text-ph-surface">
        <div>
          <h2 className="text-2xl font-bold">{test.name}</h2>
          <p className="font-mono text-sm opacity-80 mt-1">Topic: {test.topics[0]} (Question {currentQ} of {test.questions})</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-mono text-xl font-bold bg-ph-surface text-ph-dark px-4 py-2 brutal-border">
            29:59
          </div>
          <button onClick={onExit} className="brutal-button bg-ph-red text-white px-4 py-2 font-bold text-sm">
            EXIT
          </button>
        </div>
      </div>

      {/* Question Area */}
      <div className="brutal-card p-8 space-y-8 bg-ph-surface">
        <div className="space-y-4">
          <span className="font-mono font-bold text-ph-blue text-lg">QUESTION {currentQ}</span>
          <h3 className="text-2xl font-bold leading-relaxed">
            What is the output of the following Python code?
          </h3>
          <div className="bg-ph-bg brutal-border p-6 font-mono text-lg overflow-x-auto">
            <pre>
              <code className="text-ph-dark">
{`def greet(name):
    return f"Hello, {name}!"

print(greet("World"))`}
              </code>
            </pre>
          </div>
        </div>

        {/* Answers */}
        <div className="space-y-4 pt-4">
          {['Hello, World!', 'Hello, name!', 'SyntaxError', 'None'].map((ans, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedAnswer(idx)}
              className={`w-full p-6 brutal-border text-left font-mono text-lg font-bold transition-all flex items-center gap-4 ${
                selectedAnswer === idx ? 'bg-ph-yellow text-black brutal-shadow-sm translate-x-[2px] translate-y-[2px]' : 'bg-ph-surface hover:bg-ph-dark/5 brutal-shadow'
              }`}
            >
              <div className={`w-8 h-8 brutal-border flex items-center justify-center ${selectedAnswer === idx ? 'bg-ph-dark text-ph-surface' : 'bg-ph-surface'}`}>
                {['A', 'B', 'C', 'D'][idx]}
              </div>
              {ans}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-8 border-t-2 border-ph-dark">
          <button 
            disabled={currentQ === 1}
            onClick={() => setCurrentQ(q => Math.max(1, q - 1))}
            className="brutal-button bg-ph-surface px-6 py-3 font-bold"
          >
            PREVIOUS
          </button>
          <button 
            onClick={() => setCurrentQ(q => Math.min(test.questions, q + 1))}
            className="brutal-button bg-ph-blue text-white px-8 py-3 font-bold flex items-center gap-2"
          >
            {currentQ === test.questions ? 'SUBMIT TEST' : 'NEXT QUESTION'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
