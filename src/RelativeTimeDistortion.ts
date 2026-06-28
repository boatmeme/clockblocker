import ClockTime, { ClockTimeDescriptor } from './ClockTime';
import TimeWindow from './TimeWindow';
import ElapsedWindow from './ElapsedWindow';
import AbsoluteWindow, { AbsoluteDescriptor } from './AbsoluteWindow';
import { DistortionWindow } from './DistortionWindow';
import { Duration, durationToMillis } from './duration';

export type { Duration };

// Where a distortion is anchored:
//   - a bare ClockTimeDescriptor  -> a wall-clock time-of-day (the original, default behavior);
//   - { elapsed }                 -> the run's own t=0, in real time since the Clock started;
//   - { absolute }                -> a fixed real-world instant (date+time or a Date).
export type DistortionAnchor = ClockTimeDescriptor | { elapsed: Duration } | { absolute: Date | AbsoluteDescriptor };

const isElapsedAnchor = (anchor: DistortionAnchor): anchor is { elapsed: Duration } => `elapsed` in anchor;
const isAbsoluteAnchor = (anchor: DistortionAnchor): anchor is { absolute: Date | AbsoluteDescriptor } =>
  `absolute` in anchor;

export default abstract class RelativeTimeDistortion {
  protected timeWindow: DistortionWindow;
  protected relativeDurationInMillis: number;
  protected referenceDurationInMillis: number;
  constructor(anchor: DistortionAnchor, relativeDuration: Duration, referenceDuration: Duration = relativeDuration) {
    this.relativeDurationInMillis = durationToMillis(relativeDuration);
    this.referenceDurationInMillis = durationToMillis(referenceDuration);
    if (isElapsedAnchor(anchor)) {
      const startOffset = durationToMillis(anchor.elapsed);
      this.timeWindow = new ElapsedWindow(startOffset, startOffset + this.referenceDurationInMillis);
    } else if (isAbsoluteAnchor(anchor)) {
      this.timeWindow = new AbsoluteWindow(anchor.absolute, this.referenceDurationInMillis);
    } else {
      const start = new ClockTime(anchor);
      this.timeWindow = new TimeWindow(start, start.add(referenceDuration));
    }
  }

  getTimeWindow() {
    return this.timeWindow.clone();
  }

  getElapsedTimeInMillis(offset = 0, length: number = this.referenceDurationInMillis) {
    return this.distortTime(length, offset);
  }

  protected abstract distortTime(numberOfMilliseconds: number, offset?: number): number;
}
