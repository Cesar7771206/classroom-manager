'use client';

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { FullLogoLoader } from './FullLogoLoader';

const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: (val: boolean) => {},
});

export const useNavigationLoader = () => useContext(LoadingContext);

function LoadingHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setIsLoading } = useNavigationLoader();

  useEffect(() => {
    // Cuando la ruta o los parámetros cambian, dejamos de mostrar el loader
    setIsLoading(false);
  }, [pathname, searchParams, setIsLoading]);

  useEffect(() => {
    // Interceptar clics en enlaces internos para mostrar el loader inmediatamente
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (
        anchor &&
        anchor.href &&
        anchor.target !== '_blank' &&
        !anchor.href.startsWith('mailto:') &&
        !anchor.href.startsWith('tel:') &&
        !anchor.href.startsWith('sms:') &&
        !anchor.href.startsWith('#')
      ) {
        const url = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);

        // Si es el mismo host pero diferente path/search, mostramos el loader
        if (url.host === currentUrl.host) {
          if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
            setIsLoading(true);
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, [setIsLoading]);

  return null;
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      <Suspense fallback={null}>
        <LoadingHandler />
      </Suspense>
      <AnimatePresence>
        {isLoading && <FullLogoLoader />}
      </AnimatePresence>
      {children}
    </LoadingContext.Provider>
  );
}
