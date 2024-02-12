import { ButtonColor } from "~/utils/colors";

interface Props {
  testId?: string;
  onClick?: () => void;
  color: ButtonColor;
  children?: React.ReactNode;
  additionalClasses?: string;
  loading?: boolean;
}

export function TrackyButton({
  testId,
  onClick,
  color,
  children,
  additionalClasses,
  loading,
}: Props) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`ease rounded ${color.idle} text-s px-6 py-2.5 font-medium text-white shadow-md transition duration-150 ease-in-out hover:${color.hover} hover:shadow-lg focus:${color.hover} focus:shadow-lg focus:outline-none focus:ring-0 active:${color.active} active:shadow-lg ${additionalClasses}`}
    >
      {children}
    </button>
  );
}
