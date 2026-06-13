
import type { Variants } from 'framer-motion';


export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.1 } },
};


export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};


export const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show:   { opacity: 1, scale: 1,    transition: { type: 'spring', stiffness: 260, damping: 22 } },
};


export const tabVariants: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x:   0,  transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit:    { opacity: 0, x:  10,  transition: { duration: 0.15 } },
};


export const scaleUpVariants: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  show:   {
    scaleY: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15, delay: 0.2 },
  },
};
