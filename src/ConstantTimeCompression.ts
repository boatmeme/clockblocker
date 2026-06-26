import RelativeTimeDistortion from './RelativeTimeDistortion';
export default class TimeCompression extends RelativeTimeDistortion {
  // Compression speeds the fake clock up: more relative time passes than reference time
  // (relativeDuration > referenceDuration). `Clock` adds this return value to an offset
  // that is itself added to the reference time, so what we return is the *offset delta*
  // contributed by `numberOfMilliseconds` of reference time. Over a slice of real time
  // `dt` the fake clock advances `dt * (relative / reference)`, so the offset (the gap
  // between fake and real time) changes by `dt * (relative / reference - 1)`.
  distortTime(numberOfMilliseconds: number): number {
    return numberOfMilliseconds * (this.relativeDurationInMillis / this.referenceDurationInMillis - 1);
  }
}
