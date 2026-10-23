// @ts-nocheck
import React from 'react';
import Logo from '@/components/brand/Logo';

const CookLayout = ({ children }: any) => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-blue-600 text-white p-4">
        <div className="flex items-center gap-3">
          <Logo
            href="/cook"
            size="sm"
            wordmarkClassName="text-xl font-bold text-white tracking-tight"
          />
          <span className="text-white/80 text-sm font-medium">Kitchen</span>
        </div>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default CookLayout;
