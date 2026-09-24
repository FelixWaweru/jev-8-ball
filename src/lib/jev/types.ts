export interface JevChoiceAnswer {
  type: "choice";
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface JevDecisionsResponse {
  id: string;
  model: string;
  provider?: string;
  answers: { eightball: JevChoiceAnswer };
  usage?: { input_tokens: number; output_tokens: number; cost: number };
}

export interface RankedOutcome {
  id: string;
  label: string;
  probability: number;
}

export interface JevDecisionResult {
  choiceId: string;
  phrase: string;
  confidence: number;
  ranked: RankedOutcome[];
  alternatives: RankedOutcome[];
  usage?: JevDecisionsResponse["usage"];
  rawModel: string;
}

export interface JevAskInput {
  question: string;
  sourceUrl?: string;
  context?: string;
}

export class JevRequestError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "JevRequestError";
    this.status = status;
  }
}
