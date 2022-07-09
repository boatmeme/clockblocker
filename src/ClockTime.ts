import { Temporal, toTemporalInstant } from '@js-temporal/polyfill';

export interface ClockTimeDescriptor {
  hour?: number | undefined;
  minute?: number | undefined;
  second?: number | undefined;
  millisecond?: number | undefined;
}

export default class ClockTime {
  private _clockTime: Temporal.PlainTime;
  constructor(opts: ClockTimeDescriptor) {
    this._clockTime = Temporal.PlainTime.from(opts);
  }

  forTodayInMillis(ianaTimeZoneId = `UTC`) {
    const tz = Temporal.TimeZone.from(ianaTimeZoneId);
    const date = Temporal.Now.plainDateISO(tz);
    const wallClockTime = date.toPlainDateTime(this._clockTime);
    const localClockTime = wallClockTime.toZonedDateTime(ianaTimeZoneId);
    return localClockTime.toInstant().epochMilliseconds;
  }
}
