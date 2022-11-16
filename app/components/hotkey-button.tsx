import { useHotkeys } from "react-hotkeys-hook";

const HotkeyButton: React.FC<
  React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    onClick?: () => void;
    hotkey?: string;
  }
> = ({ children, onFocus, hotkey, ...rest }) => {
  useHotkeys(hotkey ?? "", rest.onClick ?? (() => {}), [hotkey, rest.onClick]);

  return (
    <button
      {...rest}
      onFocus={(e) => {
        e.target.blur();
        if (onFocus) onFocus(e);
      }}
      tabIndex={-1}
    >
      {children}
    </button>
  );
};

export default HotkeyButton;
