'use client';

import { motion } from 'framer-motion';

/**
 * El componente Template en Next.js App Router se monta y desmonta cada vez que
 * navegamos entre rutas, a diferencia de Layout que se mantiene estático.
 * Esto lo hace ideal para animaciones de transición de página.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        duration: 5,
        ease: [0.16, 1, 0.3, 1] // Power 4 out para una desaceleración muy suave y elegante
      }}
      style={{ width: '100%', minHeight: '100vh', overflowX: 'hidden' }}
    >
      {children}
    </motion.div>
  );
}
