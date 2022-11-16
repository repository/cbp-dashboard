import { motion } from "framer-motion";
import { useMemo } from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import type { Team, TeamInfoResponse } from "~/utils/processing";
import { getTotalScore } from "~/utils/processing";
import TeamCard from "./team-card";
import TeamCardSkeleton from "./team-card-skeleton";

export interface LeaderboardProps {
  teams: Team[];
  teamsData: TeamInfoResponse;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ teams, teamsData }) => {
  const sorted = useMemo(
    () =>
      Object.entries(teamsData)
        .map(([id, data]) => [teams.find((t) => t.id === id)!, data] as const)
        .map((t) => [t, getTotalScore(t[1]) ?? -1] as const)
        .sort(([, score1], [, score2]) => score2 - score1)
        .map(([t]) => t),
    [teams, teamsData],
  );

  return sorted.length <= 0 ? (
    <>
      {Array.from({ length: teams.length }).map((_, i) => (
        <TeamCardSkeleton key={i} />
      ))}
    </>
  ) : (
    <Flipper flipKey={sorted.map(([team]) => team.id).join("")}>
      <motion.ul
        variants={{
          show: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate="show"
      >
        {sorted.map(([team, data]) => {
          return (
            <Flipped key={team.id} flipId={team.id}>
              <motion.li
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "tween",
                      ease: [0.16, 1, 0.3, 1],
                      duration: 0.5,
                    },
                  },
                }}
              >
                <TeamCard team={team} data={data} />
              </motion.li>
            </Flipped>
          );
        })}
      </motion.ul>
    </Flipper>
  );
};

export default Leaderboard;
