import { createContext, useEffect, useState } from "react";
import superjson from "superjson";
import { useUpdateEffect } from "usehooks-ts";
import BigScreen from "~/components/big-screen";
import Leaderboard from "~/components/leaderboard";
import type { RuntimeLog, TeamInfoResponse } from "~/processing";
import { useLSRuntimeLog, useLSTeams } from "~/utils/local-storage";

interface DashboardContextValue {
  runtimeLog: RuntimeLog;
}

export const DashboardContext = createContext<DashboardContextValue>({
  runtimeLog: {},
});

const Dashboard: React.FC = () => {
  const [teams] = useLSTeams();
  const [runtimeLog, setRuntimeLog] = useLSRuntimeLog();
  const [teamsData, setTeamsData] = useState<TeamInfoResponse>({});

  useEffect(() => {
    const getData = async () => {
      if (teams.length === 0) return;

      const res = await fetch("https://cbp-data.ngo.sh/info?teams=" + teams.map((t) => t.id).join(","));

      if (!res.ok) return;

      const data = superjson.parse<TeamInfoResponse>(await res.text());

      if (!data) return;

      setTeamsData(data);
    };

    getData();

    const interval = setInterval(getData, 30 * 1000);
    return () => clearInterval(interval);
  }, [teams]);

  useUpdateEffect(() => {
    setRuntimeLog((rtl) => {
      Object.entries(teamsData).forEach(([teamId, teamData]) => {
        if (!teamData) return;

        const time = new Date(teamData.updated);

        if (!rtl[teamId]) {
          rtl[teamId] = {};
        }

        teamData.images.forEach((image) => {
          if (image.os !== null && rtl[teamId][image.os]?.runtime !== image.runtime) {
            rtl[teamId][image.os] = {
              runtime: image.runtime,
              since: time,
            };
          }
        });
      });

      return { ...rtl };
    });
  }, [teamsData, setRuntimeLog]);

  return (
    <DashboardContext.Provider value={{ runtimeLog }}>
      <div className="flex h-screen p-4">
        <div className="w-96 flex-shrink-0">
          <Leaderboard teams={teams} teamsData={teamsData} />
        </div>
        <BigScreen teams={teams} teamsData={teamsData} />
      </div>
    </DashboardContext.Provider>
  );
};

export default Dashboard;
