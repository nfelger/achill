import { ButtonColor, buttonBlue } from "~/utils/colors";

interface Props {
  type?: "button" | "submit" | "reset";
  name?: string;
  value?: string;
  onClick?: () => void;
  color?: ButtonColor;
  children?: React.ReactNode;
  additionalClasses?: string;
  testId?: string;
}

export function TrackyButton({
  type = "submit",
  name,
  value,
  onClick,
  color = buttonBlue,
  children,
  additionalClasses,
  testId,
}: Props) {
  return (
    <button
      type={type}
      name={name}
      value={value}
      onClick={onClick}
      className={`ease rounded ${color.idle} text-s px-6 py-2.5 font-medium text-white shadow-md transition duration-150 ease-in-out hover:${color.hover} hover:shadow-lg focus:${color.hover} focus:shadow-lg focus:outline-none focus:ring-0 active:${color.active} active:shadow-lg ${additionalClasses}`}
      data-testid={testId}
    >
      {children}
    </button>
  );
}
