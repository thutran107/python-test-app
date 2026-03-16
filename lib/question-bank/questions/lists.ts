import type { BankQuestion } from '../types';

export const listsQuestions: BankQuestion[] = [
  // ─── Multiple Choice (8) ──────────────────────────────────────────────────
  // Migrated from baseline-test.ts (4)
  {
    id: 'mc-lists-001',
    type: 'multiple_choice',
    topic: 'Lists',
    subtopic: 'methods',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'How do you add an item to the end of a list called my_list?',
    options: ['my_list.add(item)', 'my_list.insert(item)', 'my_list.append(item)', 'my_list.push(item)'],
    correct_index: 2,
    explanation: '.append() adds a single item to the end of a list.',
  },
  {
    id: 'mc-lists-002',
    type: 'multiple_choice',
    topic: 'Lists',
    subtopic: 'indexing',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What is the value of [10, 20, 30][0]?',
    options: ['20', '30', '10', 'Error'],
    correct_index: 2,
    explanation: 'List indexing starts at 0, so index 0 refers to the first element, which is 10.',
  },
  {
    id: 'mc-lists-003',
    type: 'multiple_choice',
    topic: 'Lists',
    subtopic: 'methods',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'Which method removes and returns the last item from a list?',
    options: ['.remove()', '.delete()', '.pop()', '.discard()'],
    correct_index: 2,
    explanation: '.pop() removes and returns the last item from a list by default.',
  },
  {
    id: 'mc-lists-004',
    type: 'multiple_choice',
    topic: 'Lists',
    subtopic: 'concatenation',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What does [1, 2, 3] + [4, 5] produce?',
    options: ['[1, 2, 3, 4, 5]', '[5, 7, 3]', 'Error', '[[1, 2, 3], [4, 5]]'],
    correct_index: 0,
    explanation: 'The + operator on lists concatenates them into a single new list.',
  },
  // New MC (4)
  {
    id: 'mc-lists-005',
    type: 'multiple_choice',
    topic: 'Lists',
    subtopic: 'slicing',
    difficulty: 'intermediate',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What does [1, 2, 3, 4, 5][1:4] return?',
    options: ['[1, 2, 3, 4]', '[2, 3, 4]', '[2, 3, 4, 5]', '[1, 2, 3]'],
    correct_index: 1,
    explanation: 'Slicing [1:4] returns elements at indices 1, 2, 3 — which are 2, 3, 4.',
  },
  {
    id: 'mc-lists-006',
    type: 'multiple_choice',
    topic: 'Lists',
    subtopic: 'methods',
    difficulty: 'intermediate',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What does len([1, [2, 3], 4]) return?',
    options: ['4', '5', '3', 'Error'],
    correct_index: 2,
    explanation: 'len() counts top-level elements. The list has 3 elements: 1, [2, 3], and 4. The nested list counts as one element.',
  },
  {
    id: 'mc-lists-007',
    type: 'multiple_choice',
    topic: 'Lists',
    subtopic: 'methods',
    difficulty: 'intermediate',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What is the difference between .append() and .extend()?',
    options: [
      'They do the same thing',
      '.append() adds one item; .extend() adds each item from an iterable',
      '.extend() adds one item; .append() adds each item from an iterable',
      '.append() is for strings; .extend() is for lists',
    ],
    correct_index: 1,
    explanation: '.append(x) adds x as a single element. .extend(iterable) adds each element from the iterable individually.',
  },
  {
    id: 'mc-lists-008',
    type: 'multiple_choice',
    topic: 'Lists',
    subtopic: 'methods',
    difficulty: 'advanced',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What does [1, 2, 3].insert(1, 99) do?',
    options: [
      'Replaces index 1 with 99',
      'Inserts 99 at index 1, shifting existing elements right',
      'Inserts 1 at index 99',
      'Appends 99 to the list',
    ],
    correct_index: 1,
    explanation: '.insert(index, value) inserts value before the element at the given index, shifting everything after it to the right.',
  },

  // ─── Open Answer (4) ──────────────────────────────────────────────────────
  {
    id: 'oa-lists-001',
    type: 'open_answer',
    topic: 'Lists',
    subtopic: 'creation',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'How do you create an empty list in Python? Write the expression.',
    acceptable_answers: ['[]', 'list()'],
    explanation: 'An empty list can be created with [] (literal) or list() (constructor).',
  },
  {
    id: 'oa-lists-002',
    type: 'open_answer',
    topic: 'Lists',
    subtopic: 'methods',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What method would you use to find the index of the first occurrence of a value in a list?',
    acceptable_answers: ['.index()', 'index()', 'index'],
    explanation: '.index(value) returns the index of the first occurrence of value in the list.',
  },
  {
    id: 'oa-lists-003',
    type: 'open_answer',
    topic: 'Lists',
    subtopic: 'methods',
    difficulty: 'intermediate',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What is the output of [3, 1, 2].sort()? (What does sort() return?)',
    acceptable_answers: ['None'],
    explanation: '.sort() modifies the list in place and returns None. It does NOT return the sorted list.',
  },
  {
    id: 'oa-lists-004',
    type: 'open_answer',
    topic: 'Lists',
    subtopic: 'slicing',
    difficulty: 'intermediate',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'How do you make a shallow copy of a list called my_list using slicing?',
    acceptable_answers: ['my_list[:]', '[:]', 'my_list.copy()', 'list(my_list)'],
    explanation: 'my_list[:] creates a shallow copy using slice notation. my_list.copy() and list(my_list) also work.',
  },

  // ─── Coding (5) ───────────────────────────────────────────────────────────
  // Migrated from practice-exercises.ts (1)
  {
    id: 'code-lists-001',
    type: 'coding',
    topic: 'Lists',
    subtopic: 'methods',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    title: 'Wrong List Method',
    description: 'This function should remove and return the last item from the list, but it always returns None. Find and fix the bug.',
    exercise_type: 'fix_bug',
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
    hints: ['.remove(value) finds and removes an element by value, but always returns None.', 'To remove and return the last item, use .pop() with no argument.'],
    test_cases: [
      { id: 1, description: 'Returns 3 and list becomes [1, 2]', setup_code: '', call_code: '', expected_output: '3\n[1, 2]' },
    ],
  },
  // New coding (4)
  {
    id: 'code-lists-002',
    type: 'coding',
    topic: 'Lists',
    subtopic: 'methods',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    title: 'List Builder',
    description: 'Fill in the blanks to build a list of squares from 1 to 5.',
    exercise_type: 'fill_blank',
    starter_code: `squares = ____
for i in range(1, 6):
    squares.____(i ** 2)
print(squares)`,
    solution_code: `squares = []
for i in range(1, 6):
    squares.append(i ** 2)
print(squares)`,
    hints: ['Start with an empty list [].', 'Use .append() to add items to the end of a list.'],
    test_cases: [
      { id: 1, description: 'Produces [1, 4, 9, 16, 25]', setup_code: '', call_code: '', expected_output: '[1, 4, 9, 16, 25]' },
    ],
  },
  {
    id: 'code-lists-003',
    type: 'coding',
    topic: 'Lists',
    subtopic: 'methods',
    difficulty: 'intermediate',
    deck_source: 'Python Lists and Looping.pptx',
    title: 'Remove Duplicates',
    description: 'Write a function remove_dupes(lst) that returns a new list with duplicates removed, preserving original order.',
    exercise_type: 'write_from_scratch',
    starter_code: `def remove_dupes(lst):
    # your code here
    pass`,
    solution_code: `def remove_dupes(lst):
    seen = set()
    result = []
    for item in lst:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result`,
    hints: ['Use a set to track what you\'ve already seen.', 'Loop through the list and only add items you haven\'t seen before.'],
    test_cases: [
      { id: 1, description: '[1,2,2,3,1] → [1,2,3]', setup_code: '', call_code: 'print(remove_dupes([1, 2, 2, 3, 1]))', expected_output: '[1, 2, 3]' },
      { id: 2, description: 'Empty list', setup_code: '', call_code: 'print(remove_dupes([]))', expected_output: '[]' },
      { id: 3, description: 'No duplicates', setup_code: '', call_code: 'print(remove_dupes([1, 2, 3]))', expected_output: '[1, 2, 3]' },
    ],
  },
  {
    id: 'code-lists-004',
    type: 'coding',
    topic: 'Lists',
    subtopic: 'methods',
    difficulty: 'intermediate',
    deck_source: 'Python Lists and Looping.pptx',
    title: 'Flatten Nested List',
    description: 'Write a function flatten(lst) that takes a list of lists and returns a single flat list.',
    exercise_type: 'write_from_scratch',
    starter_code: `def flatten(lst):
    # your code here
    pass`,
    solution_code: `def flatten(lst):
    result = []
    for sublist in lst:
        for item in sublist:
            result.append(item)
    return result`,
    hints: ['Use a nested for loop.', 'The outer loop iterates over sublists, the inner loop iterates over items in each sublist.'],
    test_cases: [
      { id: 1, description: '[[1,2],[3,4]] → [1,2,3,4]', setup_code: '', call_code: 'print(flatten([[1, 2], [3, 4]]))', expected_output: '[1, 2, 3, 4]' },
      { id: 2, description: 'Empty sublists', setup_code: '', call_code: 'print(flatten([[], [1], []]))', expected_output: '[1]' },
      { id: 3, description: 'Single sublist', setup_code: '', call_code: 'print(flatten([[1, 2, 3]]))', expected_output: '[1, 2, 3]' },
    ],
  },
  {
    id: 'code-lists-005',
    type: 'coding',
    topic: 'Lists',
    subtopic: 'indexing',
    difficulty: 'advanced',
    deck_source: 'Python Lists and Looping.pptx',
    title: 'Predict List Output',
    description: 'Read the code and predict the exact output.',
    exercise_type: 'predict_output',
    starter_code: `nums = [10, 20, 30, 40, 50]
print(nums[1:4])
nums.append(60)
print(len(nums))
nums.pop(0)
print(nums)`,
    solution_code: `nums = [10, 20, 30, 40, 50]
print(nums[1:4])
nums.append(60)
print(len(nums))
nums.pop(0)
print(nums)`,
    hints: ['Slicing [1:4] gives indices 1, 2, 3.', '.append() increases length by 1.', '.pop(0) removes the first element.'],
    test_cases: [
      { id: 1, description: 'Correct output', setup_code: '', call_code: '', expected_output: '[20, 30, 40]\n6\n[20, 30, 40, 50, 60]' },
    ],
  },
];
