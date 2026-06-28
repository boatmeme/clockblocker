import Clock from './Clock';
import RelativeTimeDistortion from './RelativeTimeDistortion';
import { Duration, durationToMillis } from './duration';

// A countdown counts DOWN in warped time toward a real deadline. Distortions can make it crawl
// early and sprint late, yet -- because the offset is cumulative and a dilation is repaid by a
// later compression -- it still reaches zero exactly when the real deadline arrives. The target
// is a real-time duration measured from the run's t=0.
export default class Countdown {
  private _clock: Clock;
  private _runStartInMillis: number;
  private _targetInMillis: number;

  constructor(target: Duration, timeDistortions: Array<RelativeTimeDistortion> = []) {
    this._targetInMillis = durationToMillis(target);
    this._clock = new Clock(timeDistortions);
    this._runStartInMillis = this._clock.runStartInMillis;
  }

  // Escape hatch onto the underlying Clock (relativeTimeInMillis, referenceTimeInMillis, ...).
  get clock() {
    return this._clock;
  }

  get targetInMillis() {
    return this._targetInMillis;
  }

  // Warped time elapsed since the countdown started.
  get elapsedInMillis() {
    return this._clock.relativeTimeInMillis - this._runStartInMillis;
  }

  // Warped time left until the deadline, resting at zero once reached (never negative).
  get remainingInMillis() {
    return Math.max(0, this._targetInMillis - this.elapsedInMillis);
  }

  get isComplete() {
    return this.elapsedInMillis >= this._targetInMillis;
  }
}
