import React from "react";
import { AnimatePresence, motion } from "motion/react";

const PageAnimation = ({
  children,
  keyValue,
  initial = { opacity: 0, scale: 0.98 },
  animate = { opacity: 1, scale: 1 },
  exit = { opacity: 0, scale: 0.98 },
  transition = { duration: 0.3, ease: "easeOut" },
  className,
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyValue}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageAnimation;
