import type { Topic } from './types';

export const ALL_TOPICS: Topic[] = ['Strings', 'Lists', 'Loops', 'Tuples', 'Sorting', 'Dictionaries'];

export const TOPIC_INFO: Record<Topic, { label: string; description: string; color: string }> = {
  Strings: { label: 'Strings', description: 'String manipulation, indexing, methods, formatting', color: 'bg-ph-blue' },
  Lists: { label: 'Lists', description: 'List operations, methods, slicing', color: 'bg-ph-green' },
  Loops: { label: 'Loops', description: 'For loops, while loops, range, break/continue', color: 'bg-ph-yellow' },
  Tuples: { label: 'Tuples', description: 'Tuple creation, unpacking, immutability', color: 'bg-ph-red' },
  Sorting: { label: 'Sorting', description: 'sorted(), key functions, lambda, comprehensions', color: 'bg-purple-500' },
  Dictionaries: { label: 'Dictionaries', description: 'Dict methods, iteration, file I/O', color: 'bg-orange-500' },
};

export const DECK_TO_TOPICS: Record<string, Topic[]> = {
  'Understanding Python Strings - Part 1 (Session 3) (1).pptx': ['Strings'],
  'Understanding Python Strings - Part 2 (Session 4) (1).pptx': ['Strings'],
  'Python Lists and Looping.pptx': ['Lists', 'Loops'],
  'Python Sorting, Tuples, and List Comprehensions.pptx': ['Sorting', 'Tuples'],
  'Python Dictionaries and Files.pptx': ['Dictionaries'],
};
