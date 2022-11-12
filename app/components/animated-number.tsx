import { animate, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useEffectOnce } from "usehooks-ts";
import { getOrdinal } from "~/processing";
import usePrevious from "~/utils/use-previous";

interface AnimatedNumberProps {
  number: number;
  color?: boolean;
  ordinal?: boolean;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ number, color = true, ordinal = false }) => {
  const previousScore = usePrevious(number);
  const nodeRef = useRef<HTMLDivElement>(null);

  const [variant, setVariant] = useState("default");

  const format = (n: number) => ~~n.toString() + (ordinal ? getOrdinal(~~n) : "");

  useEffectOnce(() => {
    if (nodeRef.current) {
      nodeRef.current.textContent = format(number);
    }
  });

  useEffect(() => {
    const node = nodeRef.current;
    if (!(node && typeof previousScore === "number")) return;

    const controls = animate(previousScore, number, {
      ease: [0.16, 1, 0.3, 1],
      duration: Math.min(Math.abs(number - previousScore) * 0.15, 2),
      onUpdate(value) {
        node.textContent = format(value);
      },
    });

    let timeout: NodeJS.Timeout;

    if (!color) setVariant("default");
    else {
      if (previousScore > number) setVariant("decrease");
      else if (previousScore < number) setVariant("increase");

      timeout = setTimeout(() => setVariant("default"), 5000);
    }

    return () => {
      controls.stop();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number]);

  return (
    <motion.span
      ref={nodeRef}
      transition={{
        type: "tween",
        duration: 0.5,
        ease: [0.85, 0, 0.15, 1],
      }}
      variants={{
        default: {},
        increase: {
          color: "#22C55E",
        },
        decrease: {
          color: "#EF4444",
        },
      }}
      initial="default"
      animate={variant}
    ></motion.span>
  );
};

export default AnimatedNumber;
