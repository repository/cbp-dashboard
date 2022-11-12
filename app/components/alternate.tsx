import { useInterval, useToggle } from "usehooks-ts";

interface AlternateProps {
  className?: string;
  on?: string;
  off?: string;
  delay?: number;
  active?: boolean;
  children?: React.ReactNode;
}

const Alternate: React.FC<AlternateProps> = (props) => {
  const [state, toggle] = useToggle(false);
  useInterval(toggle, props.delay ?? null);

  return (
    <div className={(props.className ?? "") + " " + (props.active ? (state ? props.on ?? "" : props.off ?? "") : "")}>
      {props.children}
    </div>
  );
};

export default Alternate;
