import moment from "moment";

type WorkingTimeInputProps = {
  name: string;
  time: string;
  onChange: (time: string) => void;
  label: string;
  readOnly?: boolean;
};

export function TimeInput({
  name,
  time,
  onChange,
  label,
  readOnly = false,
}: WorkingTimeInputProps) {
  function addMinutesToTime(minutes: number, time: string) {
    return moment(time, "HH:mm").add(minutes, "minutes").format("HH:mm");
  }

  return (
    <div>
      <label className="inline-block mb-1 ml-7" htmlFor={name}>
        {label}
      </label>
      <div className="flex items-center">
        {!readOnly && (
          <span
            className="material-symbols-outlined cursor-pointer select-none"
            onClick={() => {
              onChange(addMinutesToTime(-15, time));
            }}
          >
            Remove
          </span>
        )}
        <input
          className="mx-1 read-only:bg-gray-200 read-only:cursor-not-allowed read-only:border-gray-200 read-only:mx-7"
          id={name}
          name={name}
          type="time"
          value={time}
          step={900}
          readOnly={readOnly}
          onChange={(e) => {
            console.log(e.target.value);
            onChange(e.target.value);
          }}
        />
        {!readOnly && (
          <span
            className="material-symbols-outlined cursor-pointer select-none"
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
