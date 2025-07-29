import React from "react";
import PropTypes from "prop-types";
import SidebarItem from "./SidebarItem";
import SidebarCategory from "./SidebarCategory";

/**
 * Componente para renderizar un grupo de elementos de menú con su categoría
 */
const SidebarMenu = ({ 
  items, 
  categoryTitle, 
  category,
  isCollapsed,
  isHovered,
  expandedMenus,
  toggleSubmenu,
  isActive,
  lastClickedMenu,
  onSubmenuItemSelect
}) => {
  const shouldExpand = !isCollapsed || isHovered;
  
  return (
    <>
      <SidebarCategory 
        title={categoryTitle} 
        isCollapsed={isCollapsed && !isHovered} 
      />
      <div className="w-full p-0 m-0" style={{ listStyle: 'none', width: '100%', padding: 0, margin: 0 }}>
        {items.map((item, index) => {
          const itemKey = `${category}_${index}`;
          const expanded = expandedMenus[itemKey];
          
          return (
            <SidebarItem
              key={itemKey}
              item={item}
              isActive={isActive(item.path)}
              isExpanded={expanded}
              isCollapsed={isCollapsed}
              shouldExpand={shouldExpand}
              toggleSubmenu={() => toggleSubmenu(itemKey, item)}
              checkIsActive={isActive}
              isLastClicked={lastClickedMenu === itemKey}
              onSubmenuItemSelect={() => onSubmenuItemSelect(itemKey)}
              menuId={itemKey}
            />
          );
        })}
      </div>
    </>
  );
};

SidebarMenu.propTypes = {
  items: PropTypes.array.isRequired,
  categoryTitle: PropTypes.string,
  category: PropTypes.string.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  isHovered: PropTypes.bool.isRequired,
  expandedMenus: PropTypes.object.isRequired,
  toggleSubmenu: PropTypes.func.isRequired,
  isActive: PropTypes.func.isRequired,
  lastClickedMenu: PropTypes.string,
  onSubmenuItemSelect: PropTypes.func.isRequired
};

export default React.memo(SidebarMenu); 