function padLeadingZeros(num: string, size: number) {
  var s = "0" + num;
  return s.substring(s.length - size);
}

export const convertFloatTimeToHHMM = (time: number) => {
  if (time == 0) return "0";
  // times are float input and we need to parse them to "H:MM", e.g 2.25 -> 2:15
  const minutes = time % 1; // extracts 0.25 from 2.25
  const displayMinutes = (+minutes * 60).toFixed(0);
  return `${Math.floor(time)}:${padLeadingZeros(displayMinutes, 2)}`;
};

const minuteStringToInt = (minutes: string): number => {
  if (minutes.length === 1) {
    return parseInt(minutes, 10) * 10;
  }

  return parseInt(minutes);
};

export const convertTimeStringToFloat = (time: string) => {
  if (time.includes(":")) {
    let [hours, minutes] = time.split(":");

    let minuteFractions = minuteStringToInt(minutes) / 60;

    return Number(hours) + minuteFractions;
  } else if (time.includes(",")) {
    return Number(time.replace(",", "."));
  } else {
    return Number(time);
  }
};
