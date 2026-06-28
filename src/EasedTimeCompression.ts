import EasedTimeDistortion from './EasedTimeDistortion';

// Eased compression speeds the fake clock up (relativeDuration > referenceDuration), but unlike
// ConstantTimeCompression the speed-up eases in from normal speed and back out -- no rate kink at
// the seams. By default it rides a symmetric raised-cosine bump; pass `{ ramp }` (or asymmetric
// `{ rampIn, rampOut }`) to open a plateau for a sustained, gentle speed-up. See
// EasedTimeDistortion for the rate-curve / integral contract and the ramp options; this class
// only fixes the compression intent.
export default class EasedTimeCompression extends EasedTimeDistortion {}
