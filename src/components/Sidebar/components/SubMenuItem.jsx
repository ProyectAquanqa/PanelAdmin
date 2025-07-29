import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

/**
 * Componente optimizado para renderizar un elemento de submenú
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.item - Datos del elemento de submenú
 * @param {string} props.item.path - Ruta del elemento
 * @param {string} props.item.title - Título del elemento
 * @param {boolean} props.isActive - Si el elemento está activo
 * @param {function} props.onClick - Función a llamar cuando se hace clic en el elemento
 */
const SubMenuItem = ({ item, isActive, onClick = () => {} }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li className="w-full list-none p-0 m-0">
      <Link
        to={item.path}
        style={{ width: '100%', boxSizing: 'border-box', marginLeft: 0, marginRight: 0 }}
        className={`flex items-center h-12 text-[13px] w-full transition-colors whitespace-nowrap ${
          isActive 
            ? 'bg-[#225F76]/80 text-white' 
            : 'text-slate-50 hover:bg-[#225F76]/60'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onClick && onClick(item)}
      >
        {/* Contenedor de layout principal - con posición relativa para referencias absolutas */}
        <div className="relative w-full h-full">
          {/* Bullet point - SIEMPRE en la misma posición absoluta */}
          <div className="absolute" style={{ left: '3.75rem', top: '50%', transform: 'translateY(-50%)' }}>
            <div 
              className={`w-1 h-1 rounded-full transition-colors duration-150 ${
                isActive 
                  ? 'bg-sky-200' // Color cuando está activo
                  : isHovered 
                    ? 'bg-sky-200' // Color en hover
                    : 'bg-slate-50' // Color por defecto
              }`}
            ></div>
          </div>
          
          {/* Texto del submenú - asegurar que cabe en una línea */}
          <div className="absolute" style={{ left: '4.5rem', top: '50%', transform: 'translateY(-50%)', right: '10px' }}>
            <span className="truncate whitespace-nowrap block">{item.title}</span>
          </div>
        </div>
      </Link>
    </li>
  );
};

SubMenuItem.propTypes = {
  item: PropTypes.shape({
    path: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func
};

export default React.memo(SubMenuItem); 