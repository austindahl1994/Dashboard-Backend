export const displayTime = () => {
  const currentTime = new Date();
  const options = {
    weekday: "long", // e.g., "Sunday"
    month: "long", // e.g., "September"
    day: "numeric", // e.g., "14"
    hour: "numeric", // e.g., "7"
    minute: "2-digit", // e.g., "34"
    second: "2-digit", // e.g., "08"
    hour12: true, // 12-hour format with AM/PM
    timeZone: "America/Chicago",
  };
  // @ts-ignore
  const formattedTime = currentTime.toLocaleString("en-US", options);
  console.log(formattedTime);
};
