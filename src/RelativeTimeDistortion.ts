import ClockTime, { ClockTimeDescriptor } from './ClockTime';
import TimeWindow from './TimeWindow';
import ElapsedWindow from './ElapsedWindow';
import { DistortionWindow } from './DistortionWindow';
import { Duration, durationToMillis } from './duration';

export type { Duration };

// Where a distortion is anchored. A bare ClockTimeDescriptor means a wall-clock time-of-day
// (the original, default behavior); `{ elapsed }` anchors the window to the run's own t=0,
// measured in reference (real) time since the Clock was constructed.
export type DistortionAnchor = ClockTimeDescriptor | { elapsed: Duration };

const isElapsedAnchor = (anchor: DistortionAnchor): anchor is { elapsed: Duration } => `elapsed` in anchor;

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
