import type { BankQuestion } from '../types';

export const tuplesQuestions: BankQuestion[] = [
  // ─── Multiple Choice (5) ──────────────────────────────────────────────────
  // Migrated from baseline-test.ts (3)
  {
    id: 'mc-tuples-001',
    type: 'multiple_choice',
    topic: 'Tuples',
    subtopic: 'creation',
    difficulty: 'beginner',
    deck_source: 'Python Sorting, Tuples, and List Comprehensions.pptx',
    body: 'Which of the following correctly creates a tuple with one element?',
    options: ['(1)', '[1]', '(1,)', '{1}'],
    correct_index: 2,
    explanation: 'A trailing comma is required to create a single-element tuple. (1) is just parentheses around an integer, not a tuple.',
  },
  {
    id: 'mc-tuples-002',
    type: 'multiple_choice',
    topic: 'Tuples',
    subtopic: 'immutability',
    difficulty: 'beginner',
    deck_source: 'Python Sorting, Tuples, and List Comprehensions.pptx',
    body: 'Tuples are _____ — their elements cannot be changed after creation.',
    options: ['mutable', 'dynamic', 'immutable', 'flexible'],
    correct_index: 2,
    explanation: 'Tuples are immutable. Once created, you cannot add, remove, or change their elements.',
  },
  {
    id: 'mc-tuples-003',
    type: 'multiple_choice',
    topic: 'Tuples',
    subtopic: 'indexing',
    difficulty: 'beginner',
    deck_source: 'Python Sorting, Tuples, and List Comprehensions.pptx',
    body: 'What is the value of (10, 20, 30)[2]?',
    options: ['10', '20', '30', 'Error'],
    correct_index: 2,
    explanation: 'Indexing works the same as lists. Index 2 refers to the third element, which is 30.',
  },
  // New MC (2)
  {
    id: 'mc-tuples-004',
    type: 'multiple_choice',
    topic: 'Tuples',
    subtopic: 'unpacking',
    difficulty: 'intermediate',
    deck_source: 'Python Sorting, Tuples, and List Comprehensions.pptx',
    body: 'What does a, b, c = (1, 2, 3) do?',
    options: [
      'Creates a tuple (a, b, c)',
      'Assigns a=1, b=2, c=3',
      'Creates a list [1, 2, 3]',
      'Raises a TypeError',
    ],
    correct_index: 1,
    explanation: 'Tuple unpacking assigns each value to the corresponding variable. a gets 1, b gets 2, c gets 3.',
  },
  {
    id: 'mc-tuples-005',
    type: 'multiple_choice',
    topic: 'Tuples',
    subtopic: 'vs-lists',
    difficulty: 'intermediate',
    deck_source: 'Python Sorting, Tuples, and List Comprehensions.pptx',
    body: 'Which of the following is a valid reason to use a tuple instead of a list?',
    options: [
      'Tuples are faster to iterate over',
      'Tuples can be used as dictionary keys',
      'Tuples use less memory',
      'All of the above',
    ],
    correct_index: 3,
    explanation: 'Tuples are faster, use less memory, and — because they are immutable — can be used as dictionary keys. All three are valid reasons.',
  },

  // ─── Open Answer (3) ──────────────────────────────────────────────────────
  {
    id: 'oa-tuples-001',
    type: 'open_answer',
    topic: 'Tuples',
    subtopic: 'creation',
    difficulty: 'beginner',
    deck_source: 'Python Sorting, Tuples, and List Comprehensions.pptx',
    body: 'What built-in function converts a list [1, 2, 3] into a tuple?',
    acceptable_answers: ['tuple()', 'tuple'],
    explanation: 'The tuple() constructor converts any iterable (like a list) into a tuple.',
  },
  {
    id: 'oa-tuples-002',
    type: 'open_answer',
    topic: 'Tuples',
    subtopic: 'unpacking',
    difficulty: 'intermediate',
    deck_source: 'Python Sorting, Tuples, and List Comprehensions.pptx',
    body: 'In Python, how can you swap the values of two variables a and b in one line?',
    acceptable_answers: ['a, b = b, a', 'a,b = b,a', 'a, b = b,a', 'a,b = b, a'],
    explanation: 'Python tuple packing/unpacking allows a, b = b, a to swap values without a temporary variable.',
  },
  {
    id: 'oa-tuples-003',
    type: 'open_answer',
    topic: 'Tuples',
    subtopic: 'methods',
    difficulty: 'intermediate',
    deck_source: 'Python Sorting, Tuples, and List Comprehensions.pptx',
    body: 'Name the two methods available on tuples (but not on lists exclusively).',
    acceptable_answers: ['count and index', 'index and count', '.count() and .index()', '.index() and .count()'],
    explanation: 'Tuples have only two methods: .count(value) and .index(value). Lists have these too, plus many more since they are mutable.',
    grading_hint: 'Accept answers mentioning count and index in any order',
  },

  // ─── Coding (3) ───────────────────────────────────────────────────────────
  // Migrated from practice-exercises.ts (1)
  {
    id: 'code-tuples-001',
    type: 'coding',
    topic: 'Tuples',
    subtopic: 'unpacking',
    difficulty: 'beginner',
    deck_source: 'Python Sorting, Tuples, and List Comprehensions.pptx',
    title: 'Tuple Unpacking',
    description: 'Read the code carefully and type the exact output it will produce, one line per line.',
    exercise_type: 'predict_output',
    starter_code: `coords = (10, 20, 30)
x, y, z = coords
print(x + z)
print(type(coords))`,
    solution_code: `coords = (10, 20, 30)
x, y, z = coords
print(x + z)
print(type(coords))`,
    hints: ["Tuple unpacking assigns each element in order: x=10, y=20, z=30.", "type() returns the class in the format <class 'typename'>."],
    test_cases: [
      { id: 1, description: 'Correct output', setup_code: '', call_code: '', expected_output: "40\n<class 'tuple'>" },
    ],
  },
  // New coding (2)
  {
    id: 'code-tuples-002',
    type: 'coding',
    topic: 'Tuples',
    subtopic: 'unpacking',
    difficulty: 'intermediate',
    deck_source: 'Python Sorting, Tuples, and List Comprehensions.pptx',
    title: 'Tuple to Dict',
    description: 'Write a function pairs_to_dict(pairs) that takes a list of (key, value) tuples and returns a dictionary.',
    exercise_type: 'write_from_scratch',
    starter_code: `def pairs_to_dict(pairs):
    # your code here
    pass`,
    solution_code: `def pairs_to_dict(pairs):
    result = {}
    for key, value in pairs:
        result[key] = value
    return result`,
    hints: ['Loop through the list, unpacking each tuple into key and value.', 'Assign each key-value pair to the dictionary.'],
    test_cases: [
      { id: 1, description: 'Basic pairs', setup_code: '', call_code: 'print(sorted(pairs_to_dict([("a", 1), ("b", 2)]).items()))', expected_output: "[('a', 1), ('b', 2)]" },
      { id: 2, description: 'Empty list', setup_code: '', call_code: 'print(pairs_to_dict([]))', expected_output: '{}' },
    ],
  },
  {
    id: 'code-tuples-003',
    type: 'coding',
    topic: 'Tuples',
    subtopic: 'packing',
    difficulty: 'advanced',
    deck_source: 'Python Sorting, Tuples, and List Comprehensions.pptx',
    title: 'Min and Max',
    description: 'Write a function min_max(lst) that returns a tuple of (minimum, maximum) from a list of numbers. Do NOT use the built-in min() or max().',
    exercise_type: 'write_from_scratch',
    starter_code: `def min_max(lst):
    # your code here
    pass`,
    solution_code: `def min_max(lst):
    lo = lst[0]
    hi = lst[0]
    for num in lst:
        if num < lo:
            lo = num
        if num > hi:
            hi = num
    return (lo, hi)`,
    hints: ['Initialize both min and max to the first element.', 'Loop through and update as you find smaller/larger values.', 'Return both as a tuple.'],
    test_cases: [
      { id: 1, description: '[3,1,4,1,5] → (1, 5)', setup_code: '', call_code: 'print(min_max([3, 1, 4, 1, 5]))', expected_output: '(1, 5)' },
      { id: 2, description: 'Single element', setup_code: '', call_code: 'print(min_max([42]))', expected_output: '(42, 42)' },
      { id: 3, description: 'Negative numbers', setup_code: '', call_code: 'print(min_max([-5, 0, 5]))', expected_output: '(-5, 5)' },
    ],
  },
];
