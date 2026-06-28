import EasedTimeDistortion from './EasedTimeDistortion';

// Eased compression speeds the fake clock up (relativeDuration > referenceDuration), but unlike
// ConstantTimeCompression the speed-up eases in from normal speed, peaks at the window midpoint,
// and eases back out -- no rate kink at either seam. See EasedTimeDistortion for the rate-curve
// / integral contract; the math is shape-agnostic, so this is the raised cosine inherited from
// the base.
export default class EasedTimeCompression extends EasedTimeDistortion {}
