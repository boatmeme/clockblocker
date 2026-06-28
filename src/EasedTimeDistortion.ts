import RelativeTimeDistortion from './RelativeTimeDistortion';

// A distortion whose rate varies *smoothly* across its window, instead of being flat like the
// Constant* family. A constant distortion snaps to a new rate at every window seam -- a visible
// kink -- which is exactly the tell the bedside-clock use case is trying to hide. An eased
// distortion lets the rate ease up from zero and back down to zero within the window, so the
// fake clock slips into (and out of) its altered pace imperceptibly.
//
// The whole-window contract is unchanged from the constant case: over `referenceDuration` of
// real time the fake clock still advances exactly `relativeDuration`, so composed windows net
// out identically. Only the *distribution* of that gain/loss across the window differs.
//
// `distortTime` must return the definite integral of the rate over [offset, offset + length] --
// not a point sample -- or the offset accumulated by `Clock` would depend on how often the
// clock is polled (see test/Clock.invariants.test.ts, which sums arbitrary slices). We express
// each curve through its normalized cumulative `cumulativeFraction(u)`: the fraction of the
// window's *total* offset delta that has accrued by reference-fraction `u` in [0, 1]. The
// integral over a slice is then just the difference of the cumulative at the slice endpoints.
// Any curve must satisfy `cumulativeFraction(0) === 0` and `cumulativeFraction(1) === 1` for the
// whole-window contract to hold; subclasses override it to ship other shapes (e.g. a Gaussian
// roll-off -- roadmap #3).
export default class EasedTimeDistortion extends RelativeTimeDistortion {
  // Raised-cosine "bump": the rate follows (D / ref)(1 - cos(2*pi*u)), which is zero at both
  // seams, peaks at twice the average rate at the midpoint, and integrates to the window's total
  // delta D. The cumulative below is that rate's antiderivative, normalized to [0, 1].
  protected cumulativeFraction(u: number): number {
    return u - Math.sin(2 * Math.PI * u) / (2 * Math.PI);
  }

  // Public (widened from the `protected abstract` declaration) to mirror the Constant* family,
  // whose `distortTime` is directly unit-testable.
  distortTime(numberOfMilliseconds: number, offset = 0): number {
    const ref = this.referenceDurationInMillis;
    const totalDelta = this.relativeDurationInMillis - ref;
    const startFraction = this.cumulativeFraction(offset / ref);
    const endFraction = this.cumulativeFraction((offset + numberOfMilliseconds) / ref);
    return totalDelta * (endFraction - startFraction);
  }
}
