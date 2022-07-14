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
),

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
## Roadmap (as of August 2022)

There are plenty of improvements I can imagine implementing, but I need some time living with the API as it currently exists before going further. This is my top-o-the-head, tip-o-the-tongue wishlist:

1. Right now, when scheduling multiple time distortions, the API requires you to know the start and reference (real-time) end times if you would like to ensure non-overlapping distortion windows. This begs for a way to "chain" `RelativeTimeDistortion` instances, or perhaps pass another distortion into the constructor, and derive the next start-time from the end of the earlier one. 
2. We might want an abstraction for performing validation of the parameters in the `RelativeTimeDistortion` constructors. For example, it doesn't make a ton of sense to allow `relativeDuration` params to be smaller than `referenceDuration` params for the `ConstantTimeDilation`. Maybe there's some further refactoring that could avoid that, but I don't have any ideas on what that might look like. My intuition is that we wouldn't want to implicitly *disallow* overlapping if validation fails.
3. I want something *smoother* than the `ConstantTime*` distortions. Let's get this shit rubber-banding across Gaussian roll-offs (hoping to have a PR for that soon). Sky is the limit, though, on extending `RelativeTimeDistortion` to implement some crazy behaviors. And to that end...
4. Might need to rethink the extend `RelativeTimeDistortion` abstraction. Not yet sure whether we want to build further onto extending the class hierarchy and change that `distortTime` interface to an anonymous function that is passed-into the `RelativeTimeDistortion` instance? Maybe the function should take an `ratio` instead of direct access to protected attributes. I'm not sure yet, but I'm open to refactoring how that might work.
5. I have a vague intuition that there are further levels of abstraction to be mined in building specific, pre-defined combinations of distortions, but I see that as further out on the roadmap. 
6. A case could probably be made for providing an interface for manipulating the distortions of an existing `Clock` instance, but right now, since the `referenceTime` is always based off of the underlying process' `Date.now()`, I'm content to just create new instances of `Clock`.

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
