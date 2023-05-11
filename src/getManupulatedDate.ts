import * as dayjs from "dayjs";

export type Unit = Extract<dayjs.UnitType, "year" | "month">;
const REGEXP = /^(?<operation>\-|\+)?(?<duration>\d+)$/;

const getManupulatedDate = (
  date: dayjs.Dayjs,
  unit: Unit,
  str?: string
): dayjs.Dayjs => {
  if (typeof str !== "string") {
    return date;
  }

  str = str.trim();
  if (!str) {
    return date;
  }

  const match = str.match(REGEXP);
  if (match === null) {
    return date;
  }

  const duration = parseInt(match[0]);

  if (match.groups?.operation) {
    return date.add(duration, unit);
  } else {
    return date.set(unit, unit === "month" ? duration - 1 : duration);
  }
};

export default getManupulatedDate;
