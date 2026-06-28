# (๑ᵕ⌓ᵕ̤) clockblocker [![npm version](https://badge.fury.io/js/clockblocker.svg)](https://badge.fury.io/js/clockblocker) [![Node.js CI](https://github.com/boatmeme/clockblocker/actions/workflows/node.js.yml/badge.svg)](https://github.com/boatmeme/clockblocker/actions/workflows/node.js.yml)

A Typescript library for warping the very fabric of space-time, or for building deceitful clocks.

## Overview

Do you sometimes stare at the clock, watching the minutes tick by, wondering by what trick-of-perception some minutes seem to pass more slowly than the last? 

"Watched pot, not boiling", you think...

...but still...could there be...some little relativistic, Einsteinian gremlins, toiling away behind the clock face, deeply invested in and hell-bent upon your personal descent into the mouth of madness?

Probably not.

But, hey, now *you* can build your own fraudulent clock to drive others _**completely bonkers**_! 

With `clockblocker`, Time is but a rubber-band, subject to your every passing whimsy.

## Why should I use this library?

First, let's assume you've got a very good (read: not evil) reason for wanting the clock to tick more slowly during a given time period.

You're building some kind of device capable of displaying the time, a la a digital clock LED display. This clock will be used by a miniature-human who, whenever they awaken past 4:00am, is incapable of returning to sleep. If the clock reads 3:59, the small person rolls right back over and goes to sleep.

In order to ensure a later arrival of 4:00am, we might wish to make the seconds start ticking ever more slowly at some point earlier in the night, to ensure that the clock doesn't actually show 4:00am until - let's say - 7:00am.

We probably want some facilities for easing-into the slowing of time, so that it isn't immediately obvious what is happening under cursory, ambient observations. Likewise, we might want to ease-back into normal time, rather than snapping immediately from 4:00am to 7:01 am.

Also, the tiny human isn't stupid, so you're gonna just have to hide all the other clocks in the house. And windows! You've gotta black-out the windows or the jig is up! 

Let's be honest, you'll only be able to get away with this once a year, on Christmas morning.

---
## Install

```
npm install clockblocker
```

Requires Node.js >= 18.

## Usage

```
import { Clock, ConstantTimeCompression, ConstantTimeDilation } from 'clockblocker';

const timeDilation = new ConstantTimeDilation(
  { hour: 1 }, // start at 1am, reference ("real") time
  { hours: 3 }, // Relative Time: By the time the "fake" time reads 4am...
  { hours: 6 }, // Reference Time: 6 hours of "real" time will have passed
);

// Fake clock will read: 4:00am, real clock: 7:00am

const timeCompression = new ConstantTimeCompression(
  { hour: 7 }, // start at 7am reference ("real") time
  { hours: 6 }, // Relative Time: In the time the "fake" time shows the passage of 6 hours 
  { hours: 3}, // Reference Time: Only 3 hours, real time will have elapsed 
);

// So, by the time 10:00am (reference) rolls-around, the clock is back to normal 1-to-1 time.
// Fake clock will read: 10:00am, real clock: 10:00am

const clock = new Clock([
  timeDilation,
  timeCompression
]);
```

Now, there are two properties of the clock instance that are useful

- `clock.relativeTimeInMillis` is the fraudulent time in `epochMillis`
- `clock.referenceTimeInMillis` is the "real" system clock time in `epochMillis`

Following the `clock` instance created in the prior example:

```
// At 12:00am (real clock)
clock.relativeTimeInMillis // returns epochMillis for 12:00am
clock.referenceTimeInMillis // returns epochMillis for 12:00am

// At 1:00am (real clock)
clock.relativeTimeInMillis // returns epochMillis for 1:00am
clock.referenceTimeInMillis // returns epochMillis for 1:00am

// At 2:00am (real clock)
clock.relativeTimeInMillis // returns epochMillis for 1:30am
clock.referenceTimeInMillis // returns epochMillis for 2:00am

// At 3:00am (real clock)
clock.relativeTimeInMillis // returns epochMillis for 2:00am
clock.referenceTimeInMillis // returns epochMillis for 3:00am

// At 4:00am (real clock)
clock.relativeTimeInMillis // returns epochMillis for 2:30am
clock.referenceTimeInMillis // returns epochMillis for 4:00am

// At 5:00am (real clock)
clock.relativeTimeInMillis // returns epochMillis for 3:00am
clock.referenceTimeInMillis // returns epochMillis for 5:00am

// At 6:00am (real clock)
clock.relativeTimeInMillis // returns epochMillis for 3:30am
clock.referenceTimeInMillis // returns epochMillis for 6:00am

// At 7:00am (real clock)
clock.relativeTimeInMillis // returns epochMillis for 4:00am
clock.referenceTimeInMillis // returns epochMillis for 7:00am

// At 8:00am (real clock)
clock.relativeTimeInMillis // returns epochMillis for 6:00am
clock.referenceTimeInMillis // returns epochMillis for 8:00am

// At 9:00am (real clock)
clock.relativeTimeInMillis // returns epochMillis for 8:00am
clock.referenceTimeInMillis // returns epochMillis for 9:00am

// At 10:00am (real clock) **NOW WE'RE BACK IN SYNC**
clock.relativeTimeInMillis // returns epochMillis for 10:00am
clock.referenceTimeInMillis // returns epochMillis for 10:00am

// At 11:00am (real clock)
clock.relativeTimeInMillis // returns epochMillis for 11:00am
clock.referenceTimeInMillis // returns epochMillis for 11:00am
```
## How windows are scheduled

