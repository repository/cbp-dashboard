import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { forwardRef } from "react";
import type { NameType, Payload, ValueType } from "recharts/src/component/DefaultTooltipContent";

export interface ScoreHistoryTooltipProps {
  active?: boolean;
  payload?: Payload<ValueType, NameType>[] | undefined;
  label?: any;
}

interface ScoreHistoryTooltipDataProps {
  entry: Payload<ValueType, NameType>;
}

const ScoreHistoryTooltipData = forwardRef<HTMLDivElement, ScoreHistoryTooltipDataProps>(({ entry }, ref) => {
  return (
    <motion.div
      layout
      ref={ref}
      key={entry.name}
      className="flex flex-col items-center w-16"
      style={{ color: entry.color }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-sm">{entry.name}</div>
      <div className="font-m45 text-3xl">{entry.value}</div>
    </motion.div>
  );
});
ScoreHistoryTooltipData.displayName = "ScoreHistoryTooltipData";

const ScoreHistoryTooltip: React.FC<ScoreHistoryTooltipProps> = ({ active, payload, label }) => {
  const formattedLabel = typeof label === "number" ? format(label, "MM/dd H:mm") : String(label);

  return active && payload && payload.length ? (
    <motion.div layout className="shadow-md rounded-lg bg-white border-1 border-gray-200 overflow-hidden px-3 py-2">
      <motion.div
        layout="position"
        transition={{ type: "spring", damping: 50, stiffness: 200, mass: 0.1 }}
        className="flex font-m45 font-light justify-around"
      >
        <motion.div layout="position" transition={{ type: "spring", damping: 50, stiffness: 200, mass: 0.1 }}>
          {formattedLabel}
        </motion.div>
      </motion.div>
      <div className="flex space-x-1 justify-around">
        <AnimatePresence mode="popLayout">
          {payload.map((entry) => (
            <ScoreHistoryTooltipData key={entry.name} entry={entry} />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  ) : null;
};

export default ScoreHistoryTooltip;
