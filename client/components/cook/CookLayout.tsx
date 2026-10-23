// @ts-nocheck
import React from 'react';

const CookLayout = ({ children }: any) => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Cook Dashboard</h1>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default CookLayout;
