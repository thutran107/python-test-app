import type { BankQuestion } from '@/lib/question-bank/types';

export interface AnswerSubmission {
  question_id: string;
  type: 'multiple_choice' | 'open_answer' | 'coding';
  response: string | number;
  coding_results?: Array<{ test_case_id: number; passed: boolean; actual: string }>;
}

export interface GradedAnswer {
  question_id: string;
  type: 'multiple_choice' | 'open_answer' | 'coding';
  response: string | number;
  correct: boolean;
  details: {
    correct_answer?: string | number;
    explanation?: string;
    test_results?: Array<{ test_case_id: number; passed: boolean; actual: string }>;
  };
}

export interface GradingResult {
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  passed: boolean;
  graded_answers: GradedAnswer[];
}

export function gradeTest(
  questions: BankQuestion[],
  submissions: AnswerSubmission[],
  passThreshold: number = 70
): GradingResult {
  const questionMap = new Map(questions.map(q => [q.id, q]));
  const graded: GradedAnswer[] = [];

  for (const sub of submissions) {
    const question = questionMap.get(sub.question_id);
    if (!question) {
      graded.push({
        question_id: sub.question_id,
        type: sub.type,
        response: sub.response,
        correct: false,
        details: { explanation: 'Question not found' },
      });
      continue;
    }

    switch (question.type) {
      case 'multiple_choice': {
        const correct = sub.response === question.correct_index;
        graded.push({
          question_id: sub.question_id,
          type: 'multiple_choice',
          response: sub.response,
          correct,
          details: {
            correct_answer: question.correct_index,
            explanation: question.explanation,
          },
        });
        break;
      }

      case 'open_answer': {
        const userAnswer = String(sub.response).trim().toLowerCase();
        const correct = question.acceptable_answers.some(
          a => a.trim().toLowerCase() === userAnswer
        );
        graded.push({
          question_id: sub.question_id,
          type: 'open_answer',
          response: sub.response,
          correct,
          details: {
            correct_answer: question.acceptable_answers[0],
            explanation: question.explanation,
          },
        });
        break;
      }

      case 'coding': {
        const testResults = sub.coding_results || [];
        const allPassed = testResults.length > 0 && testResults.every(r => r.passed);
        graded.push({
          question_id: sub.question_id,
          type: 'coding',
          response: sub.response,
          correct: allPassed,
          details: {
            test_results: testResults,
          },
        });
        break;
      }
    }
  }

  const correct = graded.filter(g => g.correct).length;
  const total = questions.length;
  const score = total > 0 ? (correct / total) * 100 : 0;

  return {
    total_questions: total,
    correct_answers: correct,
    score_percentage: Math.round(score * 100) / 100,
    passed: score >= passThreshold,
    graded_answers: graded,
  };
}
