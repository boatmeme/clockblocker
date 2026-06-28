import AbsoluteWindow from '../src/AbsoluteWindow';

describe(`AbsoluteWindow class`, () => {
  const hour = 60 * 60 * 1000;

  describe(`resolveAt`, () => {
    it(`ignores the run anchor entirely (it is pinned to a fixed instant)`, () => {
      const window = new AbsoluteWindow(new Date(`2026-12-25T01:00:00Z`), 6 * hour);

      // Wildly different anchors, identical bounds -- that is what "absolute" means.
      expect(window.resolveAt(0)).toEqual(window.resolveAt(8.64e15));
      expect(window.resolveAt(0)).toEqual({
        startMs: Date.UTC(2026, 11, 25, 1),
        endMs: Date.UTC(2026, 11, 25, 7),
      });
    });

    it(`resolves a wall-clock descriptor in the supplied timezone`, () => {
      const window = new AbsoluteWindow({ year: 2026, month: 12, day: 25, hour: 1 }, 6 * hour);

      // Default zone is UTC.
      expect(window.resolveAt(0).startMs).toEqual(Date.UTC(2026, 11, 25, 1));
      // The same wall-clock time is a *different* instant in Denver (MST, UTC-7 in December).
      expect(window.resolveAt(0, `America/Denver`).startMs).toEqual(Date.UTC(2026, 11, 25, 8));
    });

    it(`supports multi-day spans well beyond the 24h overnight wrap`, () => {
      const window = new AbsoluteWindow(new Date(`2026-12-25T00:00:00Z`), 72 * hour);
      const { startMs, endMs } = window.resolveAt(0);

      expect(endMs - startMs).toEqual(72 * hour);
      expect(endMs).toEqual(Date.UTC(2026, 11, 28, 0));
    });
  });

  describe(`clone`, () => {
    it(`returns an independent, equivalent window`, () => {
      const window = new AbsoluteWindow({ year: 2026, month: 12, day: 25, hour: 1 }, 6 * hour);
      const clone = window.clone();

      expect(clone).not.toBe(window);
      expect(clone.resolveAt(0, `America/Denver`)).toEqual(window.resolveAt(0, `America/Denver`));
    });
  });
});
