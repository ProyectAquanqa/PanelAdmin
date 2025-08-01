import React from "react";
import PropTypes from "prop-types";
import { HomeIcon } from "@heroicons/react/24/outline";

/**
 * Componente para renderizar el ícono del menú,
 * aplicando estilos según el estado de actividad o hover
 * @param {Object} props - Propiedades del componente
 * @param {React.ComponentType} props.icon - El componente de ícono a renderizar
 * @param {boolean} props.isActive - True si el ícono está activo
 * @param {boolean} props.isHovered - True si el mouse está sobre el ícono
 */
const MenuIcon = ({ icon, isActive = false, isHovered = false }) => {
  const iconClasses = `w-5 h-5 transition-colors duration-200 ${
    isActive ? "text-white" : isHovered ? "text-white" : "text-slate-300"
  }`;

  // Si no hay ícono, usar HomeIcon como fallback
  const IconComponent = icon || HomeIcon;

  // Renderizar el componente de ícono
  return <IconComponent className={iconClasses} />;
};

MenuIcon.propTypes = {
  icon: PropTypes.elementType,
  isActive: PropTypes.bool,
  isHovered: PropTypes.bool,
};

export default React.memo(MenuIcon);
