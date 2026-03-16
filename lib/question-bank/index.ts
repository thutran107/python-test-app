import type { BankQuestion, QuestionType, Topic, Difficulty } from './types';
import { filterQuestions, type QuestionFilter } from './utils';
import { stringsQuestions } from './questions/strings';
import { listsQuestions } from './questions/lists';
import { loopsQuestions } from './questions/loops';
import { tuplesQuestions } from './questions/tuples';
import { sortingQuestions } from './questions/sorting';
import { dictionariesQuestions } from './questions/dictionaries';

const ALL_QUESTIONS: BankQuestion[] = [
  ...stringsQuestions,
  ...listsQuestions,
  ...loopsQuestions,
  ...tuplesQuestions,
  ...sortingQuestions,
  ...dictionariesQuestions,
];

export function getAllQuestions(): BankQuestion[] {
  return ALL_QUESTIONS;
}

export function getQuestions(filter: QuestionFilter): BankQuestion[] {
  return filterQuestions(ALL_QUESTIONS, filter);
}

export function getAvailableCount(filter: QuestionFilter): Record<QuestionType, number> {
  const filtered = filterQuestions(ALL_QUESTIONS, filter);
  return {
    multiple_choice: filtered.filter(q => q.type === 'multiple_choice').length,
    open_answer: filtered.filter(q => q.type === 'open_answer').length,
    coding: filtered.filter(q => q.type === 'coding').length,
  };
}

export function getTopicCounts(): Record<Topic, number> {
  const counts: Record<string, number> = {};
  for (const q of ALL_QUESTIONS) {
    counts[q.topic] = (counts[q.topic] || 0) + 1;
  }
  return counts as Record<Topic, number>;
}

export { type BankQuestion, type MCQuestion, type OpenQuestion, type CodingQuestion, type TestCase, type QuestionType, type Topic, type Difficulty } from './types';
export { ALL_TOPICS, TOPIC_INFO } from './topics';
export { shuffle, pickRandom, filterQuestions, type QuestionFilter } from './utils';
export { getSwapCandidates } from './test-builder';