A few things worth knowing about *when* your distortions actually fire:

- **Windows are anchored when the `Clock` is constructed.** Each distortion's window resolves
  *once* — to its current-or-next occurrence as of the moment you call `new Clock(...)` — and
  stays pinned there for the life of that clock. So build the `Clock` at (or before) the window
  you intend to bend. If a window has already fully passed at construction time, it resolves to
  its *next* occurrence instead.
- **Windows are one-shot.** A window distorts a single occurrence, not "every night" — which is
  fine, because you'll only get away with this once a year on Christmas morning anyway. Want the
  next occurrence? Spin up a new `Clock`.
- **Overnight windows work.** A window whose end-of-day is earlier than its start (e.g.
  `{ hour: 23 }` → `03:00`) spans midnight and keeps distorting straight across the date boundary.
- **The offset is cumulative.** Time lost to a dilation persists until a later compression pays it
  back. Polling matters not: read the clock once or a thousand times, eagerly or after idling for
  days — each window is integrated exactly once.

## Roadmap

The core anchor system is in place: a distortion can be pinned to a wall-clock **time-of-day**, to **elapsed** time since the run started (the basis for `Stopwatch` and `Countdown`), or to an **absolute** calendar instant (including multi-day spans) — all timezone-aware, and correct across midnight and sparse polling.

From here, roughly in priority order:

