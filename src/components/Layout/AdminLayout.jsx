import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

const AdminLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors overflow-hidden">
      {/* Sidebar - Oculto en móvil, visible en escritorio */}
      <div className="hidden md:block relative">
        <Sidebar />
      </div>
      
      {/* Sidebar móvil - Solo visible cuando está abierto */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[1px]" 
            onClick={toggleMobileSidebar}
          ></div>
          <div className="absolute left-0 top-0 h-full z-10">
            <Sidebar />
          </div>
        </div>
      )}
      
      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header onMenuClick={toggleMobileSidebar} />
        
        {/* Área de contenido */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 py-3 px-6 transition-colors">
          <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            © {new Date().getFullYear()} AquanQ Admin. Todos los derechos reservados.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default React.memo(AdminLayout); 