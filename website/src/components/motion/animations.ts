export const appleEase = [0.16, 1, 0.3, 1] as const

export const fadeInSlideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: appleEase,
    },
  },
}

export const staggerContainer = (staggerChildren = 0.07, delayChildren = 0.05) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
})

export const springButton = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 450, damping: 25 },
}

export const cardHover = {
  whileHover: {
    y: -3,
    transition: { duration: 0.2, ease: appleEase },
  },
}
