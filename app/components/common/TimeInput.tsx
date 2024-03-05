import moment from "moment";

type WorkingTimeInputProps = {
  name: string;
  time: string;
  onChange: (time: string) => void;
  label: string;
  readOnly?: boolean;
  hasError?: boolean;
};

export function TimeInput({
  name,
  time,
  onChange,
  label,
  readOnly = false,
  hasError = false,
}: WorkingTimeInputProps) {
  function addMinutesToTime(minutes: number, time: string) {
    return moment(time, "HH:mm").add(minutes, "minutes").format("HH:mm");
  }

  return (
    <div className="w-44">
      <label className="inline-block mb-1 ml-9" htmlFor={name}>
        {label}
      </label>
      <div className="flex items-center justify-around">
        {!readOnly && (
          <span
            className="material-symbols-outlined cursor-pointer select-none border rounded-full border-gray-800"
            onClick={() => {
              onChange(addMinutesToTime(-15, time));
            }}
          >
            Remove
          </span>
        )}
        <input
          className={`read-only:bg-gray-200 read-only:cursor-not-allowed read-only:border-gray-200${hasError ? " error" : ""}`}
          id={name}
          name={name}
          type="time"
          value={time}
          step={900}
          readOnly={readOnly}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
        {!readOnly && (
          <span
            className="material-symbols-outlined cursor-pointer select-none border rounded-full border-gray-800"
            onClick={() => {
              onChange(addMinutesToTime(15, time));
            }}
          >
            Add
          </span>
        )}
      </div>
    </div>
  );
}
