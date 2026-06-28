// The contract `Clock` consumes a distortion window through. Each window resolves itself,
// against the run anchor captured at `Clock` construction, to a single fixed [start, end)
// interval in reference (real) epoch millis. Any anchor kind (time-of-day, elapsed, ...) is
// just another implementation of this contract; the offset integrator never has to know which.
export interface ResolvedWindow {
  startMs: number;
  endMs: number;
}

export interface DistortionWindow {
  // `timeZone` is the Clock's frame of reference, used to resolve wall-clock inputs
  // (time-of-day, absolute descriptors) to instants. Run-relative windows ignore it.
  resolveAt(anchorMs: number, timeZone?: string): ResolvedWindow;
  clone(): DistortionWindow;
}
