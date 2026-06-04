/**
 * Shared Framer Motion animation variants.
 *
 * Import from this file instead of re-declaring in each page —
 * keeps animation behaviour consistent across the app and avoids
 * the framer-motion v12 TypeScript issue where `type: 'spring'`
 * is inferred as `string` instead of a literal when declared inline.
 */
import type { Variants } from 'framer-motion';

/** Stagger wrapper — fades in and cascades children. */
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.1 } },
};

/** Individual child — slides up + fades in with a spring. */
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

/** Card entrance — subtle scale + fade. */
export const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show:   { opacity: 1, scale: 1,    transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

/** Slide + fade for tab/panel transitions. */
export const tabVariants: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x:   0,  transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit:    { opacity: 0, x:  10,  transition: { duration: 0.15 } },
};

/** Scale up from the bottom — used for podium bars etc. */
export const scaleUpVariants: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  show:   {
    scaleY: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15, delay: 0.2 },
  },
};
