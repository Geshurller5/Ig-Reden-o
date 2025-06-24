import React, { useId } from 'react';
import { motion } from 'framer-motion';

const AnimatedLogo = ({ className, size = 'lg' }) => {
  const idSuffix = useId();
  const svgVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: "easeInOut",
      },
    },
  };

  const isSmall = size === 'sm';
  const svgSize = isSmall ? 32 : 48;
  const textSize = isSmall ? 'text-xl' : 'text-3xl';
  const spaceX = isSmall ? 'space-x-2' : 'space-x-3';

  return (
    <motion.div
      className={`flex items-center ${spaceX} ${className}`}
      variants={svgVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M12 18C12 14.6863 14.6863 12 18 12H30C33.3137 12 36 14.6863 36 18V30C36 33.3137 33.3137 36 30 36H18C14.6863 36 12 33.3137 12 30V18Z"
          stroke={`url(#paint0_linear_logo_${idSuffix})`}
          strokeWidth="4"
          variants={pathVariants}
        />
        <motion.path
          d="M24 12V36"
          stroke={`url(#paint1_linear_logo_${idSuffix})`}
          strokeWidth="4"
          strokeLinecap="round"
          variants={pathVariants}
        />
        <motion.path
          d="M18 24H30"
          stroke={`url(#paint2_linear_logo_${idSuffix})`}
          strokeWidth="4"
          strokeLinecap="round"
          variants={pathVariants}
        />
        <defs>
          <linearGradient id={`paint0_linear_logo_${idSuffix}`} x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#667eea"/>
            <stop offset="1" stopColor="#764ba2"/>
          </linearGradient>
          <linearGradient id={`paint1_linear_logo_${idSuffix}`} x1="24" y1="12" x2="24" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#667eea"/>
            <stop offset="1" stopColor="#764ba2"/>
          </linearGradient>
          <linearGradient id={`paint2_linear_logo_${idSuffix}`} x1="18" y1="24" x2="30" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#667eea"/>
            <stop offset="1" stopColor="#764ba2"/>
          </linearGradient>
        </defs>
      </motion.svg>
      <motion.span 
        className={`font-bold ${textSize} gradient-text`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        Eclésia App
      </motion.span>
    </motion.div>
  );
};

export default AnimatedLogo;