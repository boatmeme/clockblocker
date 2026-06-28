import ElapsedWindow from '../src/ElapsedWindow';

describe(`ElapsedWindow class`, () => {
  const minute = 60 * 1000;

  describe(`resolveAt`, () => {
    it(`shifts the offsets by the run anchor`, () => {
      const window = new ElapsedWindow(0, 30 * minute);
      const anchor = 1_000_000; // arbitrary run start, in epoch millis

      expect(window.resolveAt(anchor)).toEqual({ startMs: anchor, endMs: anchor + 30 * minute });
    });

    it(`is purely additive: only the anchor changes, never the span`, () => {
      const window = new ElapsedWindow(5 * minute, 20 * minute);

      // Two very different run starts produce intervals of identical length, each pinned to its
      // own anchor -- the window is run-relative, never tied to a wall-clock instant.
      const early = window.resolveAt(0);
      const late = window.resolveAt(7 * 24 * 60 * minute); // a week later

      expect(early).toEqual({ startMs: 5 * minute, endMs: 20 * minute });
      expect(late.endMs - late.startMs).toEqual(early.endMs - early.startMs);
      expect(late.startMs - early.startMs).toEqual(7 * 24 * 60 * minute);
    });
  });

  describe(`clone`, () => {
    it(`returns an independent, equivalent window`, () => {
      const window = new ElapsedWindow(minute, 4 * minute);
      const clone = window.clone();

      expect(clone).not.toBe(window);
      expect(clone.resolveAt(0)).toEqual(window.resolveAt(0));
    });
  });
});
