import { createContext, useEffect, useState } from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import TeamCard from "~/components/team-card";
import { getTotalScore } from "~/processing";
import type { TeamInfoResponse, RuntimeLog, Team } from "~/processing";

interface DashboardContextValue {
  runtimeLog: RuntimeLog;
}

export const DashboardContext = createContext<DashboardContextValue>({
  runtimeLog: {},
});

const Dashboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsData, setTeamsData] = useState<TeamInfoResponse>({});
  const [runtimeLog, setRuntimeLog] = useState<RuntimeLog>({});

  useEffect(() => {
    const lsTeams = JSON.parse(localStorage.getItem("teams") ?? "[]");
    if (Array.isArray(lsTeams) && lsTeams.length > 0) {
      setTeams(lsTeams);
    }

    const lsRuntimeLog = JSON.parse(localStorage.getItem("runtimeLog") ?? "{}");
    if (typeof lsRuntimeLog === "object") {
      setRuntimeLog(lsRuntimeLog);
    }
  }, []);

  useEffect(() => {
    const getData = async () => {
      if (teams.length === 0) return;

      const res = await fetch(
        "https://cyberpatriot-scoreboard.xcvr48.workers.dev/info?teams=" + teams.map((t) => t.id).join(","),
      );

      if (!res.ok) return;

      const data = await res.json<TeamInfoResponse>();

      if (!data) return;

      Object.entries(data).forEach(([teamId, teamData]) => {
        if (!teamData) return;

        const time = new Date(teamData.updated);

        setRuntimeLog((rtl) => {
          const teamRtl = { ...rtl[teamId] };

          teamData.images.forEach((image) => {
            if (teamRtl[image.name]?.runtime !== image.runtime) {
              teamRtl[image.name] = {
                runtime: image.runtime,
                since: time,
              };
            }
          });

          return { ...rtl, [teamId]: teamRtl };
        });
      });

      setTeamsData(data);
    };

    getData();
    const interval = setInterval(getData, 10 * 1000);

    return () => clearInterval(interval);
  }, [teams]);

  useEffect(() => {
    localStorage.setItem("runtimeLog", JSON.stringify(runtimeLog));
  }, [runtimeLog]);

  const [sorted, setSorted] = useState<[Team, TeamInfoResponse[string]][]>([]);

  useEffect(() => {
    const tuples = Object.entries(teamsData).map(([id, data]) => {
      const team = teams.find((t) => t.id === id);
      return [team, data] as [Team, TeamInfoResponse[string]];
    });

    const withScores = tuples.map((t) => [t, getTotalScore(t[1]) ?? -1] as const);

    withScores.sort(([, s1], [, s2]) => s2 - s1);

    setSorted(withScores.map(([t]) => t));
  }, [teams, teamsData]);

  return (
    <DashboardContext.Provider value={{ runtimeLog }}>
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
    </DashboardContext.Provider>
  );
};

export default Dashboard;
