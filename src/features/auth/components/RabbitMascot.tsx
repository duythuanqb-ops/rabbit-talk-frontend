import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Props {
  className?: string;
}

export default function RabbitMascot({ className = '' }: Props) {
  return (
    <div className={`relative ${className}`}>
      <motion.div 
        className="w-full h-full flex items-center justify-center cursor-pointer"
        animate={{ 
          y: [0, -10, 0],
          scale: [1, 1.01, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4, 
          ease: "easeInOut" 
        }}
        whileHover={{ 
          scale: 1.05,
          rotate: [-2, 2, -2, 2, 0],
          transition: { duration: 0.5 }
        }}
        whileTap={{ 
          scale: 0.9,
          transition: { type: "spring", stiffness: 400, damping: 10 }
        }}
      >
        <Image
          src="/rabbit-mascot.png"
          alt="Ribbit Mascot"
          width={400}
          height={400}
          className="w-full h-full object-contain drop-shadow-2xl"
          priority
        />
      </motion.div>
    </div>
  );
}
