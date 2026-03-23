'use client';

import { motion } from 'framer-motion';
import { Presentation } from 'lucide-react';

export const FullLogoLoader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ color: 'var(--accent)' }}
        >
          <Presentation size={120} strokeWidth={1.5} />
        </motion.div>

        {/* Ruedita de carga más pequeña y centrada en la pizarra */}
        <div style={{
          position: 'absolute',
          width: '30px',
          height: '30px',
          border: '5px solid rgba(255,255,255,0.05)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'loading-spin 0.8s linear infinite',
          zIndex: 10,
          marginTop: '-27px' // Movido un poco más arriba para estar en el centro del rectángulo de la pizarra
        }} />
      </div>


      <style>{`
        @keyframes loading-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};
