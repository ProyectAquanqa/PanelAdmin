import React from "react";
import PropTypes from "prop-types";

/**
 * Componente para las categorías del sidebar con separación visual
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título de la categoría
 * @param {boolean} props.isCollapsed - Si el sidebar está colapsado
 */
const SidebarCategory = ({ title, isCollapsed }) => {
  return (
    <div className="h-12 flex items-center relative">
      {/* Contenedor para mantener posición consistente */}
      <div className="w-full flex items-center relative">
        {/* Título de categoría - alineado con el punto indicado */}
        <div 
          className={`absolute transition-opacity duration-100 ${
            isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'
          }`}
          style={{ left: '30px', top: '50%', transform: 'translateY(-50%)' }}
        >
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-50/90">
            {title}
          </h3>
        </div>
        
        {/* Separador solo visible cuando está contraído - estilo más sutil */}
        <div className={`absolute left-0 right-0 flex justify-center items-center transition-opacity duration-100 ${
          isCollapsed ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
          <div className="w-6 h-px rounded-full bg-white/30"></div>
        </div>
      </div>
    </div>
  );
};

SidebarCategory.propTypes = {
  title: PropTypes.string.isRequired,
  isCollapsed: PropTypes.bool.isRequired
};

export default React.memo(SidebarCategory); 