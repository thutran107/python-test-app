import type { BankQuestion } from '../types';

export const loopsQuestions: BankQuestion[] = [
  // ─── Multiple Choice (6) ──────────────────────────────────────────────────
  // Migrated from baseline-test.ts (4)
  {
    id: 'mc-loops-001',
    type: 'multiple_choice',
    topic: 'Loops',
    subtopic: 'range',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What numbers does range(3) produce?',
    options: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '1, 2'],
    correct_index: 1,
    explanation: 'range(3) produces 0, 1, 2. It starts at 0 and goes up to (but not including) 3.',
  },
  {
    id: 'mc-loops-002',
    type: 'multiple_choice',
    topic: 'Loops',
    subtopic: 'break',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'Which keyword immediately exits a loop?',
    options: ['continue', 'exit', 'stop', 'break'],
    correct_index: 3,
    explanation: 'break immediately terminates the loop and moves execution to the first statement after the loop.',
  },
  {
    id: 'mc-loops-003',
    type: 'multiple_choice',
    topic: 'Loops',
    subtopic: 'continue',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What does "continue" do inside a loop?',
    options: [
      'Exits the loop',
      'Restarts the entire loop from the beginning',
      'Skips the rest of the current iteration and moves to the next',
      'Pauses the loop',
    ],
    correct_index: 2,
    explanation: 'continue skips the remaining code in the current iteration and jumps to the next iteration of the loop.',
  },
  {
    id: 'mc-loops-004',
    type: 'multiple_choice',
    topic: 'Loops',
    subtopic: 'for/in',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What is the output of:\nfor i in range(2):\n    print(i)',
    options: ['1\n2', '0\n1', '0\n1\n2', '2'],
    correct_index: 1,
    explanation: 'range(2) generates 0 and 1. The loop prints each value on a new line.',
  },
  // New MC (2)
  {
    id: 'mc-loops-005',
    type: 'multiple_choice',
    topic: 'Loops',
    subtopic: 'while',
    difficulty: 'intermediate',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'How many times does this loop execute?\nx = 10\nwhile x > 0:\n    x -= 3',
    options: ['3', '4', '3.33', 'Infinite loop'],
    correct_index: 1,
    explanation: 'x goes: 10→7→4→1→-2. The loop runs 4 times before x becomes -2 (not > 0).',
  },
  {
    id: 'mc-loops-006',
    type: 'multiple_choice',
    topic: 'Loops',
    subtopic: 'range',
    difficulty: 'intermediate',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What does range(2, 10, 3) produce?',
    options: ['2, 5, 8', '2, 5, 8, 11', '3, 6, 9', '2, 4, 6, 8'],
    correct_index: 0,
    explanation: 'range(start, stop, step) starts at 2, increments by 3: 2, 5, 8. It stops before 10.',
  },

  // ─── Open Answer (4) ──────────────────────────────────────────────────────
  {
    id: 'oa-loops-001',
    type: 'open_answer',
    topic: 'Loops',
    subtopic: 'for/in',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What keyword starts a for loop in Python?',
    acceptable_answers: ['for'],
    explanation: 'Python for loops begin with the "for" keyword, followed by a variable, "in", and an iterable.',
  },
  {
    id: 'oa-loops-002',
    type: 'open_answer',
    topic: 'Loops',
    subtopic: 'range',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'How would you use range() to produce the numbers 1, 2, 3, 4, 5?',
    acceptable_answers: ['range(1, 6)', 'range(1,6)'],
    explanation: 'range(1, 6) starts at 1 and stops before 6, producing 1, 2, 3, 4, 5.',
  },
  {
    id: 'oa-loops-003',
    type: 'open_answer',
    topic: 'Loops',
    subtopic: 'enumerate',
    difficulty: 'intermediate',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What built-in function gives you both the index and value when iterating over a list?',
    acceptable_answers: ['enumerate', 'enumerate()'],
    explanation: 'enumerate() returns pairs of (index, value) for each element in an iterable.',
  },
  {
    id: 'oa-loops-004',
    type: 'open_answer',
    topic: 'Loops',
    subtopic: 'while',
    difficulty: 'intermediate',
    deck_source: 'Python Lists and Looping.pptx',
    body: 'What is the main risk of using a while loop compared to a for loop?',
    acceptable_answers: ['infinite loop', 'infinite loops', 'it can run forever', 'may never terminate'],
    explanation: 'A while loop can run indefinitely if the condition never becomes False, creating an infinite loop.',
    grading_hint: 'Accept any answer mentioning infinite loops or non-termination',
  },

  // ─── Coding (5) ───────────────────────────────────────────────────────────
  // Migrated from practice-exercises.ts (2)
  {
    id: 'code-loops-001',
    type: 'coding',
    topic: 'Loops',
    subtopic: 'for/in',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    title: 'List Sum with a Loop',
    description: 'Fill in the three blanks to complete a function that sums all numbers in a list using a for loop.',
    exercise_type: 'fill_blank',
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
    hints: ['Start your accumulator at 0.', 'Iterate over the parameter name.', 'Use += to add each number to the running total.'],
    test_cases: [
      { id: 1, description: '[1,2,3,4,5] → 15', setup_code: '', call_code: 'print(list_sum([1, 2, 3, 4, 5]))', expected_output: '15' },
      { id: 2, description: '[10,20,30] → 60', setup_code: '', call_code: 'print(list_sum([10, 20, 30]))', expected_output: '60' },
      { id: 3, description: '[] → 0', setup_code: '', call_code: 'print(list_sum([]))', expected_output: '0' },
    ],
  },
  {
    id: 'code-loops-002',
    type: 'coding',
    topic: 'Loops',
    subtopic: 'range',
    difficulty: 'beginner',
    deck_source: 'Python Lists and Looping.pptx',
    title: 'Off-by-One in range()',
    description: 'This function should print numbers 1 through 5, but it prints the wrong numbers. Find and fix the bug.',
    exercise_type: 'fix_bug',
    starter_code: `def print_one_to_five():
    for i in range(5):
        print(i)

print_one_to_five()`,
    solution_code: `def print_one_to_five():
    for i in range(1, 6):
        print(i)

print_one_to_five()`,
    hints: ['range(n) starts at 0 and stops before n.', 'To start at 1 and include 5, use range(1, 6).'],
    test_cases: [
      { id: 1, description: 'Prints 1 through 5', setup_code: '', call_code: '', expected_output: '1\n2\n3\n4\n5' },
    ],
  },
  // New coding (3)
  {
    id: 'code-loops-003',
    type: 'coding',
    topic: 'Loops',
    subtopic: 'while',
    difficulty: 'intermediate',
    deck_source: 'Python Lists and Looping.pptx',
    title: 'Countdown Timer',
    description: 'Write a function countdown(n) that prints numbers from n down to 1, then prints "Go!".',
    exercise_type: 'write_from_scratch',
    starter_code: `def countdown(n):
    # your code here
    pass`,
    solution_code: `def countdown(n):
    while n > 0:
        print(n)
        n -= 1
    print("Go!")`,
    hints: ['Use a while loop that runs while n > 0.', 'Decrement n by 1 each iteration.', 'Print "Go!" after the loop ends.'],
    test_cases: [
      { id: 1, description: 'Countdown from 3', setup_code: '', call_code: 'countdown(3)', expected_output: '3\n2\n1\nGo!' },
      { id: 2, description: 'Countdown from 1', setup_code: '', call_code: 'countdown(1)', expected_output: '1\nGo!' },
    ],
  },
  {
    id: 'code-loops-004',
    type: 'coding',
    topic: 'Loops',
    subtopic: 'break/continue',
    difficulty: 'intermediate',
    deck_source: 'Python Lists and Looping.pptx',
    title: 'Find First Even',
    description: 'Write a function first_even(lst) that returns the first even number in a list, or None if there are no even numbers.',
    exercise_type: 'write_from_scratch',
    starter_code: `def first_even(lst):
    # your code here
    pass`,
    solution_code: `def first_even(lst):
    for num in lst:
        if num % 2 == 0:
            return num
    return None`,
    hints: ['Loop through the list.', 'Check if each number is even using % 2 == 0.', 'Return immediately when you find the first even number.'],
    test_cases: [
      { id: 1, description: '[1,3,4,6] → 4', setup_code: '', call_code: 'print(first_even([1, 3, 4, 6]))', expected_output: '4' },
      { id: 2, description: '[1,3,5] → None', setup_code: '', call_code: 'print(first_even([1, 3, 5]))', expected_output: 'None' },
      { id: 3, description: '[2,4,6] → 2', setup_code: '', call_code: 'print(first_even([2, 4, 6]))', expected_output: '2' },
    ],
  },
  {
    id: 'code-loops-005',
    type: 'coding',
    topic: 'Loops',
    subtopic: 'nested',
    difficulty: 'advanced',
    deck_source: 'Python Lists and Looping.pptx',
    title: 'Predict Nested Loop Output',
    description: 'Read the code and predict the exact output.',
    exercise_type: 'predict_output',
    starter_code: `for i in range(3):
    for j in range(i + 1):
        print("*", end="")
    print()`,
    solution_code: `for i in range(3):
    for j in range(i + 1):
        print("*", end="")
    print()`,
    hints: ['When i=0, inner loop runs 1 time (j=0).', 'When i=1, inner loop runs 2 times.', 'When i=2, inner loop runs 3 times.', 'end="" prevents newline; print() adds one.'],
    test_cases: [
      { id: 1, description: 'Correct output', setup_code: '', call_code: '', expected_output: '*\n**\n***' },
    ],
  },
];
