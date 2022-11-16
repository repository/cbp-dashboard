import { format } from "date-fns";
import type { Transition } from "framer-motion";
import { AnimatePresence, motion, useAnimationFrame } from "framer-motion";
import { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiMinus, FiPause, FiPlay, FiPlus } from "react-icons/fi";
import TextTransition from "react-text-transition";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { atom, useRecoilState } from "recoil";
import Timeout from "smart-timeout";
import { DashboardContext } from "~/routes/dashboard";
import { useLSBigScreenSlideTime } from "~/utils/local-storage";
import type { Team, TeamInfoResponse } from "~/utils/processing";
import { isStopped } from "~/utils/processing";
import { imageDisplayOrder } from "~/utils/processing";
import { formatPercentile, OS, prepareHistory } from "~/utils/processing";
import AnimatedNumber from "./animated-number";
import { BetterTooltip } from "./better-tooltip";
import ClientOnly from "./client-only";
import HotkeyButton from "./hotkey-button";
import { ImageTime } from "./image-time";
import ScoreHistoryTooltip from "./score-history-tooltip";

export const bigScreenFocusedTeamState = atom<string | null>({ key: "bigScreenFocusedTeamState", default: null });

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

  const [slideIndex, setSlideIndex] = useState(0);
  const slide = useMemo(() => slides[slideIndex], [slides, slideIndex]);
  const previousSlide = useMemo(() => slides[(slideIndex - 1 + slides.length) % slides.length], [slides, slideIndex]);

  const timer = "big-screen-timer";
  const [timerLength, setTimerLength] = useLSBigScreenSlideTime();
  const [paused, setPaused] = useState(false);

  const pauseIfPaused = useCallback(() => paused && Timeout.pause(timer), [paused]);

  const resetProgress = () => {
    if (progressRef.current) {
      progressRef.current.style.width = "0%";
      progressRef.current.style.opacity = "1";
    }
  };

  const afterChange = useCallback(() => {
    Timeout.restart(timer, true);
    resetProgress();
    pauseIfPaused();
  }, [pauseIfPaused]);

  const nextSlide = useCallback(() => {
    setSlideIndex((i) => (i + 1) % slides.length);
    afterChange();
  }, [afterChange, slides.length]);

  const prevSlide = useCallback(() => {
    setSlideIndex((i) => (i - 1 + slides.length) % slides.length);
    afterChange();
  }, [afterChange, slides.length]);

  useEffect(() => {
    setSlideIndex((i) => (i % slides.length === 0 ? 0 : i));
    Timeout.instantiate(timer, nextSlide, timerLength);
    resetProgress();
    pauseIfPaused();

    return () => {
      Timeout.clear(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, timerLength]);

  const displayedTeamSlide = useMemo(
    () => (slide instanceof TeamSlide ? slide : previousSlide instanceof TeamSlide ? previousSlide : undefined),
    [previousSlide, slide],
  );

  const transiton: Transition = { duration: 1, ease: [0.45, 0, 0.55, 1] };

  const dashboardContext = useContext(DashboardContext);

  useEffect(() => {
    if (paused) {
      Timeout.pause(timer);
    } else {
      Timeout.resume(timer);
    }
  }, [paused]);

  const progressRef = useRef<HTMLDivElement>(null);

  const easeInOutCubic = (x: number) => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  useAnimationFrame(() => {
    if (!progressRef.current || Timeout.paused(timer)) return;
    const style = progressRef.current.style;

    const progress = (timerLength - Timeout.remaining(timer)) / timerLength;

    const start = Math.min(0.1, 750 / timerLength);
    const finish = Math.max(0.95, (timerLength - 500) / timerLength);

    if (progress < start) {
      resetProgress();
    } else if (progress > finish) {
      const localProgress = (progress - finish) / (1 - finish);
      style.width = "100%";
      style.opacity = `${1 - easeInOutCubic(localProgress)}`;
    } else {
      const localProgress = (progress - start) / (finish - start);
      style.width = `${localProgress * 100}%`;
      style.opacity = "1";
    }
  });

  const [focusedTeam] = useRecoilState(bigScreenFocusedTeamState);
  useEffect(() => {
    if (focusedTeam) {
      const index = slides.findIndex((slide) => slide instanceof TeamSlide && slide.team.id === focusedTeam);
      if (index !== -1) {
        setSlideIndex(index);
        afterChange();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedTeam]);

  const displayedRanking = useMemo(() => {
    return Object.entries({
      National: displayedTeamSlide?.data?.ranking.national,
      State: displayedTeamSlide?.data?.ranking.state,
    }).map(([name, ranking], i) => (
      <Fragment key={name}>
        <div>
          <div className="font-bold text-xl">
            {name}{" "}
            {name === "State" ? (
              <span className="bg-coolGray-800 text-white py-0.3 px-1.2 rounded-md text-lg font-semibold">
                <TextTransition inline>
                  <span key={displayedTeamSlide?.team.id}>{displayedTeamSlide?.data?.location ?? "Unknown"}</span>
                </TextTransition>
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
              <span key={displayedTeamSlide?.team.id}>{ranking ? formatPercentile(ranking) : "Rank Unavailable"}</span>
            </TextTransition>
          </div>
        </div>
        {i % 2 === 0 ? <div className="h-1/3 mx-3 border-l border-gray-300"></div> : undefined}
      </Fragment>
    ));
  }, [displayedTeamSlide]);

  const displayedHistory = useMemo(() => {
    const history = prepareHistory(displayedTeamSlide?.data?.history ?? []);
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            interval={5}
            minTickGap={10}
            domain={["dataMin", "dataMax"]}
            tickFormatter={(time: unknown) => (typeof time === "number" ? format(time, "H:mm") : String(time))}
            style={{ fontFamily: "Mono45 Headline", fontWeight: 300 }}
          />
          <YAxis
            ticks={[0, 25, 50, 75, 100]}
            domain={[(min: unknown) => (isFinite(Number(min)) ? min : 0), 100]}
            style={{ fontFamily: "Mono45 Headline", fontWeight: 300 }}
          />
          <BetterTooltip content={(props) => <ScoreHistoryTooltip {...props} />} />

          <Legend
            margin={{
              top: 10,
            }}
          />
          <Line
            type="monotone"
            strokeWidth={2}
            dataKey={OS.Windows}
            stroke="#2563EB"
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line type="monotone" strokeWidth={2} dataKey={OS.Server} stroke="#9333EA" dot={false} activeDot={{ r: 5 }} />
          <Line type="monotone" strokeWidth={2} dataKey={OS.Linux} stroke="#F97316" dot={false} activeDot={{ r: 5 }} />
          <foreignObject x="65" height="91%" width="93%">
            <div className="flex items-center justify-around w-full h-full">
              <AnimatePresence>
                {history.length <= 0 ? (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "12.5rem" }}
                    exit={{ width: 0 }}
                    transition={{ damping: 30, stiffness: 200 }}
                    className="relative h-9 overflow-hidden"
                  >
                    <div className="w-50 absolute inset-y-0 left-0 py-1 px-2 rounded-md text-gray-500 bg-white text-xl">
                      History Unavailable
                    </div>
                  </motion.div>
                ) : undefined}
              </AnimatePresence>
            </div>
          </foreignObject>
        </LineChart>
      </ResponsiveContainer>
    );
  }, [displayedTeamSlide?.data?.history]);

  return (
    <motion.div
      initial={false}
      animate={slide instanceof TeamSlide ? "team" : "default"}
      className="shadow-md rounded-lg bg-white border-1 border-gray-200 mb-2 overflow-hidden flex-grow ml-2 overflow-hidden flex flex-col"
    >
      <div className="border-b flex justify-between">
        <div className="w-7/10 px-8 py-6 flex-grow-0">
          <motion.div
            variants={{ default: { height: 0 }, team: { height: "2.75rem" } }}
            transition={{ ...transiton, duration: 0.75 }}
            className="relative h-11 overflow-hidden"
          >
            <div
              className={
                "absolute left-0 top-0 h-11 font-medium text-2xl bg-coolGray-800 text-white w-fit px-2.5 py-1.5 rounded-lg" +
                (dashboardContext.hideTeamNumbers ? " text-opacity-0" : "")
              }
            >
              <TextTransition inline>{displayedTeamSlide?.team.id ?? "😭"}</TextTransition>
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
            {displayedRanking}
          </div>
        </motion.div>
      </div>
      <div className="flex-grow p-6 overflow-hidden">
        <div className="flex h-full items-center space-x-4">
          <div className="w-7/10 h-162.5">
            <ClientOnly>{displayedHistory}</ClientOnly>
          </div>
          <div className="flex flex-col p-2 flex-grow-1 space-y-4">
            {imageDisplayOrder.map((key) => {
              const image = displayedTeamSlide?.data?.images?.find((image) => image.os === key) ?? null;

              return (
                <div className="flex flex-col items-start text-coolGray-900" key={key}>
                  <div className="flex text-4xl font-semibold w-full pb-1">
                    {key}
                    <ImageTime
                      className="font-m45 font-light min-w-24 ml-auto flex items-center justify-center text-3xl rounded"
                      runtime={image?.runtime}
                      stopped={
                        displayedTeamSlide &&
                        isStopped(
                          displayedTeamSlide.data,
                          dashboardContext.runtimeLog[displayedTeamSlide.team.id],
                          image,
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col w-full border px-4 py-2 rounded-lg">
                    <div className="flex w-full">
                      <div className="font-m45 font-light text-7xl px-2 min-w-24">
                        {typeof image?.score === "number" ? (
                          <AnimatedNumber key={displayedTeamSlide?.team.id + key} number={image?.score} />
                        ) : (
                          "--"
                        )}
                      </div>
                      <div className="flex flex-col justify-center font-m45 font-light space-y-1 text-xl ml-1">
                        <AnimatePresence mode="popLayout">
                          {image?.overtime && (
                            <motion.div
                              key="overtime"
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="bg-red-500 text-white px-1"
                            >
                              OVERTIME
                            </motion.div>
                          )}
                          {image?.multiple && (
                            <motion.div
                              key="multiple"
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="bg-violet-500 text-white px-1"
                            >
                              MULTIPLE
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex flex-col justify-center ml-auto">
                        {image ? (
                          <>
                            <div className="flex items-center justify-center">
                              <span className="font-m45 font-light text-2xl mr-1.5 justify-around">
                                {image.issues.found}/{image.issues.found + image.issues.remaining}
                              </span>{" "}
                              Issues Found
                            </div>
                            <div className="flex items-center justify-center">
                              <span className="font-m45 font-light text-2xl mr-1.5 justify-around">
                                {image.penalties}
                              </span>{" "}
                              Penalties Applied
                            </div>
                          </>
                        ) : (
                          <div className="text-2xl">Data Unavailable</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="w-full mt-auto">
        <div className="border-y flex text-gray-400 -mb-1px" style={{ lineHeight: 1 }}>
          <HotkeyButton
            hotkey="space"
            onClick={() => setPaused((p) => !p)}
            className="p-1.5 border-r hover:bg-gray-100"
          >
            {paused ? <FiPlay /> : <FiPause />}
          </HotkeyButton>
          <div className="flex border-r">
            <HotkeyButton
              hotkey="arrowup"
              onClick={() => setTimerLength((t) => t + 1000)}
              className="p-1.5 hover:bg-gray-100"
            >
              <FiPlus />
            </HotkeyButton>
            <div className="py-1.5 px-1">{timerLength / 1000}</div>
            <HotkeyButton
              hotkey="arrowdown"
              onClick={() => setTimerLength((t) => Math.max(t - 1000, 1000))}
              className={"p-1.5 hover:bg-gray-100 " + (timerLength < 2000 ? "cursor-not-allowed" : "")}
            >
              <FiMinus />
            </HotkeyButton>
          </div>
          <div className="ml-auto flex">
            <HotkeyButton hotkey="arrowleft" onClick={prevSlide} className="px-3 py-1.5 border-l hover:bg-gray-100">
              <FiArrowLeft />
            </HotkeyButton>
            <HotkeyButton hotkey="arrowright" onClick={nextSlide} className="px-3 py-1.5 border-l hover:bg-gray-100">
              <FiArrowRight />
            </HotkeyButton>
          </div>
        </div>
        <div className="relative h-2 overflow-hidden" ref={progressRef}>
          <motion.div
            className="absolute inset-y-0 left-0 w-371.5 h-2"
            style={{
              background:
                "linear-gradient(30deg, #8b5cf6 0%, #bc47db 16%, #db30bc 33%, #ed1c9c 50%, #f61c7d 66%, #f62e5f 83%, #ef4444 100%)",
            }}
          ></motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default BigScreen;
