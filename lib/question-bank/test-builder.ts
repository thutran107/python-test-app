import type { BankQuestion, QuestionType, Topic, Difficulty } from './types';
import { getQuestions } from './index';
import { shuffle, pickRandom } from './utils';

export type SelectionMode = 'auto' | 'manual';

export interface TestConfig {
  name: string;
  selectionMode: SelectionMode;
  selectedTopics: Topic[];
  questionTypes: {
    multiple_choice: { enabled: boolean; count: number };
    open_answer: { enabled: boolean; count: number };
    coding: { enabled: boolean; count: number };
  };
  difficulty: Difficulty | 'mixed';
  totalQuestions: number;
  duration: number;
  manuallySelected: string[]; // question IDs for manual mode
}

export interface AssembledTest {
  id: string;
  name: string;
  questions: BankQuestion[];
  config: TestConfig;
}

export interface BuildError {
  type: QuestionType;
  requested: number;
  available: number;
}

export function buildTest(config: TestConfig): { test: AssembledTest | null; errors: BuildError[] } {
  // Manual mode: use hand-picked questions
  if (config.selectionMode === 'manual') {
    const allQuestions = getQuestions({});
    const selected = config.manuallySelected
      .map(id => allQuestions.find(q => q.id === id))
      .filter((q): q is BankQuestion => q !== undefined);

    if (selected.length === 0) {
      return { test: null, errors: [] };
    }

    return {
      test: {
        id: `test-${Date.now()}`,
        name: config.name,
        questions: shuffle(selected),
        config,
      },
      errors: [],
    };
  }

  // Auto mode: pick by type/count
  const errors: BuildError[] = [];
  const selected: BankQuestion[] = [];

  const difficulties: Difficulty[] | undefined =
    config.difficulty === 'mixed' ? undefined : [config.difficulty];

  const types: Array<{ type: QuestionType; count: number }> = [];
  if (config.questionTypes.multiple_choice.enabled) {
    types.push({ type: 'multiple_choice', count: config.questionTypes.multiple_choice.count });
  }
  if (config.questionTypes.open_answer.enabled) {
    types.push({ type: 'open_answer', count: config.questionTypes.open_answer.count });
  }
  if (config.questionTypes.coding.enabled) {
    types.push({ type: 'coding', count: config.questionTypes.coding.count });
  }

  for (const { type, count } of types) {
    const available = getQuestions({
      topics: config.selectedTopics,
      types: [type],
      difficulties,
    });

    if (available.length < count) {
      errors.push({ type, requested: count, available: available.length });
    }

    selected.push(...pickRandom(available, Math.min(count, available.length)));
  }

  if (errors.length > 0 && selected.length === 0) {
    return { test: null, errors };
  }

  return {
    test: {
      id: `test-${Date.now()}`,
      name: config.name,
      questions: shuffle(selected),
      config,
    },
    errors,
  };
}

export function getSwapCandidates(
  currentQuestion: BankQuestion,
  alreadySelectedIds: string[],
  options?: { sameType?: boolean }
): BankQuestion[] {
  const all = getQuestions({
    topics: [currentQuestion.topic as Topic],
    difficulties: [currentQuestion.difficulty],
  });
  return all.filter(q =>
    q.id !== currentQuestion.id &&
    !alreadySelectedIds.includes(q.id) &&
    (options?.sameType ? q.type === currentQuestion.type : true)
  );
}

export function getDefaultConfig(): TestConfig {
  return {
    name: '',
    selectionMode: 'auto',
    selectedTopics: [],
    questionTypes: {
      multiple_choice: { enabled: true, count: 10 },
      open_answer: { enabled: false, count: 0 },
      coding: { enabled: false, count: 0 },
    },
    difficulty: 'mixed',
    totalQuestions: 10,
    duration: 30,
    manuallySelected: [],
  };
}
