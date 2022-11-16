import { differenceInMinutes } from "date-fns";

export interface Team {
  id: string;
  alias?: string;
}

export interface HistoryElement {
  time: Date;
  images: Record<OS, number | null>;
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
  return Math.floor((100 * (ranking.total - ranking.place)) / ranking.total);
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

export function prepareHistory(history: HistoryElement[]) {
  if (history.length === 0) {
    return [];
  }

  const newHistory = history.map((h) => ({ time: h.time.getTime(), ...h.images }));

  // while (differenceInMinutes(newHistory[Math.max(newHistory.length - 1, 0)].time, newHistory[0].time) < 360) {
  //   newHistory.push({
  //     time: addMinutes(newHistory[newHistory.length - 1].time, 5).getTime(),
  //     Windows: null,
  //     Server: null,
  //     Linux: null,
  //   });
  // }

  return newHistory;
}

export function isStopped(data: TeamInfoResponse[string], teamRtl: RuntimeLog[string], image: Image | null) {
  const imageRtl = image?.os && teamRtl ? teamRtl[image.os] : undefined;

  return (
    (imageRtl &&
      image &&
      data?.updated &&
      imageRtl.runtime === image?.runtime &&
      differenceInMinutes(data.updated, imageRtl.since) > 1) ??
    false
  );
}

export const imageDisplayOrder = [OS.Windows, OS.Server, OS.Linux];
