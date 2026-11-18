export type QuestionType = 'multiple_choice' | 'true_false';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface AdminQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string | null;
  timeLimitSeconds: number;
  basePoints: number;
  position: number;
  updatedAt: string;
}

export interface AdminQuestionListResponse {
  items: AdminQuestion[];
  locked: boolean;
}

export interface QuestionFormInput {
  type: QuestionType;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation?: string | null;
  timeLimitSeconds: number;
  basePoints: number;
}

export interface UpdateQuestionInput extends QuestionFormInput {
  expectedUpdatedAt: string;
}

export interface ReorderQuestionsInput {
  orderedIds: string[];
}
