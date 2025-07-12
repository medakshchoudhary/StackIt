import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
