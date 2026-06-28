// The contract `Clock` consumes a distortion window through. Each window resolves itself,
// against the run anchor captured at `Clock` construction, to a single fixed [start, end)
// interval in reference (real) epoch millis. Any anchor kind (time-of-day, elapsed, ...) is
// just another implementation of this contract; the offset integrator never has to know which.
export interface ResolvedWindow {
  startMs: number;
  endMs: number;
}

export interface DistortionWindow {
  resolveAt(anchorMs: number): ResolvedWindow;
  clone(): DistortionWindow;
}
