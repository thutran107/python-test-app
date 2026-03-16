import type { BankQuestion } from '../types';

export const dictionariesQuestions: BankQuestion[] = [
  // ─── Multiple Choice (6) ──────────────────────────────────────────────────
  // Migrated from baseline-test.ts (3)
  {
    id: 'mc-dicts-001',
    type: 'multiple_choice',
    topic: 'Dictionaries',
    subtopic: 'access',
    difficulty: 'beginner',
    deck_source: 'Python Dictionaries and Files.pptx',
    body: 'Given d = {"name": "Alice", "age": 25}, how do you access the value "Alice"?',
    options: ['d[0]', 'd.get(0)', 'd["name"]', 'd.name'],
    correct_index: 2,
    explanation: 'Dictionary values are accessed by their key. d["name"] returns "Alice".',
  },
  {
    id: 'mc-dicts-002',
    type: 'multiple_choice',
    topic: 'Dictionaries',
    subtopic: 'methods',
    difficulty: 'beginner',
    deck_source: 'Python Dictionaries and Files.pptx',
    body: 'Which method returns all the keys of a dictionary?',
    options: ['.values()', '.items()', '.keys()', '.all()'],
    correct_index: 2,
    explanation: '.keys() returns a view of all the keys in the dictionary.',
  },
  {
    id: 'mc-dicts-003',
    type: 'multiple_choice',
    topic: 'Dictionaries',
    subtopic: 'assignment',
    difficulty: 'beginner',
    deck_source: 'Python Dictionaries and Files.pptx',
    body: 'How do you add a new key "city" with value "NYC" to a dictionary d?',
    options: ['d.add("city", "NYC")', 'd["city"] = "NYC"', 'd.insert("city", "NYC")', 'd.append("city", "NYC")'],
    correct_index: 1,
    explanation: 'You add or update a key-value pair in a dictionary using the assignment syntax: d["key"] = value.',
  },
  // New MC (3)
  {
    id: 'mc-dicts-004',
    type: 'multiple_choice',
    topic: 'Dictionaries',
    subtopic: 'methods',
    difficulty: 'intermediate',
    deck_source: 'Python Dictionaries and Files.pptx',
    body: 'What does d.get("key", "default") return if "key" is not in d?',
    options: ['None', '"key"', '"default"', 'KeyError'],
    correct_index: 2,
    explanation: '.get(key, default) returns the default value if the key is not found, instead of raising a KeyError.',
  },
  {
    id: 'mc-dicts-005',
    type: 'multiple_choice',
    topic: 'Dictionaries',
    subtopic: 'del',
    difficulty: 'intermediate',
    deck_source: 'Python Dictionaries and Files.pptx',
    body: 'How do you remove a key "age" from dictionary d?',
    options: ['d.remove("age")', 'del d["age"]', 'd.discard("age")', 'd.pop["age"]'],
    correct_index: 1,
    explanation: 'del d["age"] removes the key-value pair. d.pop("age") also works but uses parentheses, not brackets.',
  },
  {
    id: 'mc-dicts-006',
    type: 'multiple_choice',
    topic: 'Dictionaries',
    subtopic: 'iteration',
    difficulty: 'advanced',
    deck_source: 'Python Dictionaries and Files.pptx',
    body: 'What does the following code print?\nfor k, v in {"a": 1, "b": 2}.items():\n    print(k, v)',
    options: ['a 1\\nb 2', '("a", 1)\\n("b", 2)', 'a\\nb', '1\\n2'],
    correct_index: 0,
    explanation: '.items() yields (key, value) tuples. Unpacking them into k, v and printing gives "a 1" and "b 2".',
  },

  // ─── Open Answer (4) ──────────────────────────────────────────────────────
  {
    id: 'oa-dicts-001',
    type: 'open_answer',
    topic: 'Dictionaries',
    subtopic: 'creation',
    difficulty: 'beginner',
    deck_source: 'Python Dictionaries and Files.pptx',
    body: 'How do you create an empty dictionary in Python?',
    acceptable_answers: ['{}', 'dict()'],
    explanation: 'An empty dictionary can be created with {} (literal) or dict() (constructor).',
  },
  {
    id: 'oa-dicts-002',
    type: 'open_answer',
    topic: 'Dictionaries',
    subtopic: 'methods',
    difficulty: 'beginner',
    deck_source: 'Python Dictionaries and Files.pptx',
    body: 'What method returns all key-value pairs of a dictionary as tuples?',
    acceptable_answers: ['.items()', 'items()', 'items'],
    explanation: '.items() returns a view of (key, value) tuples for all entries in the dictionary.',
  },
  {
    id: 'oa-dicts-003',
    type: 'open_answer',
    topic: 'Dictionaries',
    subtopic: 'membership',
    difficulty: 'intermediate',
    deck_source: 'Python Dictionaries and Files.pptx',
    body: 'How do you check if a key "name" exists in a dictionary d?',
    acceptable_answers: ['"name" in d', "'name' in d", 'name in d', 'in'],
    explanation: 'The "in" operator checks if a key exists in a dictionary: "name" in d returns True or False.',
    grading_hint: 'Accept any answer using the "in" operator',
  },
  {
    id: 'oa-dicts-004',
    type: 'open_answer',
    topic: 'Dictionaries',
    subtopic: 'methods',
    difficulty: 'advanced',
    deck_source: 'Python Dictionaries and Files.pptx',
    body: 'What happens if you call d["key"] and "key" does not exist in d?',
    acceptable_answers: ['KeyError', 'raises KeyError', 'it raises a KeyError', 'error'],
    explanation: 'Accessing a non-existent key with bracket notation raises a KeyError. Use .get() to avoid this.',
    grading_hint: 'Accept any answer mentioning KeyError',
  },

  // ─── Coding (4) ───────────────────────────────────────────────────────────
  // Migrated from practice-exercises.ts (2)
  {
    id: 'code-dicts-001',
    type: 'coding',
    topic: 'Dictionaries',
    subtopic: 'methods',
    difficulty: 'intermediate',
    deck_source: 'Python Dictionaries and Files.pptx',
    title: 'Word Frequency',
    description: 'Write a function word_freq(text) that takes a space-separated string and returns a dictionary mapping each word to how many times it appears.',
    exercise_type: 'write_from_scratch',
    starter_code: `def word_freq(text):
    # your code here
    pass`,
    solution_code: `def word_freq(text):
    freq = {}
    for word in text.split():
        freq[word] = freq.get(word, 0) + 1
    return freq`,
    hints: ["Split the text into words with .split().", "For each word, use dict.get(key, 0) + 1 to safely increment its count.", "No need to check if the key exists first."],
    test_cases: [
      { id: 1, description: "'a b a' → {a:2, b:1}", setup_code: '', call_code: 'print(sorted(word_freq("a b a").items()))', expected_output: "[('a', 2), ('b', 1)]" },
      { id: 2, description: "'cat cat dog' → {cat:2, dog:1}", setup_code: '', call_code: 'print(sorted(word_freq("cat cat dog").items()))', expected_output: "[('cat', 2), ('dog', 1)]" },
      { id: 3, description: 'Single word → count of 1', setup_code: '', call_code: 'print(sorted(word_freq("hello").items()))', expected_output: "[('hello', 1)]" },
    ],
  },
  {
    id: 'code-dicts-002',
    type: 'coding',
    topic: 'Dictionaries',
    subtopic: 'iteration',
    difficulty: 'beginner',
    deck_source: 'Python Dictionaries and Files.pptx',
    title: 'Dictionary Iteration',
    description: 'Read the code carefully and type the exact output it will produce, one line per line.',
    exercise_type: 'predict_output',
    starter_code: `scores = {"Alice": 90, "Bob": 75}
for name, score in scores.items():
    print(f"{name}: {score}")`,
    solution_code: `scores = {"Alice": 90, "Bob": 75}
for name, score in scores.items():
    print(f"{name}: {score}")`,
    hints: ['.items() yields (key, value) pairs.', 'Python 3.7+ dictionaries preserve insertion order.'],
    test_cases: [
      { id: 1, description: 'Correct output', setup_code: '', call_code: '', expected_output: 'Alice: 90\nBob: 75' },
    ],
  },
  // New coding (2)
  {
    id: 'code-dicts-003',
    type: 'coding',
    topic: 'Dictionaries',
    subtopic: 'methods',
    difficulty: 'intermediate',
    deck_source: 'Python Dictionaries and Files.pptx',
    title: 'Invert Dictionary',
    description: 'Write a function invert_dict(d) that swaps keys and values. Assume all values are unique.',
    exercise_type: 'write_from_scratch',
    starter_code: `def invert_dict(d):
    # your code here
    pass`,
    solution_code: `def invert_dict(d):
    return {v: k for k, v in d.items()}`,
    hints: ['Loop through .items() to get key-value pairs.', 'Create a new dict with values as keys and keys as values.', 'A dict comprehension is concise: {v: k for k, v in d.items()}.'],
    test_cases: [
      { id: 1, description: 'Invert simple dict', setup_code: '', call_code: 'print(sorted(invert_dict({"a": 1, "b": 2}).items()))', expected_output: "[(1, 'a'), (2, 'b')]" },
      { id: 2, description: 'Empty dict', setup_code: '', call_code: 'print(invert_dict({}))', expected_output: '{}' },
    ],
  },
  {
    id: 'code-dicts-004',
    type: 'coding',
    topic: 'Dictionaries',
    subtopic: 'creation',
    difficulty: 'advanced',
    deck_source: 'Python Dictionaries and Files.pptx',
    title: 'Group by First Letter',
    description: 'Write a function group_by_first(words) that groups words by their first letter into a dictionary of lists.',
    exercise_type: 'write_from_scratch',
    starter_code: `def group_by_first(words):
    # your code here
    pass`,
    solution_code: `def group_by_first(words):
    groups = {}
    for word in words:
        key = word[0]
        if key not in groups:
            groups[key] = []
        groups[key].append(word)
    return groups`,
    hints: ['Use the first character word[0] as the key.', 'Initialize an empty list for new keys.', 'Append each word to its group.'],
    test_cases: [
      { id: 1, description: 'Group words', setup_code: '', call_code: 'result = group_by_first(["apple", "ant", "bee", "bat"])\nprint(sorted(result["a"]))\nprint(sorted(result["b"]))', expected_output: "['ant', 'apple']\n['bat', 'bee']" },
      { id: 2, description: 'Single word', setup_code: '', call_code: 'print(group_by_first(["hi"]))', expected_output: "{'h': ['hi']}" },
    ],
  },
];
