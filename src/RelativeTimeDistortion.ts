import { Temporal } from '@js-temporal/polyfill';
import TimeWindow from './TimeWindow';

export interface Duration {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}
export default abstract class RelativeTimeDistortion {
  protected timeWindow: TimeWindow;
  protected referenceDurationInMillis: number;
  constructor(timeWindow: TimeWindow, referenceDuration: Duration = { milliseconds: timeWindow.durationInMillis }) {
    this.timeWindow = timeWindow;
    this.referenceDurationInMillis = Temporal.Duration.from(referenceDuration).round({
      largestUnit: 'millisecond',
    }).milliseconds;
  }

  getOffset(start: number, lastSeen: number) {
    if (start >= this.timeWindow.windowStartInMillis && lastSeen < this.timeWindow.windowEndInMillis) {
      const millisInWindow =
        Math.min(start, this.timeWindow.windowEndInMillis) - Math.max(this.timeWindow.windowStartInMillis, lastSeen);
      return millisInWindow * this.warpFactor;
    }
    return 0;
  }

  abstract get warpFactor(): number;
}
