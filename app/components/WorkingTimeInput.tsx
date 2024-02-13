import moment from "moment";

type WorkingTimeInputProps = {
  name: string;
  value: string;
  onChangeTime: (time: string) => void;
  label: string;
};

export function WorkingTimeInput({
  name,
  value,
  onChangeTime,
  label,
}: WorkingTimeInputProps) {
  function addMinutesToTime(minutes: number, time: string) {
    return moment(time, "HH:mm").add(minutes, "minutes").format("HH:mm");
  }

  return (
    <div className="flex justify-start items-center">
      <label className="inline-block w-24" htmlFor={name}>
        {label}
      </label>
      <span
        className="material-symbols-outlined cursor-pointer select-none"
        onClick={() => {
          onChangeTime(addMinutesToTime(-15, value));
        }}
      >
        Remove
      </span>
      <input
        className="mx-4"
        id={name}
        name={name}
        type="time"
        value={value}
        onChange={(e) => {
          onChangeTime(e.target.value);
        }}
      />
      <span
        className="material-symbols-outlined cursor-pointer select-none"
        onClick={() => {
          onChangeTime(addMinutesToTime(15, value));
        }}
      >
        Add
      </span>
    </div>
  );
}
