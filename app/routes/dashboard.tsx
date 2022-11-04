import { useEffect, useState } from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import TeamCard from "~/components/team-card";
import type { Team } from "~/components/team-table";

export interface HistoryElement {
  time: Date;
  images: Record<string, number>;
}

export type TeamInfoResponse = Record<
  string,
  {
    images: {
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
    }[];
    history: HistoryElement[];
    updated: Date;
  } | null
>;

const Dashboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsData, setTeamsData] = useState<TeamInfoResponse>({});

  useEffect(() => {
    const lsTeams = JSON.parse(localStorage.getItem("teams") ?? "[]");
    if (Array.isArray(lsTeams) && lsTeams.length > 0) {
      setTeams(lsTeams);
    }
  }, []);

  useEffect(() => {
    const getData = async () => {
      if (teams.length === 0) return;

      const res = await fetch(
        "https://cyberpatriot-scoreboard.xcvr48.workers.dev/info?teams=" + teams.map((t) => t.id).join(","),
      );

      if (!res.ok) return;

      const data = (await res.json()) as TeamInfoResponse;

      setTeamsData(data);
    };

    getData();
    const interval = setInterval(getData, 10 * 1000);

    return () => clearInterval(interval);
  }, [teams]);

  const [sorted, setSorted] = useState<[Team, TeamInfoResponse[string]][]>([]);

  const calculateScore = (data: TeamInfoResponse[string]) => {
    return data?.images.reduce((a, b) => a + b.score, 0) ?? 0;
  };

  useEffect(() => {
    const tuples = Object.entries(teamsData).map(([id, data]) => {
      const team = teams.find((t) => t.id === id);
      return [team, data] as [Team, TeamInfoResponse[string]];
    });

    tuples.sort((a, b) => calculateScore(b[1]) - calculateScore(a[1]));

    setSorted(tuples);
  }, [teams, teamsData]);

  return (
    <div className="flex h-screen justify-center items-center flex-col">
      <Flipper flipKey={sorted.map(([team]) => team.id).join("")}>
        <ul>
          {sorted.map(([team, data]) => {
            return (
              <Flipped key={team.id} flipId={team.id}>
                <li>
                  <TeamCard team={team} data={data} />
                </li>
              </Flipped>
            );
          })}
        </ul>
      </Flipper>
    </div>
  );
};

export default Dashboard;
