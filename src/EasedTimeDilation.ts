import EasedTimeDistortion from './EasedTimeDistortion';

// Eased dilation slows the fake clock down (relativeDuration < referenceDuration), but unlike
// ConstantTimeDilation the slowdown eases in from normal speed and back out -- no rate kink at
// the seams. By default it rides a symmetric raised-cosine bump; pass `{ ramp }` (or asymmetric
// `{ rampIn, rampOut }`) to open a plateau for a sustained, gentle slow. See EasedTimeDistortion
// for the rate-curve / integral contract and the ramp options; this class only fixes the
// dilation intent.
export default class EasedTimeDilation extends EasedTimeDistortion {}
