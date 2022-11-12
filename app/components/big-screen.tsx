import type { Transition } from "framer-motion";
import { motion, useAnimationControls } from "framer-motion";
import { Fragment, useCallback, useEffect, useState } from "react";
import TextTransition from "react-text-transition";
import type { Team, TeamInfoResponse } from "~/processing";
import { formatPercentile } from "~/processing";
import AnimatedNumber from "./animated-number";

export interface BigScrenProps {
  teams: Team[];
  teamsData: TeamInfoResponse;
}

abstract class Slide {}

class TeamSlide extends Slide {
  constructor(public team: Team, public data: TeamInfoResponse[string]) {
    super();
  }
}

class OverviewSlide extends Slide {}

const BigScreen: React.FC<BigScrenProps> = ({ teams, teamsData }) => {
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    const teamSlides = teams
      .map((team) => [team, parseInt(team.id.replace("-", ""))] as const)
      .sort(([, a], [, b]) => a - b)
      .map(([team]) => new TeamSlide(team, teamsData[team.id]));

    setSlides([new OverviewSlide(), ...teamSlides]);
  }, [teams, teamsData]);

  const controls = useAnimationControls();
  const [slideIndex, setSlideIndex] = useState(0);
  const [slide, setSlide] = useState(slides[slideIndex]);
  const [previousSlide, setPreviousSlide] = useState(slides[slideIndex]);

  const nextSlide = useCallback(() => {
    setSlideIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const animate = useCallback(
    () =>
      controls.start(
        { width: ["0%", "100%", "100%", "100%"], opacity: [1, 1, 1, 0] },
        {
          duration: 5,
          ease: "linear",
          times: [3.5 / 20, 19.25 / 20, 19.75 / 20, 20 / 20],
          easings: ["linear", "linear", "linear", [0.22, 1, 0.36, 1]],
        },
      ),
    [controls],
  );

  useEffect(() => {
    animate();
    setSlideIndex((i) => (i % slides.length === 0 ? 0 : i));

    return () => {
      controls.stop();
    };
  }, [animate, controls, slides.length]);

  useEffect(() => {
    setSlide(slides[slideIndex]);
    setPreviousSlide(slides[(slideIndex - 1 + slides.length) % slides.length]);
  }, [slideIndex, slides]);

  const getUsuableTeamSlide = useCallback(
    () => (slide instanceof TeamSlide ? slide : previousSlide instanceof TeamSlide ? previousSlide : undefined),
    [previousSlide, slide],
  );

  const onAnimationEnd = useCallback(() => {
    nextSlide();
    animate();
  }, [animate, nextSlide]);

  const transiton: Transition = { duration: 1, ease: [0.45, 0, 0.55, 1] };

  return (
    <motion.div
      initial={slide instanceof TeamSlide ? "team" : "default"}
      animate={slide instanceof TeamSlide ? "team" : "default"}
      className="shadow-md rounded-lg bg-white border-1 border-gray-200 mb-2 overflow-hidden flex-grow ml-4 overflow-hidden relative"
    >
      <div className="border-b flex justify-between">
        <div className="w-7/10 px-8 py-6 flex-grow-0">
          <motion.div
            variants={{ default: { height: 0 }, team: { height: "2.75rem" } }}
            transition={{ ...transiton, duration: 0.75 }}
            className="relative h-11 overflow-hidden"
          >
            <div className="absolute left-0 top-0 h-11 font-medium text-2xl bg-coolGray-800 text-white w-fit px-2.5 py-1.5 rounded-lg">
              <TextTransition inline>{getUsuableTeamSlide()?.team.id ?? "😭"}</TextTransition>
            </div>
          </motion.div>
          <motion.div
            variants={{ default: { height: "4.5rem" }, team: { height: "9rem" } }}
            transition={{ ...transiton, duration: 0.5 }}
            className="font-bold text-7xl text-coolGray-900 mt-2 flex items-center"
            style={{ overflowWrap: "anywhere" }}
          >
            <TextTransition className="bs-team-name">
              {slide instanceof TeamSlide ? slide.team.alias ?? `Team ${slide.team.id}` : "Overview"}
            </TextTransition>
          </motion.div>
        </div>
        <motion.div
          variants={{
            default: { width: 0, borderLeftWidth: 0 },
            team: { width: "27.5rem", borderLeftWidth: 1 },
          }}
          transition={transiton}
          className="flex-shrink-0 relative overflow-hidden border-l"
        >
          <div className="absolute inset-y-0 right-0 w-110 flex items-center px-8 py-6 justify-around">
            {(() => {
              const teamSlide = getUsuableTeamSlide();

              const toDisplay = {
                National: teamSlide?.data?.ranking.national,
                State: teamSlide?.data?.ranking.state,
              } as const;

              return (
                <>
                  {Object.entries(toDisplay).map(([name, ranking], i) => (
                    <Fragment key={name}>
                      <div>
                        <div className="font-bold text-xl">
                          {name}{" "}
                          {name === "State" ? (
                            <span className="bg-coolGray-800 text-white py-0.3 px-1.2 rounded-md text-lg font-semibold">
                              <TextTransition inline>{teamSlide?.data?.location ?? "Unknown"}</TextTransition>
                            </span>
                          ) : undefined}
                        </div>
                        <div className="font-m45 text-3xl font-light">
                          <span className="text-5xl font-normal">
                            <AnimatedNumber number={ranking?.place ?? 0} color={false} />
                          </span>
                          /<AnimatedNumber number={ranking?.total ?? 0} color={false} />
                        </div>
                        <div className="text-gray-700">
                          <TextTransition inline>
                            {ranking ? formatPercentile(ranking) : "Rank Unavailable"}
                          </TextTransition>
                        </div>
                      </div>
                      {i % 2 === 0 ? <div className="h-1/3 mx-3 border-l border-gray-300"></div> : undefined}
                    </Fragment>
                  ))}
                </>
              );
            })()}
          </div>
        </motion.div>
      </div>
      <motion.div
        animate={controls}
        initial={{
          width: "0%",
          opacity: 1,
        }}
        onAnimationComplete={onAnimationEnd}
        className="absolute bottom-0 left-0 right-0 h-2"
        style={{
          background:
            "linear-gradient(90deg, #a21caf 0%, #b320a2 16%, #c22694 33%, #d02c87 50%, #dd327a 66%, #e9386c 83%, #f43f5e 100%)",
        }}
      ></motion.div>
    </motion.div>
  );
};

export default BigScreen;