1. **More eased distortion curves.** The eased family has landed: `EasedTime{Dilation,Compression}` smoothly vary their rate so there's no snap at the seams (the tell we're trying to hide). Their default is a raised-cosine *bump*; a per-side `{ ramp, rampIn, rampOut }` opens a flat plateau for a sustained, gentle (and optionally asymmetric) slow. Gaussian roll-offs were considered and dropped — a Gaussian bump is the same single-hump character as the cosine but costs an `erf` approximation, and the plateau already fills the genuinely different "sustained gentle" need. Still open: revisiting the extension point — a rate function passed *into* the distortion (taking a ratio) instead of subclassing — so custom curves don't have to reach into protected fields. Any new curve just supplies its normalized cumulative on `EasedTimeDistortion` today.
2. **`daily` recurrence for time-of-day windows.** The `'none' | 'daily'` seam already lives on `TimeWindow`; only one-shot is wired up. Daily would fire a window "every night," summing each occurrence into the cumulative offset.
3. **Changing a running `Clock`'s timezone.** The zone is immutable today — to move zones you build a new `Clock`. A seeded-successor `Clock` (injectable run-anchor + offset) could carry the in-flight fake time and distortions into a new zone, pending a policy for how time-of-day windows refire when local time jumps.
4. **Calendar-aware durations.** `Duration` is exact milliseconds, so "3 days" is `{ hours: 72 }` and won't track DST. Optional `days`/`weeks` units resolved through Temporal would anchor spans to wall-clock dates.
5. **Parameter validation.** Opt-in sanity checks (a dilation that's secretly a compression, negative elapsed offsets, malformed absolute descriptors) — without implicitly *disallowing* overlapping windows.
6. **Chaining distortions.** Derive one window's start from the previous one's end, so non-overlapping schedules don't require hand-computing every boundary.
7. **Pre-defined recipes & live `Clock` mutation.** Higher-level, pre-built combinations of distortions, and possibly an interface to adjust an existing `Clock`'s distortions in place — though for now, since `referenceTime` is just `Date.now()`, the idiom is happily to spin up a new `Clock`.

## API

TODO: Better docs

The most important thing is to understand the three paramters passed to an instance of `RelativeTimeDistortion`

- `referenceStartClockTime: ClockTimeDescriptor`,
- `relativeDuration: Duration`,
- `referenceDuration: Duration`,

`referenceStartClockTime` describes a (real) clock-time, at which the distortion should start, without reference to a specific date, or time-zone. Its type looks like this:

```
export interface ClockTimeDescriptor {
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
}
```

`relativeDuration` describes a duration of "fake" clock-time that should appear to pass during the distortion window. Its type looks like this:

```
export interface Duration {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}
```

`referenceDuration` describes a duration of "real" clock-time that actually will pass during the distortion window. Its type looks like this:

```
export interface Duration {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}
```

### Anchoring a distortion to the run instead of a time-of-day

By default `referenceStartClockTime` is a wall-clock time-of-day. You can instead anchor a distortion to the *run itself* — measured in real time elapsed since the `Clock` was constructed — by passing `{ elapsed }` in that first slot:

```
import { Clock, ConstantTimeDilation } from 'clockblocker';

// Crawl at half speed for the first 30 real minutes of the run, no matter what the wall clock reads.
const clock = new Clock([
  new ConstantTimeDilation(
    { elapsed: { minutes: 0 } }, // start at t=0 of the run (vs. a wall-clock time)
    { minutes: 15 },             // 15 minutes of "fake" time appear to pass...
    { minutes: 30 },             // ...over the first 30 real minutes
  ),
]);
```

(This is the building block for the `Stopwatch` and `Countdown` clocks below.)

### Anchoring a distortion to a fixed calendar instant

Pass `{ absolute }` to pin a distortion to a specific real-world moment, independent of when the `Clock` was constructed. Because it is plain instant arithmetic, the span can be as long as you like — true multi-day distortions, with none of the ~24h limit a time-of-day window has:

```
import { Clock, ConstantTimeDilation } from 'clockblocker';

// Dilate continuously for 3 real days starting at a fixed instant.
const clock = new Clock([
  new ConstantTimeDilation(
    { absolute: new Date('2026-12-25T00:00:00Z') }, // a fully-specified moment
    { hours: 36 }, // 36 hours of "fake" time appear to pass...
    { hours: 72 }, // ...over 72 real hours
  ),
]);
```

The start can be a JS `Date` (an instant) or a wall-clock descriptor resolved against the clock's timezone (see below):

```
{ absolute: { year: 2026, month: 12, day: 25, hour: 1 } } // 1:00am, in the clock's zone
```

So the start anchor accepts any of these forms:

```
export type DistortionAnchor =
  | ClockTimeDescriptor              // a wall-clock time-of-day (default)
  | { elapsed: Duration }            // relative to the run's t=0
  | { absolute: Date | AbsoluteDescriptor }; // a fixed real-world instant
```

### Timezone

A `Clock` resolves its wall-clock windows — both time-of-day and `absolute` descriptors — against a timezone you pass as a second argument (default `'UTC'`):

```
// "1:00am–7:00am" now means 1am–7am in Denver, DST and all.
const clock = new Clock(distortions, { timeZone: 'America/Denver' });
```

The timezone is fixed for the life of the clock; to run in a different zone, construct a new `Clock`. (Run-relative `{ elapsed }` windows ignore the zone, and an `{ absolute }` start given as a `Date` is already an instant, so it ignores it too.)

### Eased (smooth) distortions

`ConstantTime*` applies a flat rate across its whole window, which means the clock's speed *snaps* the instant a window opens, closes, or hands off to the next one — under casual observation, those kinks are the giveaway. `EasedTime{Dilation,Compression}` are drop-in replacements that take the **same three arguments** (plus an optional fourth to shape the easing) and spread the same total gain/loss across the window smoothly. By default the rate eases in from normal speed on a raised-cosine curve, peaks at the midpoint, and eases back out, so there's no detectable seam.

```
import { Clock, EasedTimeDilation, EasedTimeCompression } from 'clockblocker';

const clock = new Clock([
  // Same contract as ConstantTimeDilation: lose 3h of fake time over 6h of real time...
  new EasedTimeDilation({ hour: 1 }, { hours: 3 }, { hours: 6 }),
  // ...then claw it back. By 10am the clock is exactly in sync again, just as before.
  new EasedTimeCompression({ hour: 7 }, { hours: 6 }, { hours: 3 }),
]);
```

The whole-window contract is identical to the constant case — over `referenceDuration` of real time the fake clock still advances exactly `relativeDuration`, so composed windows net out the same way and a constant clock can be swapped for an eased one without recomputing any boundaries. Only the *distribution* of the slowdown across the window changes.

#### Shaping the ramp

The default bump preserves the window's average rate while easing to normal speed at both ends, so the peak deviation is twice the average — the half-speed example above momentarily reaches a full *pause* at the midpoint. To slow more *gently* and *sustainedly* instead, narrow the ease regions with an optional fourth argument so a flat plateau opens up in the middle:

```
// Ease in/out over the outer 10% of the window each; hold a gentle, steady rate across
// the middle 80%. Same 3h loss over 6h -- just spread far more evenly.
new EasedTimeDilation({ hour: 1 }, { hours: 3 }, { hours: 6 }, { ramp: 0.1 });
```

`ramp` is the width of *each* ease region. It accepts either a **fraction** of the window (a number in `[0, 1]`, handy when it's driven by a normalized control like a slider) or a **`Duration`** of real time (consistent with the rest of the API, and the natural unit for imperceptibility, which is an absolute-time effect):

```
new EasedTimeDilation({ hour: 1 }, { hours: 3 }, { hours: 6 }, { ramp: { minutes: 36 } });
```

The two ends are independent. `rampIn` / `rampOut` override a single side and win over the symmetric `ramp` shorthand; each side defaults to `ramp` (or `0.5`) when unset. A side of `0` is a hard, constant-rate seam.

```
// Long gentle onset, quick roll-off.
new EasedTimeDilation({ hour: 1 }, { hours: 3 }, { hours: 6 }, { rampIn: 0.3, rampOut: 0.05 });

// Ease in, then stop dead at the boundary.
new EasedTimeDilation({ hour: 1 }, { hours: 3 }, { hours: 6 }, { rampIn: 0.2, rampOut: 0 });
```

The endpoints are limiting cases of `ramp`: `0.5` (the default) is the raised-cosine bump, and `0` collapses to the hard-seam `ConstantTime*` behavior. Overlapping ramps (widths summing past the window) are scaled down proportionally rather than rejected.

To ship an entirely different shape, subclass `EasedTimeDistortion` and override `cumulativeFraction(u)` — the fraction of the window's total offset delta accrued by reference-fraction `u` in `[0, 1]` (it must run `0 → 1`). The base class integrates it over each polled slice, so polling frequency never affects the result:

```
import { EasedTimeDistortion } from 'clockblocker';

class SmoothstepDistortion extends EasedTimeDistortion {
  protected cumulativeFraction(u: number): number {
    return u * u * (3 - 2 * u); // classic smoothstep S-curve
  }
}
```

## Stopwatch & Countdown

`Stopwatch` and `Countdown` are thin clocks built over the run-relative (`elapsed`) anchor. Both take the same array of distortions a `Clock` does and start their run the moment you construct them.

A **`Stopwatch`** counts *up* in warped time. Distortions make the elapsed reading crawl or sprint while real time ticks on normally:

```
import { Stopwatch, ConstantTimeDilation } from 'clockblocker';

const stopwatch = new Stopwatch([
  new ConstantTimeDilation({ elapsed: { minutes: 0 } }, { minutes: 15 }, { minutes: 30 }),
]);

// 30 real minutes later:
stopwatch.elapsedInMillis          // 15 minutes — the warped reading crawled
stopwatch.referenceElapsedInMillis // 30 minutes — real, unbent elapsed time
```

A **`Countdown`** counts *down* in warped time toward a real deadline (a duration measured from the run's start). Because the offset is cumulative — a dilation is repaid by a later compression — the countdown can crawl early and sprint late yet still land on zero exactly when the real deadline arrives:

```
import { Countdown, ConstantTimeDilation, ConstantTimeCompression } from 'clockblocker';

// 45-minute deadline: crawl for the first 30 real minutes, then sprint to catch up.
const countdown = new Countdown({ minutes: 45 }, [
  new ConstantTimeDilation({ elapsed: { minutes: 0 } }, { minutes: 15 }, { minutes: 30 }),
  new ConstantTimeCompression({ elapsed: { minutes: 30 } }, { minutes: 30 }, { minutes: 15 }),
]);

// 30 real minutes in, only 15 of the 45 have ticked away — it crawled:
countdown.remainingInMillis // 30 minutes
countdown.isComplete        // false

// ...and at the real 45-minute mark it lands on zero, having sprinted the rest:
countdown.remainingInMillis // 0  (rests at zero, never negative)
countdown.isComplete        // true
```

Both expose a `clock` accessor onto the underlying `Clock` (for `relativeTimeInMillis` / `referenceTimeInMillis`) if you need it.

## Contributing

1. Fork repo
2. Add / modify tests
3. Add / modify implementation
4. Open PR
  * (Optional) link to your development soundtrack

## License

The MIT License (MIT)

Copyright (c) 2022 Jonathan Griggs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Soundtrack

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/k0tUb-87kP8/0.jpg)](https://www.youtube.com/watch?v=k0tUb-87kP8)
