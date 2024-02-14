export interface ButtonColor {
  idle: string;
  hover: string;
  active: string;
}

export const buttonBlue: ButtonColor = {
  idle: "bg-blue-600",
  hover: "bg-blue-700",
  active: "bg-blue-800",
};

export const buttonRed: ButtonColor = {
  idle: "bg-red-600",
  hover: "bg-red-700",
  active: "bg-red-800",
};

export const buttonGreen: ButtonColor = {
  idle: "bg-green-600",
  hover: "bg-green-700",
  active: "bg-green-800",
};

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
