import { Temporal } from '@js-temporal/polyfill';
import { DistortionWindow, ResolvedWindow } from './DistortionWindow';

// A fully-specified wall-clock instant: a calendar date plus an optional time-of-day. Resolved
// against the Clock's timezone. (A JS Date is an instant already and needs no zone.)
export interface AbsoluteDescriptor {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
}

// A window pinned to a specific real-world instant, independent of when the Clock was started --
// `resolveAt` ignores the run anchor entirely. True multi-day spans fall out for free: the bounds
// are plain instant arithmetic, with none of the ~24h overnight-wrap limit a TimeWindow has.
export default class AbsoluteWindow implements DistortionWindow {
  constructor(private start: Date | AbsoluteDescriptor, private durationMs: number) {}

  resolveAt(_anchorMs: number, timeZone = `UTC`): ResolvedWindow {
    const startMs =
      this.start instanceof Date
        ? this.start.getTime()
        : Temporal.PlainDateTime.from(this.start).toZonedDateTime(timeZone).toInstant().epochMilliseconds;
    return { startMs, endMs: startMs + this.durationMs };
  }

  clone() {
    return new AbsoluteWindow(this.start, this.durationMs);
  }
}
