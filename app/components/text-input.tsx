export interface TextInputProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
  maxLength?: number;
}

const TextInput: React.FC<TextInputProps> = (props) => {
  return (
    <div className={props.className}>
      <label className="block text-sm font-medium mb-0.5">{props.label}</label>
      <input
        type="text"
        className={"rounded-md w-full border-1 px-2.5 py-1.5 " + (props.error ? " border-red-600" : "border-gray-300")}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange?.(e.target.value)}
        maxLength={props.maxLength}
      />
      {props.error && <div className="text-sm text-red-600">{props.error}</div>}
    </div>
  );
};

export default TextInput;
