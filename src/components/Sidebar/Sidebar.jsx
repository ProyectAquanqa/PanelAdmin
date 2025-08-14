/**
 * Componente Sidebar refactorizado
 * Usa hooks especializados y configuración externa
 */

import React, { useMemo, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

// Importar hooks especializados
import { useSidebar } from '../../hooks/useSidebar';
import { useSidebarMenu } from '../../hooks/useSidebarMenu';
import { useMenuPermissions } from '../../hooks/useMenuPermissions';

// Importar configuración de menús
import { menuCategories } from '../../config/menuConfig';

// Debug utils (solo en desarrollo)
// import { debugUserPermissions } from '../../utils/permissionDebugUtils';

// Importar componentes modulares
import { 
  SidebarHeader,
  SidebarMenu,
  SidebarItem
} from "./components";

/**
 * Componente principal de la barra lateral refactorizado
 */
const Sidebar = () => {
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);

  // Usar hooks especializados para manejar estado del sidebar
  const {
    isCollapsed,
    isHovered,
    shouldExpand,
    toggleSidebar,
    setupHoverEvents
  } = useSidebar({ defaultCollapsed: true });

  // Configurar eventos de hover para el contenido del sidebar (no para el header)
  useEffect(() => {
    const cleanup = setupHoverEvents(contentRef);
    return cleanup;
  }, [setupHoverEvents]);

  const {
    expandedMenus,
    lastClickedMenu,
    checkIsActive: isActive,
    toggleSubmenu,
    handleSubmenuItemSelect
  } = useSidebarMenu();

  // Hook de permisos para filtrar menú
  const { filterMenuByPermissions, isRestrictedUser } = useMenuPermissions();

  // Obtener configuración de menús desde menuCategories y filtrar por permisos
  const allMenuItems = menuCategories.find(cat => cat.id === 'main')?.items || [];
  const allEventosItems = menuCategories.find(cat => cat.id === 'eventos')?.items || [];
  const allChatbotItems = menuCategories.find(cat => cat.id === 'chatbot')?.items || [];
  const allUserNotificationItems = menuCategories.find(cat => cat.id === 'users')?.items || [];
  const allSettingsItems = menuCategories.find(cat => cat.id === 'settings')?.items || [];

  // Filtrar elementos del menú basado en permisos del usuario
  const menuItems = useMemo(() => filterMenuByPermissions(allMenuItems), [filterMenuByPermissions, allMenuItems]);
  const eventosItems = useMemo(() => filterMenuByPermissions(allEventosItems), [filterMenuByPermissions, allEventosItems]);
  const chatbotItems = useMemo(() => filterMenuByPermissions(allChatbotItems), [filterMenuByPermissions, allChatbotItems]);
  const userNotificationItems = useMemo(() => filterMenuByPermissions(allUserNotificationItems), [filterMenuByPermissions, allUserNotificationItems]);
  const settingsItems = useMemo(() => filterMenuByPermissions(allSettingsItems), [filterMenuByPermissions, allSettingsItems]);

  // Función auxiliar para obtener el objeto de menú por su ID
  const getItemByMenuId = useCallback((menuId) => {
    if (menuId?.startsWith('main_')) {
      const index = parseInt(menuId.replace('main_', ''));
      return menuItems[index];
    } else if (menuId?.startsWith('eventos_')) {
      const index = parseInt(menuId.replace('eventos_', ''));
      return eventosItems[index];
    } else if (menuId?.startsWith('chatbot_')) {
      const index = parseInt(menuId.replace('chatbot_', ''));
      return chatbotItems[index];
    } else if (menuId?.startsWith('users_')) {
      const index = parseInt(menuId.replace('users_', ''));
      return userNotificationItems[index];
    } else if (menuId?.startsWith('settings_')) {
      const index = parseInt(menuId.replace('settings_', ''));
      return settingsItems[index];
    }
    return null;
  }, [menuItems, eventosItems, chatbotItems, userNotificationItems, settingsItems]);

  // Variantes de animación para el sidebar
  const sidebarVariants = {
    expanded: { width: '16rem' },
    collapsed: { width: '5rem' }
  };

  // Configuración de la transición para hacerla más suave y fluida
  const transitionConfig = {
    duration: 0.3,   // Duración más larga para suavidad
    ease: [0.25, 0.46, 0.45, 0.94], // Easing más suave y natural
    type: "tween"    // Usar tween para transiciones más fluidas
  };

  // Memoizar los componentes SidebarMenu para evitar rerenderizados innecesarios
  // Solo mostrar secciones que tengan elementos visibles para el usuario
  const renderMenuSections = useMemo(() => (
    <>
      {/* Solo mostrar Eventos si hay items y el usuario no está restringido */}
      {eventosItems.length > 0 && (
        <SidebarMenu 
          items={eventosItems}
          categoryTitle="CONTENIDO"
          category="eventos"
          isCollapsed={isCollapsed}
          isHovered={isHovered}
          expandedMenus={expandedMenus}
          toggleSubmenu={toggleSubmenu}
          isActive={isActive}
          lastClickedMenu={lastClickedMenu}
          onSubmenuItemSelect={handleSubmenuItemSelect}
        />
      )}

      {/* Solo mostrar Chatbot si hay items y el usuario no está restringido */}
      {chatbotItems.length > 0 && (
        <SidebarMenu 
          items={chatbotItems}
          categoryTitle="INTERACCIÓN"
          category="chatbot"
          isCollapsed={isCollapsed}
          isHovered={isHovered}
          expandedMenus={expandedMenus}
          toggleSubmenu={toggleSubmenu}
          isActive={isActive}
          lastClickedMenu={lastClickedMenu}
          onSubmenuItemSelect={handleSubmenuItemSelect}
        />
      )}

      {/* Solo mostrar Usuarios si hay items y el usuario no está restringido */}
      {userNotificationItems.length > 0 && (
        <SidebarMenu 
          items={userNotificationItems}
          categoryTitle="USUARIOS"
          category="users"
          isCollapsed={isCollapsed}
          isHovered={isHovered}
          expandedMenus={expandedMenus}
          toggleSubmenu={toggleSubmenu}
          isActive={isActive}
          lastClickedMenu={lastClickedMenu}
          onSubmenuItemSelect={handleSubmenuItemSelect}
        />
      )}

      {/* Solo mostrar Configuración si hay items y el usuario no está restringido */}
      {settingsItems.length > 0 && !isRestrictedUser && (
        <SidebarMenu 
          items={settingsItems}
          categoryTitle="CONFIGURACIÓN"
          category="settings"
          isCollapsed={isCollapsed}
          isHovered={isHovered}
          expandedMenus={expandedMenus}
          toggleSubmenu={toggleSubmenu}
          isActive={isActive}
          lastClickedMenu={lastClickedMenu}
          onSubmenuItemSelect={handleSubmenuItemSelect}
        />
      )}
    </>
  ), [eventosItems, chatbotItems, userNotificationItems, settingsItems, isRestrictedUser,
      isCollapsed, isHovered, expandedMenus, toggleSubmenu, isActive, lastClickedMenu, handleSubmenuItemSelect]);

  return (
    <motion.div 
      ref={sidebarRef}
      className="h-screen bg-[#2D728F] text-white flex flex-col shadow-xl z-20 sidebar-container"
      initial={false}
      animate={shouldExpand ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
      transition={transitionConfig}
    >
      {/* Header con logo y botón de colapso - SIN hover para expandir */}
      <SidebarHeader 
        isCollapsed={isCollapsed}
        shouldExpand={shouldExpand}
        toggleSidebar={toggleSidebar}
      />

      {/* Menú principal - CON hover para expandir (contentRef) */}
      <SimpleBar 
        ref={contentRef} 
        className="flex-1 sidebar-content" 
        style={{ height: 'calc(100vh - 4rem)' }}
        autoHide={false}
      >
        {/* Dashboard */}
        <ul className="w-full p-0 m-0 pt-1">
          {menuItems.map((item, index) => (
            <SidebarItem
              key={`main_${index}`}
              item={item}
              isActive={isActive(item.path)}
              isExpanded={expandedMenus[`main_${index}`]}
              isCollapsed={isCollapsed}
              shouldExpand={shouldExpand}
              toggleSubmenu={() => toggleSubmenu(`main_${index}`, item)}
              checkIsActive={isActive}
              isLastClicked={lastClickedMenu === `main_${index}`}
              onSubmenuItemSelect={() => handleSubmenuItemSelect(`main_${index}`)}
              menuId={`main_${index}`}
            />
          ))}
        </ul>

        {/* Secciones de menú con categorías - memoizadas para evitar rerenderizados */}
        {renderMenuSections}
      </SimpleBar>
    </motion.div>
  );
};

// Exportar como componente memorizado para evitar rerenderizados innecesarios
export default React.memo(Sidebar); 