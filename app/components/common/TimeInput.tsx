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
    <div className="flex justify-start items-center">
      <label className="inline-block w-24" htmlFor={name}>
        {label}
      </label>
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
        className="mx-4 read-only:bg-gray-200 read-only:cursor-not-allowed read-only:border-gray-200 read-only:ml-10"
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
  );
}
