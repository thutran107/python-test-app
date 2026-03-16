export type Topic = 'Strings' | 'Lists' | 'Loops' | 'Tuples' | 'Sorting' | 'Dictionaries';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type QuestionType = 'multiple_choice' | 'open_answer' | 'coding';

interface QuestionBase {
  id: string;
  type: QuestionType;
  topic: Topic;
  subtopic?: string;
  difficulty: Difficulty;
  deck_source?: string;
}

export interface MCQuestion extends QuestionBase {
  type: 'multiple_choice';
  body: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface OpenQuestion extends QuestionBase {
  type: 'open_answer';
  body: string;
  acceptable_answers: string[];
  explanation: string;
  grading_hint?: string;
}

export interface TestCase {
  id: number;
  description: string;
  setup_code: string;
  call_code: string;
  expected_output: string;
}

export interface CodingQuestion extends QuestionBase {
  type: 'coding';
  title: string;
  description: string;
  exercise_type: 'fill_blank' | 'write_from_scratch' | 'fix_bug' | 'predict_output';
  starter_code: string;
  solution_code: string;
  hints: string[];
  test_cases: TestCase[];
}

export type BankQuestion = MCQuestion | OpenQuestion | CodingQuestion;
