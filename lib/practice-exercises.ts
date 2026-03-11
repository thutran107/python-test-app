export type ExerciseType = 'fill_blank' | 'write_from_scratch' | 'fix_bug' | 'predict_output';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface TestCase {
  id: number;
  description: string;
  setup_code: string;
  call_code: string;
  expected_output: string;
}

export interface Exercise {
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

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  fill_blank: 'Fill in the Blank',
  write_from_scratch: 'Write from Scratch',
  fix_bug: 'Fix the Bug',
  predict_output: 'Predict the Output',
};

// ─── Level Definitions — Creator Guide ───────────────────────────────────────
// Use this as the reference when adding new exercises.
// Each level has a defined scope, primary exercise types, and test case expectations.

export const LEVEL_DEFINITIONS = {
  easy: {
    label: 'Easy',
    tagline: 'Single concept, guided structure',
    color: 'bg-ph-green text-black',
    goal: 'Build familiarity with Python syntax. One idea per exercise. No surprising edge cases.',
    topics: ['Variables & Types', 'Strings (basics)', 'Simple Loops', 'Printing'],
    exercise_types: {
      fill_blank: 'PRIMARY — show 80% of the code, blank out 1–2 key tokens',
      predict_output: 'Good for teaching how Python evaluates expressions step by step',
      fix_bug: 'Off-by-one, wrong method name — simple, obvious bugs',
      write_from_scratch: 'Avoid unless the function is trivial (e.g. "return x + y")',
    },
    test_case_count: '2–3 test cases per exercise',
    example_titles: ['String Reversal', 'List Sum with a Loop', 'Off-by-One in range()'],
  },
  medium: {
    label: 'Medium',
    tagline: 'Multi-step logic, familiar patterns',
    color: 'bg-ph-yellow text-black',
    goal: 'Apply Python tools to solve small problems. Learner writes meaningful logic.',
    topics: ['Lists', 'Dictionaries', 'Functions', 'String Methods', 'Conditionals'],
    exercise_types: {
      write_from_scratch: 'PRIMARY — function signature given, learner writes the body',
      fix_bug: 'Bugs require understanding of data flow, not just syntax',
      fill_blank: 'Use for multi-blank patterns (e.g. dict comprehension scaffold)',
      predict_output: 'Use for tricky iteration or scope questions',
    },
    test_case_count: '3–4 test cases including at least one edge case (empty input, zero, etc.)',
    example_titles: ['Count Vowels', 'Word Frequency', 'Wrong List Method'],
  },
  hard: {
    label: 'Hard',
    tagline: 'Algorithm thinking, edge cases, composition',
    color: 'bg-ph-red text-white',
    goal: 'Solve problems that require combining multiple Python concepts. Edge cases matter.',
    topics: ['List Comprehensions', 'Nested Structures', 'Recursion (basic)', 'Sorting & Filtering', 'OOP basics'],
    exercise_types: {
      write_from_scratch: 'PRIMARY — real function with multiple edge cases to handle',
      fix_bug: 'Logic bugs: off-by-one in recursion, mutating while iterating, wrong return',
      predict_output: 'Complex comprehensions, class __str__, generator behavior',
      fill_blank: 'Sparse — only for elegant patterns (lambda, ternary, comprehension)',
    },
    test_case_count: '4–5 test cases; edge cases required (empty, single-element, negative, None)',
    example_titles: ['Flatten Nested List', 'Group By Key', 'Binary Search'],
  },
} as const;

