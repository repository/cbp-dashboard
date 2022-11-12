import { differenceInMinutes } from "date-fns";
import { motion } from "framer-motion";
import React, { Fragment, useContext } from "react";
import type { Team, TeamInfoResponse } from "~/processing";
import { getTotalScore, OS } from "~/processing";
import { DashboardContext } from "~/routes/dashboard";
import Alternate from "./alternate";
import AnimatedNumber from "./animated-number";

interface TeamCardProps {
  team: Team;
  data: TeamInfoResponse[string];
}

const TeamCard: React.FC<TeamCardProps> = ({ team, data }) => {
  const getImage = (os: OS) => {
    return data?.images.find((i) => i.os === os) ?? null;
  };

  const dashboardContext = useContext(DashboardContext);

  const hasFlags = () => data?.images.some((i) => i.overtime || i.multiple) ?? false;

  return (
    <div className="shadow-md rounded-lg bg-white border-1 border-gray-200 mb-2 overflow-hidden">
      <div className="flex items-center border-b">
        <h3 className="text-size-xl font-semibold px-3 py-1 bg-coolGray-800 text-gray-100 rounded-tl-lg rounded-br-xl w-fit mb-auto flex-shrink-0">
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
        initial={{ height: hasFlags() ? "5.5rem" : "4.5rem" }}
        animate={{ height: hasFlags() ? "5.5rem" : "4.5rem" }}
        className="px-3 py-2 flex text-4xl font-m45 font-light justify-between items-center"
      >
        <div>{(data?.images.length ?? 0) > 0 ? <AnimatedNumber number={getTotalScore(data) ?? 0} /> : "--"}</div>
        <motion.div layout="position" className="flex space-x-1 items-start">
          {[OS.Windows, OS.Server, OS.Linux].map((key, index) => {
            const image = getImage(key);
            const runtime = image?.runtime ?? 0;

            const rtl = dashboardContext.runtimeLog[team.id]?.[key];

            const stopped =
              rtl && data?.updated && rtl.runtime === runtime && differenceInMinutes(data.updated, rtl.since) > 1;

            return (
              <Fragment key={key}>
                <div className="min-w-12 text-center flex flex-col">
                  <Alternate
                    className={"text-sm " + (stopped ? "bg-gray-400 text-white" : "")}
                    on={
                      runtime < 350
                        ? "bg-yellow-400 !text-gray-900"
                        : "text-white " + (runtime < 355 ? "bg-orange-500" : "bg-red-500")
                    }
                    delay={500}
                    active={runtime >= 345 && !stopped}
                  >
                    {typeof image?.runtime === "number"
                      ? ~~(image.runtime / 60) + ":" + (image.runtime % 60).toString().padStart(2, "0")
                      : "--:--"}
                  </Alternate>
                  <div style={{ lineHeight: 1 }}>
                    {typeof image?.score === "number" ? <AnimatedNumber number={image?.score} /> : "--"}
                  </div>
                  <div className="text-xs flex space-x-1 justify-center">
                    {image?.overtime && <div className="bg-red-500 text-white px-0.5">OVRT</div>}
                    {image?.multiple && <div className="bg-violet-500 text-white px-0.5">MULT</div>}
                  </div>
                </div>
                {index !== 2 && (
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
