import { useEffect, useState } from "react";

interface AlternateProps {
  className?: string;
  on?: string;
  off?: string;
  delay?: number;
  active?: boolean;
}

const Alternate: React.FC<AlternateProps> = (props) => {
  const [state, setState] = useState(false);
  useEffect(() => {
    if (props.active) {
      const interval = setInterval(() => setState((s) => !s), props.delay);
      return () => clearInterval(interval);
    } else {
      setState(false);
    }
  }, [props.active, props.delay]);

  return (
    <div className={(props.className ?? "") + " " + (state ? props.on ?? "" : props.off ?? "")}>{props.children}</div>
  );
};

export default Alternate;
