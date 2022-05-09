export const formatHours = (value) => {
  const hoursString = value.toString();
  if (/^\d?\d[.]\d+$/.test(hoursString)) {
    const hours = hoursString.split(".")[0];
    const hourFraction = +`0.${hoursString.split(".")[1]}`;
    return `${hours}:${Math.ceil(hourFraction * 60)}`;
  } else if (/^\d?\d$/.test(hoursString)) {
    return `${hoursString.replace(/^0+/, "")}:00`;
  }
  return value.replace(/^0+/, "");
};
