import Clock from './Clock';
import RelativeTimeDistortion from './RelativeTimeDistortion';

// A stopwatch counts UP in warped time from the moment it is started. It is a thin view over a
// Clock: the warped elapsed time is just the relative ("fraudulent") time minus the run's t=0,
// so distortions make the elapsed reading crawl or sprint while real time ticks on normally.
export default class Stopwatch {
  private _clock: Clock;
  private _runStartInMillis: number;

  constructor(timeDistortions: Array<RelativeTimeDistortion> = []) {
    this._clock = new Clock(timeDistortions);
    this._runStartInMillis = this._clock.runStartInMillis;
  }

  // Escape hatch onto the underlying Clock (relativeTimeInMillis, referenceTimeInMillis, ...).
  get clock() {
    return this._clock;
  }

  // Warped time elapsed since the stopwatch started.
  get elapsedInMillis() {
    return this._clock.relativeTimeInMillis - this._runStartInMillis;
  }

  // Real time elapsed since the stopwatch started (undistorted).
  get referenceElapsedInMillis() {
    return this._clock.referenceTimeInMillis - this._runStartInMillis;
  }
}
