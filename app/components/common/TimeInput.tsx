import moment from "moment";

type WorkingTimeInputProps = {
  name: string;
  time: string;
  onChangeTime: (time: string) => void;
  label: string;
  display?: boolean;
};

export function TimeInput({
  name,
  time,
  onChangeTime,
  label,
  display = false,
}: WorkingTimeInputProps) {
  function addMinutesToTime(minutes: number, time: string) {
    return moment(time, "HH:mm").add(minutes, "minutes").format("HH:mm");
  }

  return (
    <div className="flex justify-start items-center">
      <label className="inline-block w-24" htmlFor={name}>
        {label}
      </label>
      {!display && (
        <span
          className="material-symbols-outlined cursor-pointer select-none"
          onClick={() => {
            onChangeTime(addMinutesToTime(-15, time));
          }}
        >
          Remove
        </span>
      )}
      <input
        className="mx-4"
        id={name}
        name={name}
        type="time"
        value={time}
        readOnly={display}
        onChange={(e) => {
          console.log(e.target.value);
          onChangeTime(e.target.value);
        }}
      />
      {!display && (
        <span
          className="material-symbols-outlined cursor-pointer select-none"
          onClick={() => {
            onChangeTime(addMinutesToTime(15, time));
          }}
        >
          Add
        </span>
      )}
    </div>
  );
}
