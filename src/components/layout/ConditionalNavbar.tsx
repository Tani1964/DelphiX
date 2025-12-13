'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export function ConditionalNavbar() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const isAdminPage = pathname?.startsWith('/admin');
  
  if (isAuthPage || isAdminPage) {
    return null;
  }
  
  return <Navbar />;
}

