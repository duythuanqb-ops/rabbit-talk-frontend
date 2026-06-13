'use client';

import { motion, HTMLMotionProps, Variants } from 'framer-motion';

type StaggerContainerProps = {
  delayChildren?: number;
  staggerChildren?: number;
} & (
  | ({ as?: 'div' } & HTMLMotionProps<"div">)
  | ({ as: 'form' } & HTMLMotionProps<"form">)
);

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: (custom: { delayChildren: number; staggerChildren: number }) => ({
    opacity: 1,
    transition: {
      delayChildren: custom.delayChildren,
      staggerChildren: custom.staggerChildren,
    },
  }),
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export function StaggerContainer({
  children,
  delayChildren = 0,
  staggerChildren = 0.1,
  className,
  as,
  ...restProps
}: StaggerContainerProps) {
  if (as === 'form') {
    return (
      <motion.form
        variants={staggerContainerVariants}
        initial="hidden"
        animate="show"
        custom={{ delayChildren, staggerChildren }}
        className={className}
        {...(restProps as HTMLMotionProps<"form">)}
      >
        {children}
      </motion.form>
    );
  }

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="show"
      custom={{ delayChildren, staggerChildren }}
      className={className}
      {...(restProps as HTMLMotionProps<"div">)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}
