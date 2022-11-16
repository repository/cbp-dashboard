import { motion } from "framer-motion";
import React, { Fragment, useContext, useMemo } from "react";
import { useRecoilState } from "recoil";
import { DashboardContext } from "~/routes/dashboard";
import type { Team, TeamInfoResponse } from "~/utils/processing";
import { imageDisplayOrder } from "~/utils/processing";
import type { OS } from "~/utils/processing";
import { getTotalScore, isStopped } from "~/utils/processing";
import AnimatedNumber from "./animated-number";
import { bigScreenFocusedTeamState } from "./big-screen";
import { ImageTime } from "./image-time";

interface TeamCardProps {
  team: Team;
  data: TeamInfoResponse[string];
}

const TeamCard: React.FC<TeamCardProps> = ({ team, data }) => {
  const getImage = (os: OS) => {
    return data?.images.find((i) => i.os === os) ?? null;
  };

  const [, setFocusedTeam] = useRecoilState(bigScreenFocusedTeamState);

  const dashboardContext = useContext(DashboardContext);

  const hasFlags = useMemo(() => data?.images.some((i) => i.overtime || i.multiple) ?? false, [data?.images]);

  return (
    <div
      onClick={() => setFocusedTeam(team.id)}
      className="shadow-md rounded-lg bg-white border-1 border-gray-200 mb-2 overflow-hidden cursor-pointer"
    >
      <div className="flex items-center border-b">
        <h3
          className={
            "text-size-xl font-semibold px-3 py-1 bg-coolGray-800 text-gray-100 rounded-tl-lg rounded-br-xl w-fit mb-auto flex-shrink-0" +
            (dashboardContext.hideTeamNumbers ? " text-opacity-0" : "")
          }
        >
          {team.id}
        </h3>
        <h3
          className="text-size-lg font-medium pl-2 pr-3 py-1 text-center flex-grow"
          style={{ overflowWrap: "anywhere" }}
        >
          {team.alias ?? team.id}
        </h3>
      </div>
      <motion.div
        transition={{ ease: [0.65, 0, 0.35, 1], duration: 0.2 }}
        initial={false}
        animate={{ height: hasFlags ? "5.5rem" : "4.5rem" }}
        className="px-3 py-2 flex text-4xl font-m45 font-light justify-between items-center"
      >
        <div>{(data?.images.length ?? 0) > 0 ? <AnimatedNumber number={getTotalScore(data) ?? 0} /> : "--"}</div>
        <motion.div layout="position" className="flex space-x-1 items-start">
          {imageDisplayOrder.map((key, index) => {
            const image = getImage(key);

            return (
              <Fragment key={key}>
                <div className="min-w-12 text-center flex flex-col">
                  <ImageTime
                    className="text-sm"
                    runtime={image?.runtime}
                    stopped={isStopped(data, dashboardContext.runtimeLog[team.id], image)}
                  />
                  <div style={{ lineHeight: 1 }}>
                    {typeof image?.score === "number" ? <AnimatedNumber number={image?.score} /> : "--"}
                  </div>
                  <div className="text-xs flex space-x-1 justify-center">
                    {image?.overtime && <div className="bg-red-500 text-white px-0.5">OVRT</div>}
                    {image?.multiple && <div className="bg-violet-500 text-white px-0.5">MULT</div>}
                  </div>
                </div>
                {index !== imageDisplayOrder.length - 1 && (
                  <motion.div layout="position" className="text-5xl self-center">
                    /
                  </motion.div>
                )}
              </Fragment>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TeamCard;
