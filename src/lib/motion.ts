import type { Transition, Variants } from 'motion/react'

/**
 * Apple-grade spring physics transitions:
 * High stiffness with critical damping for responsive, non-oscillating feel.
 */
export const appleSpring: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 30,
  mass: 0.8,
}

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
  mass: 1.0,
}

export const snappySpring: Transition = {
  type: 'spring',
  stiffness: 480,
  damping: 32,
  mass: 0.6,
}

export const springPhysics = {
  default: appleSpring,
  gentle: gentleSpring,
  snappy: snappySpring,
  subtle: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 35,
  },
}

/**
 * Smooth Apple/Anthropic editorial page transition curves
 */
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,
    filter: 'blur(2px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    filter: 'blur(2px)',
    transition: {
      duration: 0.14,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.02,
    },
  },
}

export const itemFadeInVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 360,
      damping: 28,
    },
  },
}
