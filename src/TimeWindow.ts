import { Temporal } from '@js-temporal/polyfill';
import ClockTime, { ClockTimeComparison } from './ClockTime';
import { DistortionWindow, ResolvedWindow } from './DistortionWindow';

export enum TimeWindowComparison {
  EARLIER = -1,
  WITHIN = 0,
  LATER = 1,
}

// 'none' = one-shot: the window resolves to a single fixed occurrence. 'daily' (recurring)
// is a deferred opt-in and is not yet implemented; the field reserves the seam.
export type WindowRecurrence = 'none' | 'daily';

export default class TimeWindow implements DistortionWindow {
  private start: ClockTime;
  private end: ClockTime;
  private _timeZone: string;
  private _recurrence: WindowRecurrence;

  constructor(start: ClockTime, end: ClockTime, timeZone = `UTC`, recurrence: WindowRecurrence = `none`) {
    this.start = start;
    this.end = end;
    this._timeZone = timeZone;
    this._recurrence = recurrence;
  }

  private get wrapsMidnight() {
    return this.end.compare(this.start) === ClockTimeComparison.EARLIER;
  }

  get windowStartInMillis() {
    return this.start.forTodayInMillis(this._timeZone);
  }

  get windowEndInMillis() {
    if (this.wrapsMidnight) {
      return this.end.forTomorrowInMillis(this._timeZone);
    }
    return this.end.forTodayInMillis(this._timeZone);
  }

  get durationInMillis() {
    return this.windowEndInMillis - this.windowStartInMillis;
  }

  // Resolve to a single fixed [start, end) occurrence relative to a fixed anchor instant.
  // One-shot semantics: pick the occurrence that contains the anchor, otherwise the next
  // upcoming one. For a midnight-wrapping window the containing occurrence may have started
  // on the prior calendar day (e.g. at 00:30 you are inside last night's 23:00->03:00 span),
  // so candidates span the day before and after the anchor's date, not just the anchor's day.
  resolveAt(anchorMs: number): ResolvedWindow {
    const wraps = this.wrapsMidnight;
    const anchorDate = Temporal.Instant.fromEpochMilliseconds(anchorMs)
      .toZonedDateTimeISO(this._timeZone)
      .toPlainDate();

    const occurrences = [-1, 0, 1]
      .map((dayDelta) => {
        const startDate = anchorDate.add({ days: dayDelta });
        const endDate = wraps ? startDate.add({ days: 1 }) : startDate;
        return {
          startMs: this.start.forDateInMillis(startDate, this._timeZone),
          endMs: this.end.forDateInMillis(endDate, this._timeZone),
        };
      })
      .sort((a, b) => a.startMs - b.startMs);

    const current = occurrences.find((o) => o.startMs <= anchorMs && anchorMs < o.endMs);
    if (current) return current;
    // The day-after occurrence always starts strictly after the anchor, so a next exists.
    return occurrences.find((o) => o.startMs > anchorMs) ?? occurrences[occurrences.length - 1];
  }

  clone() {
    return new TimeWindow(this.start, this.end, this._timeZone, this._recurrence);
  }

  compareWithinWindow(timeInMillis: number) {
    if (timeInMillis < this.windowStartInMillis) return TimeWindowComparison.EARLIER;
    if (timeInMillis >= this.windowEndInMillis) return TimeWindowComparison.LATER;
    return TimeWindowComparison.WITHIN;
  }
}
