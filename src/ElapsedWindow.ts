import { DistortionWindow, ResolvedWindow } from './DistortionWindow';

// A window pinned to the run's own t=0 rather than to a wall-clock time-of-day. The anchor
// passed to `resolveAt` is the run start (Clock's run anchor), and the offsets are measured in
// reference (real) elapsed time, so the window simply shifts with the run. This is the seam the
// future Stopwatch/Countdown facades sit on; only the displayed time is warped, not the window.
export default class ElapsedWindow implements DistortionWindow {
  constructor(private startOffsetMs: number, private endOffsetMs: number) {}

  resolveAt(anchorMs: number): ResolvedWindow {
    return { startMs: anchorMs + this.startOffsetMs, endMs: anchorMs + this.endOffsetMs };
  }

  clone() {
    return new ElapsedWindow(this.startOffsetMs, this.endOffsetMs);
  }
}
