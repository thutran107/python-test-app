export interface Question {
  id: number;
  body: string;
  options: string[];
  correct_index: number;
  explanation: string;
  topic: string;
}

export interface Test {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

const BASELINE_QUESTIONS: Question[] = [
  // Strings
  {
    id: 1,
    topic: 'Strings',
    body: 'What does len("hello") return?',
    options: ['4', '5', '6', '3'],
    correct_index: 1,
    explanation: 'len() counts characters. "hello" has 5 characters: h, e, l, l, o.',
  },
  {
    id: 2,
    topic: 'Strings',
    body: 'What is the output of "hello"[1]?',
    options: ['"h"', '"e"', '"l"', '"o"'],
    correct_index: 1,
    explanation: 'String indexing starts at 0. Index 1 refers to the second character, which is "e".',
  },
  {
    id: 3,
    topic: 'Strings',
    body: 'Which method converts a string to all uppercase letters?',
    options: ['.capitalize()', '.title()', '.upper()', '.lower()'],
    correct_index: 2,
    explanation: '.upper() converts all characters in the string to uppercase.',
  },
  {
    id: 4,
    topic: 'Strings',
    body: 'What does "hello" + " world" produce?',
    options: ['"hello world"', '"helloworld"', 'Error', '"hello + world"'],
    correct_index: 0,
    explanation: 'The + operator concatenates (joins) two strings together, with the space included in the second string.',
  },

  // Lists
  {
    id: 5,
    topic: 'Lists',
    body: 'How do you add an item to the end of a list called my_list?',
    options: ['my_list.add(item)', 'my_list.insert(item)', 'my_list.append(item)', 'my_list.push(item)'],
    correct_index: 2,
    explanation: '.append() adds a single item to the end of a list.',
  },
  {
    id: 6,
    topic: 'Lists',
    body: 'What is the value of [10, 20, 30][0]?',
    options: ['20', '30', '10', 'Error'],
    correct_index: 2,
    explanation: 'List indexing starts at 0, so index 0 refers to the first element, which is 10.',
  },
  {
    id: 7,
    topic: 'Lists',
    body: 'Which method removes and returns the last item from a list?',
    options: ['.remove()', '.delete()', '.pop()', '.discard()'],
    correct_index: 2,
    explanation: '.pop() removes and returns the last item from a list by default. You can also pass an index to remove a specific item.',
  },
  {
    id: 8,
    topic: 'Lists',
    body: 'What does [1, 2, 3] + [4, 5] produce?',
    options: ['[1, 2, 3, 4, 5]', '[5, 7, 3]', 'Error', '[[1, 2, 3], [4, 5]]'],
    correct_index: 0,
    explanation: 'The + operator on lists concatenates them into a single new list.',
  },

  // Loops
  {
    id: 9,
    topic: 'Loops',
    body: 'What numbers does range(3) produce?',
    options: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '1, 2'],
    correct_index: 1,
    explanation: 'range(3) produces 0, 1, 2. It starts at 0 and goes up to (but not including) 3.',
  },
  {
    id: 10,
    topic: 'Loops',
    body: 'Which keyword immediately exits a loop?',
    options: ['continue', 'exit', 'stop', 'break'],
    correct_index: 3,
    explanation: 'break immediately terminates the loop and moves execution to the first statement after the loop.',
  },
  {
    id: 11,
    topic: 'Loops',
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
    id: 12,
    topic: 'Loops',
    body: 'What is the output of:\nfor i in range(2):\n    print(i)',
    options: ['1\n2', '0\n1', '0\n1\n2', '2'],
    correct_index: 1,
    explanation: 'range(2) generates 0 and 1. The loop prints each value on a new line.',
  },

  // Tuples
  {
    id: 13,
    topic: 'Tuples',
    body: 'Which of the following correctly creates a tuple with one element?',
    options: ['(1)', '[1]', '(1,)', '{1}'],
    correct_index: 2,
    explanation: 'A trailing comma is required to create a single-element tuple. (1) is just parentheses around an integer, not a tuple.',
  },
  {
    id: 14,
    topic: 'Tuples',
    body: 'Tuples are _____ — their elements cannot be changed after creation.',
    options: ['mutable', 'dynamic', 'immutable', 'flexible'],
    correct_index: 2,
    explanation: 'Tuples are immutable. Once created, you cannot add, remove, or change their elements.',
  },
  {
    id: 15,
    topic: 'Tuples',
    body: 'What is the value of (10, 20, 30)[2]?',
    options: ['10', '20', '30', 'Error'],
    correct_index: 2,
    explanation: 'Indexing works the same as lists. Index 2 refers to the third element, which is 30.',
  },

  // Dictionaries
  {
    id: 16,
    topic: 'Dictionaries',
    body: 'Given d = {"name": "Alice", "age": 25}, how do you access the value "Alice"?',
    options: ['d[0]', 'd.get(0)', 'd["name"]', 'd.name'],
    correct_index: 2,
    explanation: 'Dictionary values are accessed by their key. d["name"] returns "Alice".',
  },
  {
    id: 17,
    topic: 'Dictionaries',
    body: 'Which method returns all the keys of a dictionary?',
    options: ['.values()', '.items()', '.keys()', '.all()'],
    correct_index: 2,
    explanation: '.keys() returns a view of all the keys in the dictionary.',
  },
  {
    id: 18,
    topic: 'Dictionaries',
    body: 'How do you add a new key "city" with value "NYC" to a dictionary d?',
    options: ['d.add("city", "NYC")', 'd["city"] = "NYC"', 'd.insert("city", "NYC")', 'd.append("city", "NYC")'],
    correct_index: 1,
    explanation: 'You add or update a key-value pair in a dictionary using the assignment syntax: d["key"] = value.',
  },

  // Functions
  {
    id: 19,
    topic: 'Functions',
    body: 'What keyword is used to define a function in Python?',
    options: ['function', 'func', 'def', 'define'],
    correct_index: 2,
    explanation: 'Python uses the "def" keyword to define a function, followed by the function name and parentheses.',
  },
  {
    id: 20,
    topic: 'Functions',
    body: 'What does a function return if it has no return statement?',
    options: ['0', 'False', 'None', 'Error'],
    correct_index: 2,
    explanation: 'In Python, a function with no return statement (or a bare return) implicitly returns None.',
  },
];

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getBaselineTest(): Test {
  return {
    id: 'baseline',
    name: 'Python Fundamentals',
    description: 'A baseline assessment covering core Python concepts.',
    questions: shuffle(BASELINE_QUESTIONS),
  };
}

export const BASELINE_TOPICS = ['Strings', 'Lists', 'Loops', 'Tuples', 'Dictionaries', 'Functions'];
