import { useMemo } from "react";
import Alternate from "./alternate";

export interface ImageTimeProps {
  runtime?: number;
  stopped?: boolean;
  className?: string;
}

export const ImageTime: React.FC<ImageTimeProps> = ({ runtime, stopped = false, className }) => {
  const isSet = useMemo(() => typeof runtime === "number", [runtime]);

  return (
    <Alternate
      className={(className ?? "") + " " + (stopped ? "bg-gray-400 text-white" : "")}
      on={
        isSet
          ? runtime! < 350
            ? "bg-yellow-400 !text-gray-900"
            : "text-white " + (runtime! < 355 ? "bg-orange-500" : "bg-red-500")
          : ""
      }
      delay={500}
      active={isSet && runtime! >= 345 && !stopped}
    >
      {isSet ? ~~(runtime! / 60) + ":" + (runtime! % 60).toString().padStart(2, "0") : "--:--"}
    </Alternate>
  );
};
