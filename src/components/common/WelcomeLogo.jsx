import React from 'react';
import { motion } from 'framer-motion';

const WelcomeLogo = ({ className }) => {
  const svgVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.3,
      },
    },
  };

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 2,
        ease: 'easeInOut',
      },
    },
  };

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
        delay: 0.5,
      },
    },
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="150"
      height="150"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      variants={svgVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.circle cx="12" cy="12" r="10" variants={pathVariants} />
      <motion.line x1="12" y1="8" x2="12" y2="16" variants={lineVariants} />
      <motion.line x1="8" y1="12" x2="16" y2="12" variants={lineVariants} />
    </motion.svg>
  );
};

export default WelcomeLogo;