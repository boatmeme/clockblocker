import { Temporal } from '@js-temporal/polyfill';

export interface Duration {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export const durationToMillis = (duration: Duration) =>
  Temporal.Duration.from(duration).round({ largestUnit: 'millisecond' }).milliseconds;
