import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

