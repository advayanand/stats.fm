import { TimeRange } from "./types";

export const timeRangePeriodStr: Map<TimeRange, string> = new Map([
    [TimeRange.YEAR, "12month"],
    [TimeRange.HALF_YEAR, "6month"],
    [TimeRange.QUARTER, "3month"],
    [TimeRange.ONE_MONTH, "1month"],
    [TimeRange.ONE_WEEK, "7days"],
    [TimeRange.ALL_TIME, "overall"]
]);

