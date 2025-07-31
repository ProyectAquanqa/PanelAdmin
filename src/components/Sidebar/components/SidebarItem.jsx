import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import MenuIcon from "./MenuIcon";
import SubMenuItem from "./SubMenuItem";

/**
 * Componente para renderizar un elemento del menú principal
 */
const SidebarItem = ({ 
  item, 
  isActive, 
  isExpanded = false, 
  isCollapsed, 
  shouldExpand, 
  toggleSubmenu,
  checkIsActive,
  isLastClicked = false,
  onSubmenuItemSelect = () => {},
  menuId
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Verificar si algún submódulo está activo para resaltar el módulo padre
  const hasActiveSubmenu = item.submenu ? 
    item.submenu.some(subItem => checkIsActive(subItem.path)) : 
    false;
  
  // El módulo está activo si está directamente activo, si algún submódulo está activo, o si fue el último en recibir clic
  const isActiveOrHasActiveSubmenu = isActive || hasActiveSubmenu || isLastClicked;
  
  // Si tiene un submódulo activo o es el último en recibir clic, mantener el estado visual activo
  const isVisuallyActive = isActiveOrHasActiveSubmenu;
  
  // Manejador para la selección de un ítem de submenú
  const handleSubmenuItemClick = (subItem) => {
    // Notificar al componente padre que se seleccionó un ítem de este submenú
    onSubmenuItemSelect();
  };
  
  return (
    <li className="w-full list-none p-0 m-0 overflow-hidden">
      <div className="relative w-full p-0 m-0">
        {/* Elemento principal del menú */}
        <Link
          to={item.submenu ? '#' : item.path}
          style={{ width: '100%', boxSizing: 'border-box', marginLeft: 0, marginRight: 0 }}
          className={`flex items-center h-12 text-[13px] w-full transition-all duration-150 ${
            isVisuallyActive
              ? 'bg-[#225F76]/80 text-white' 
              : 'text-slate-50 hover:bg-[#225F76]/60'
          }`}
          onClick={(e) => {
            if (item.submenu) {
              e.preventDefault();
              toggleSubmenu();
            } else {
              // Si no tiene submenú, notificar que se seleccionó este ítem
              onSubmenuItemSelect();
            }
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Contenedor de layout principal - con posición relativa para referencias absolutas */}
          <div className="relative w-full h-full">
            {/* Icono del menú - SIEMPRE en la misma posición absoluta */}
            <div className="absolute flex items-center justify-center w-20 h-full">
              <MenuIcon 
                icon={item.icon} 
                isActive={isVisuallyActive}
                isHovered={isHovered}
              />
            </div>
            
            {/* Título del menú - más cerca del icono */}
            <div 
              className={`absolute transition-all duration-300 ease-out whitespace-nowrap font-medium ${
                shouldExpand ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
              }`}
              style={{ left: '68px', top: '50%', transform: 'translateY(-50%)' }}
            >
              {item.title}
            </div>
            
            {/* Icono de flecha - solo visible cuando expandido */}
            {item.submenu && shouldExpand && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <ChevronRightIcon
                  className={`w-4 h-4 transition-all duration-300 ease-out text-slate-200 ${
                    isExpanded ? 'rotate-90 text-white' : ''
                  }`}
                />
              </div>
            )}
          </div>
        </Link>

        {/* Submenú - con animación suave de entrada */}
        {shouldExpand && item.submenu && (
          <div className={`overflow-hidden transition-all duration-300 ease-out ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <ul className="w-full border-l-0 space-y-0 p-0 m-0">
              {item.submenu.map((subItem, subIndex) => (
                <SubMenuItem 
                  key={subIndex}
                  item={subItem}
                  isActive={checkIsActive(subItem.path)}
                  onClick={() => handleSubmenuItemClick(subItem)}
                  parentMenuId={menuId}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  );
};

SidebarItem.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    icon: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.func,
      PropTypes.elementType
    ]).isRequired,
    path: PropTypes.string.isRequired,
    submenu: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired
    }))
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  isExpanded: PropTypes.bool,
  isCollapsed: PropTypes.bool.isRequired,
  shouldExpand: PropTypes.bool.isRequired,
  toggleSubmenu: PropTypes.func.isRequired,
  checkIsActive: PropTypes.func.isRequired,
  isLastClicked: PropTypes.bool,
  onSubmenuItemSelect: PropTypes.func,
  menuId: PropTypes.string
};

export default React.memo(SidebarItem); 