export const PRACTICE_EXERCISES: Exercise[] = [
  // ─── Fill in the Blank ───────────────────────────────────────────────────────
  {
    id: 'fb-01',
    type: 'fill_blank',
    title: 'String Reversal',
    topic: 'Strings',
    difficulty: 'easy',
    description: 'Fill in the blank to complete the function that reverses a string using Python slice notation.',
    starter_code: `def reverse_string(s):
    return s[____]`,
    solution_code: `def reverse_string(s):
    return s[::-1]`,
    hint: "Python slices work like s[start:stop:step]. A step of -1 means 'go backwards'. Omitting start and stop uses the full string — so s[::-1] reverses it.",
    test_cases: [
      { id: 1, description: "'hello' → 'olleh'", setup_code: '', call_code: 'print(reverse_string("hello"))', expected_output: 'olleh' },
      { id: 2, description: "'Python' → 'nohtyP'", setup_code: '', call_code: 'print(reverse_string("Python"))', expected_output: 'nohtyP' },
      { id: 3, description: "Empty string stays empty", setup_code: '', call_code: 'print(reverse_string(""))', expected_output: '' },
    ],
  },
  {
    id: 'fb-02',
    type: 'fill_blank',
    title: 'List Sum with a Loop',
    topic: 'Loops',
    difficulty: 'easy',
    description: 'Fill in the three blanks to complete a function that sums all numbers in a list using a for loop.',
    starter_code: `def list_sum(numbers):
    total = ____
    for num in ____:
        total ____ num
    return total`,
    solution_code: `def list_sum(numbers):
    total = 0
    for num in numbers:
        total += num
    return total`,
    hint: 'Start your accumulator at 0. Iterate over the parameter name. Use += to add each number to the running total.',
    test_cases: [
      { id: 1, description: '[1,2,3,4,5] → 15', setup_code: '', call_code: 'print(list_sum([1, 2, 3, 4, 5]))', expected_output: '15' },
      { id: 2, description: '[10,20,30] → 60', setup_code: '', call_code: 'print(list_sum([10, 20, 30]))', expected_output: '60' },
      { id: 3, description: '[] → 0', setup_code: '', call_code: 'print(list_sum([]))', expected_output: '0' },
    ],
  },

  // ─── Write from Scratch ──────────────────────────────────────────────────────
  {
    id: 'wfs-01',
    type: 'write_from_scratch',
    title: 'Count Vowels',
    topic: 'Strings',
    difficulty: 'easy',
    description: 'Write a function count_vowels(s) that returns the number of vowels (a, e, i, o, u — case-insensitive) in the string s.',
    starter_code: `def count_vowels(s):
    # your code here
    pass`,
    solution_code: `def count_vowels(s):
    return sum(1 for c in s.lower() if c in 'aeiou')`,
    hint: "Convert to lowercase first with .lower(). Then count characters that appear in the string 'aeiou'. A for loop or sum() with a generator expression both work.",
    test_cases: [
      { id: 1, description: "'hello' has 2 vowels", setup_code: '', call_code: 'print(count_vowels("hello"))', expected_output: '2' },
      { id: 2, description: "'Python' has 1 vowel", setup_code: '', call_code: 'print(count_vowels("Python"))', expected_output: '1' },
      { id: 3, description: "'aeiou' has 5 vowels", setup_code: '', call_code: 'print(count_vowels("aeiou"))', expected_output: '5' },
      { id: 4, description: 'Empty string → 0', setup_code: '', call_code: 'print(count_vowels(""))', expected_output: '0' },
    ],
  },
  {
    id: 'wfs-02',
    type: 'write_from_scratch',
    title: 'Word Frequency',
    topic: 'Dictionaries',
    difficulty: 'medium',
    description: 'Write a function word_freq(text) that takes a space-separated string and returns a dictionary mapping each word to how many times it appears.',
    starter_code: `def word_freq(text):
    # your code here
    pass`,
    solution_code: `def word_freq(text):
    freq = {}
    for word in text.split():
        freq[word] = freq.get(word, 0) + 1
    return freq`,
    hint: "Split the text into words with .split(). For each word, use dict.get(key, 0) + 1 to safely increment its count without a KeyError.",
    test_cases: [
      { id: 1, description: "'a b a' → {a:2, b:1}", setup_code: '', call_code: 'print(sorted(word_freq("a b a").items()))', expected_output: "[('a', 2), ('b', 1)]" },
      { id: 2, description: "'cat cat dog' → {cat:2, dog:1}", setup_code: '', call_code: 'print(sorted(word_freq("cat cat dog").items()))', expected_output: "[('cat', 2), ('dog', 1)]" },
      { id: 3, description: 'Single word → count of 1', setup_code: '', call_code: 'print(sorted(word_freq("hello").items()))', expected_output: "[('hello', 1)]" },
    ],
  },

  // ─── Fix the Bug ─────────────────────────────────────────────────────────────
  {
    id: 'bug-01',
    type: 'fix_bug',
    title: 'Off-by-One in range()',
    topic: 'Loops',
    difficulty: 'easy',
    description: 'This function should print numbers 1 through 5, but it prints the wrong numbers. Find and fix the bug.',
    starter_code: `def print_one_to_five():
    for i in range(5):
        print(i)

print_one_to_five()`,
    solution_code: `def print_one_to_five():
    for i in range(1, 6):
        print(i)

print_one_to_five()`,
    hint: 'range(n) starts at 0 and stops before n. To start at 1 and include 5, use range(1, 6).',
    test_cases: [
      { id: 1, description: 'Prints 1 through 5', setup_code: '', call_code: '', expected_output: '1\n2\n3\n4\n5' },
    ],
  },
  {
    id: 'bug-02',
    type: 'fix_bug',
    title: 'Wrong List Method',
    topic: 'Lists',
    difficulty: 'easy',
    description: 'This function should remove and return the last item from the list, but it always returns None. Find and fix the bug.',
    starter_code: `def remove_last(items):
    return items.remove(items[-1])

my_list = [1, 2, 3]
result = remove_last(my_list)
print(result)
print(my_list)`,
    solution_code: `def remove_last(items):
    return items.pop()

my_list = [1, 2, 3]
result = remove_last(my_list)
print(result)
print(my_list)`,
    hint: '.remove(value) finds and removes an element by value, but always returns None. To remove and return the last item, use .pop() with no argument.',
    test_cases: [
      { id: 1, description: 'Returns 3 and list becomes [1, 2]', setup_code: '', call_code: '', expected_output: '3\n[1, 2]' },
    ],
  },

  // ─── Predict the Output ──────────────────────────────────────────────────────
  {
    id: 'po-01',
    type: 'predict_output',
    title: 'Tuple Unpacking',
    topic: 'Tuples',
    difficulty: 'easy',
    description: 'Read the code carefully and type the exact output it will produce, one line per line.',
    starter_code: `coords = (10, 20, 30)
x, y, z = coords
print(x + z)
print(type(coords))`,
    solution_code: `coords = (10, 20, 30)
x, y, z = coords
print(x + z)
print(type(coords))`,
    hint: "Tuple unpacking assigns each element in order: x=10, y=20, z=30. type() returns the class in the format <class 'typename'>.",
    test_cases: [
      { id: 1, description: 'Correct output', setup_code: '', call_code: '', expected_output: "40\n<class 'tuple'>" },
    ],
  },
  {
    id: 'po-02',
    type: 'predict_output',
    title: 'Dictionary Iteration',
    topic: 'Dictionaries',
    difficulty: 'easy',
    description: 'Read the code carefully and type the exact output it will produce, one line per line.',
    starter_code: `scores = {"Alice": 90, "Bob": 75}
for name, score in scores.items():
    print(f"{name}: {score}")`,
    solution_code: `scores = {"Alice": 90, "Bob": 75}
for name, score in scores.items():
    print(f"{name}: {score}")`,
    hint: '.items() yields (key, value) pairs. Python 3.7+ dictionaries preserve insertion order, so Alice comes before Bob.',
    test_cases: [
      { id: 1, description: 'Correct output', setup_code: '', call_code: '', expected_output: 'Alice: 90\nBob: 75' },
    ],
  },
];

export const EXERCISE_TOPICS: string[] = [
  ...new Set(PRACTICE_EXERCISES.map(e => e.topic)),
];
