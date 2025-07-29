import React from "react";
import PropTypes from "prop-types";
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/outline";

/**
 * Componente para el encabezado del sidebar
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isCollapsed - Estado de colapso del sidebar
 * @param {boolean} props.shouldExpand - Determina si el sidebar debe mostrarse expandido (por hover o estado)
 * @param {Function} props.toggleSidebar - Función para alternar el estado de colapso
 */
const SidebarHeader = ({ isCollapsed, shouldExpand, toggleSidebar }) => {
  return (
    <div className="relative border-b border-[#3D92AF]/30">
      {/* Contenedor principal con altura fija para evitar saltos */}
      <div className="h-16 flex items-center">
        {/* Logo - solo visible cuando está expandido */}
        <div className={`flex items-center transition-all duration-200 px-4 ${shouldExpand ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
            <span className="text-[#2D728F] font-bold text-lg">A</span>
          </div>
          <span className="ml-2 font-medium text-base tracking-wide">
            Panel AquanQ
          </span>
        </div>
        
        {/* Botón de toggle - ahora sin fondo rectangular y con ícono más sutil */}
        <button
          onClick={toggleSidebar}
          className={`p-2 transition-all duration-300 absolute ${
            shouldExpand 
              ? 'right-4' 
              : 'left-1/2 transform -translate-x-1/2'
          } focus:outline-none`}
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          title={isCollapsed ? "Expandir menú" : "Contraer menú"}
        >
          {isCollapsed ? (
            <ChevronDoubleRightIcon className="w-5 h-5 text-white/70 transition-colors hover:text-cyan-300" />
          ) : (
            <ChevronDoubleLeftIcon className="w-5 h-5 text-white/70 transition-colors hover:text-cyan-300" />
          )}
        </button>
      </div>
    </div>
  );
};

SidebarHeader.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  shouldExpand: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired
};

export default React.memo(SidebarHeader); 