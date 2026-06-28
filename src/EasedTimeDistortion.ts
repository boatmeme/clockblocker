import RelativeTimeDistortion, { DistortionAnchor } from './RelativeTimeDistortion';
import { Duration, durationToMillis } from './duration';

// A single ramp width, expressed either as a Duration of real (reference) time -- consistent
// with the rest of the API, and the right unit for human-imperceptible easing, which is an
// absolute-time phenomenon -- or as a bare number in [0, 1], a fraction of the window. The
// fraction form is handy when a ramp is driven by a normalized control (a slider/potentiometer)
// and you'd rather reason in proportions than convert through the window length.
export type RampSpec = Duration | number;

// Shapes the eased rate curve. `ramp` sets both ease regions symmetrically; `rampIn` / `rampOut`
// override an individual side and win over `ramp`. Each side defaults to `ramp` (or 0.5 when
// `ramp` is omitted -- the symmetric raised-cosine bump), CSS-padding style: `{ rampIn: 0.2 }`
// yields (0.2, 0.5); a hard stop needs an explicit `{ rampOut: 0 }`.
export interface EasedDistortionOptions {
  ramp?: RampSpec;
  rampIn?: RampSpec;
  rampOut?: RampSpec;
}

// A distortion whose rate varies *smoothly* across its window, instead of being flat like the
// Constant* family. A constant distortion snaps to a new rate at every window seam -- a visible
// kink -- which is exactly the tell the bedside-clock use case is trying to hide. An eased
// distortion eases the rate up from normal speed and back down within the window, so the fake
// clock slips into (and out of) its altered pace imperceptibly.
//
// The rate follows a trapezoid with cosine-eased corners: a rising half-cosine ramp of width
// `rampIn`, a flat plateau, then a falling half-cosine ramp of width `rampOut` (widths as
// fractions of the window). The default `rampIn = rampOut = 0.5` leaves no plateau and the two
// ramps meet at the midpoint -- a raised-cosine *bump*, where the peak deviation is twice the
// average (e.g. a half-speed window momentarily reaches a full pause). Narrower ramps keep a
// flat middle, so the slowdown can be sustained and gentle; asymmetric ramps shift where the
// easing sits (long gentle onset, quick roll-off, or vice versa). `rampIn`/`rampOut` -> 0
// collapse a side back to a hard, constant-rate seam.
//
// The whole-window contract is unchanged from the constant case regardless of the curve: over
// `referenceDuration` of real time the fake clock still advances exactly `relativeDuration`, so
// composed windows net out identically. Only the *distribution* of that gain/loss differs.
//
// `distortTime` must return the definite integral of the rate over [offset, offset + length] --
// not a point sample -- or the offset accumulated by `Clock` would depend on how often the clock
// is polled (see test/Clock.invariants.test.ts, which sums arbitrary slices). We express the
// curve through its normalized cumulative `cumulativeFraction(u)`: the fraction of the window's
// *total* offset delta accrued by reference-fraction `u` in [0, 1]. The integral over a slice is
// then just the difference of the cumulative at the slice endpoints. Any curve must satisfy
// `cumulativeFraction(0) === 0` and `cumulativeFraction(1) === 1` for the whole-window contract
// to hold; subclasses may override it to ship entirely different shapes.
export default class EasedTimeDistortion extends RelativeTimeDistortion {
  protected readonly rampInFraction: number;
  protected readonly rampOutFraction: number;

  constructor(
    anchor: DistortionAnchor,
    relativeDuration: Duration,
    referenceDuration: Duration = relativeDuration,
    options: EasedDistortionOptions = {},
  ) {
    super(anchor, relativeDuration, referenceDuration);
    // A Duration is real time, so its fraction of the window is its share of referenceDuration;
    // a number is already that fraction.
    const toFraction = (spec: RampSpec) =>
      typeof spec === `number` ? spec : durationToMillis(spec) / this.referenceDurationInMillis;
    const both = options.ramp !== undefined ? toFraction(options.ramp) : 0.5;
    let rampIn = options.rampIn !== undefined ? toFraction(options.rampIn) : both;
    let rampOut = options.rampOut !== undefined ? toFraction(options.rampOut) : both;
    rampIn = Math.max(0, rampIn);
    rampOut = Math.max(0, rampOut);
    // The two ramps cannot overlap: their widths sum to at most the whole window. If they exceed
    // it, scale both down proportionally so the plateau just vanishes (an off-center tent). We
    // clamp rather than throw, consistent with the library's no-validation stance (roadmap #5).
    const total = rampIn + rampOut;
    if (total > 1) {
      rampIn /= total;
      rampOut /= total;
    }
    this.rampInFraction = rampIn;
    this.rampOutFraction = rampOut;
  }

  protected cumulativeFraction(u: number): number {
    const a = this.rampInFraction;
    const b = this.rampOutFraction;
    // Area under the unit-height trapezoid: half of each ramp plus the full plateau.
    const area = 1 - a / 2 - b / 2;
    // Integral of the rising half-cosine ramp ½(1 - cos(πt / width)) from 0 to x: zero slope at
    // both ends, so the rate (and its slope) join the neighboring regions without a kink.
    const ramp = (x: number, width: number) => 0.5 * (x - (width / Math.PI) * Math.sin((Math.PI * x) / width));
    let cumulative: number;
    if (u < a) {
      cumulative = ramp(u, a);
    } else if (u <= 1 - b) {
      cumulative = a / 2 + (u - a);
    } else {
      // The falling ramp is the rising ramp mirrored; by symmetry its remaining area to u is the
      // rising ramp evaluated at the mirrored point (1 - u).
      cumulative = area - ramp(1 - u, b);
    }
    return cumulative / area;
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
