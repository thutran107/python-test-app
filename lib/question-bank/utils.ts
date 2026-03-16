import type { BankQuestion, QuestionType, Topic, Difficulty } from './types';

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, count);
}

export interface QuestionFilter {
  topics?: Topic[];
  types?: QuestionType[];
  difficulties?: Difficulty[];
}

export function filterQuestions(questions: BankQuestion[], filter: QuestionFilter): BankQuestion[] {
  return questions.filter(q => {
    if (filter.topics && filter.topics.length > 0 && !filter.topics.includes(q.topic)) return false;
    if (filter.types && filter.types.length > 0 && !filter.types.includes(q.type)) return false;
    if (filter.difficulties && filter.difficulties.length > 0 && !filter.difficulties.includes(q.difficulty)) return false;
    return true;
  });
}
