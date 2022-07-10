import { Temporal } from '@js-temporal/polyfill';

export interface ClockTimeDescriptor {
  hour?: number | undefined;
  minute?: number | undefined;
  second?: number | undefined;
  millisecond?: number | undefined;
}

export enum ClockTimeComparison {
  EARLIER = -1,
  EQUIVALENT = 0,
  LATER = 1,
}

export default class ClockTime {
  private _clockTime: Temporal.PlainTime;
  constructor(opts: ClockTimeDescriptor) {
    this._clockTime = Temporal.PlainTime.from(opts);
  }

  private forPlainDateInMillis(date: Temporal.PlainDate, ianaTimeZoneId = `UTC`) {
    const wallClockTime = date.toPlainDateTime(this._clockTime);
    const localClockTime = wallClockTime.toZonedDateTime(ianaTimeZoneId);
    return localClockTime.toInstant().epochMilliseconds;
  }

  forTodayInMillis(ianaTimeZoneId = `UTC`) {
    const tz = Temporal.TimeZone.from(ianaTimeZoneId);
    const date = Temporal.Now.plainDateISO(tz);
    return this.forPlainDateInMillis(date, ianaTimeZoneId);
  }

  forTomorrowInMillis(ianaTimeZoneId = `UTC`) {
    const tz = Temporal.TimeZone.from(ianaTimeZoneId);
    const date = Temporal.Now.plainDateISO(tz).add({ days: 1 });
    return this.forPlainDateInMillis(date, ianaTimeZoneId);
  }

  compare(b: ClockTime): ClockTimeComparison {
    return Temporal.PlainTime.compare(this._clockTime, b._clockTime);
  }
}
