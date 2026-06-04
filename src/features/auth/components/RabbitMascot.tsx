import React from 'react';
import Image from 'next/image';

interface Props {
  className?: string;
}

export default function RabbitMascot({ className = '' }: Props) {
  return (
    <div className={`relative ${className}`}>
      <style>
        {`
          @keyframes gentle-float {
            0%, 100% {
              transform: translateY(0) scale(1);
            }p
            50% {
              transform: translateY(-8px) scale(1.02);
            }
          }
          .animate-gentle {
            animation: gentle-float 4s ease-in-out infinite;
            transform-origin: bottom center;
          }
        `}
      </style>
      <div className="animate-gentle w-full h-full flex items-center justify-center">
        <Image
          src="/rabbit-mascot.png"
          alt="Ribbit Mascot"
          width={400}
          height={400}
          className="w-full h-full object-contain drop-shadow-2xl"
          priority
        />
      </div>
    </div>
  );
}
