// @ts-nocheck
import { useState } from 'react';

export const useMobileMenu = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return {
    isMobileMenuOpen,
    setIsMobileMenuOpen
  };
};