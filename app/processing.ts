export interface Team {
  id: string;
  alias?: string;
}

export interface HistoryElement {
  time: Date;
  images: Record<string, number>;
}

export enum Tier {
  Platinum = "Platinum",
  Gold = "Gold",
  Silver = "Silver",
  HighSchool = "HighSchool",
  MiddleSchool = "MiddleSchool",
}

export enum Division {
  AllService = "AllService",
  Open = "Open",
  MiddleSchool = "MiddleSchool",
}

export enum OS {
  Windows = "Windows",
  Server = "Server",
  Linux = "Linux",
}

export interface Ranking {
  place: number;
  total: number;
}

export interface Image {
  os: OS | null;
  runtime: number;
  issues: { found: number; remaining: number };
  penalties: number;
  score: number;
  multiple: boolean;
  overtime: boolean;
}

export interface TeamInfoResponse {
  [teamId: string]: {
    images: Image[];
    ranking: { national: Ranking | null; state: Ranking | null };
    history: HistoryElement[];
    updated: Date;
    location: string;
    division: Division | null;
    tier: Tier | null;
    runtime: number;
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

export function getPercentile(ranking: Ranking) {
  return Math.round((ranking.place / ranking.total) * 100);
}

export function formatPercentile(ranking: Ranking) {
  const percentile = getPercentile(ranking);

  return `${percentile}${getOrdinal(percentile)} Percentile`;
}

export function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
