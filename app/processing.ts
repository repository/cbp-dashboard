export interface Team {
  id: string;
  alias?: string;
}

export interface HistoryElement {
  time: Date;
  images: Record<string, number>;
}

export interface Image {
  name: string;
  runtime: number;
  issues: {
    found: number;
    remaining: number;
  };
  penalties: number;
  score: number;
  multiple: boolean;
  overtime: boolean;
}

export interface TeamInfoResponse {
  [teamId: string]: {
    images: Image[];
    history: HistoryElement[];
    updated: string;
  } | null;
}

export function getTotalScore(data: TeamInfoResponse[string]) {
  return data?.images.reduce((a, b) => a + b.score, 0);
}

export interface RuntimeLog {
  [teamId: string]: {
    [image: string]: {
      runtime: number;
      since: Date;
    };
  };
}
