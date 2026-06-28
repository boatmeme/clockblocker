import EasedTimeDistortion from './EasedTimeDistortion';

// Eased dilation slows the fake clock down (relativeDuration < referenceDuration), but unlike
// ConstantTimeDilation the slowdown eases in from normal speed, deepens to its peak at the
// window midpoint, and eases back out -- no rate kink at either seam. See EasedTimeDistortion
// for the rate-curve / integral contract; the math is shape-agnostic, so this is the raised
// cosine inherited from the base.
export default class EasedTimeDilation extends EasedTimeDistortion {}
