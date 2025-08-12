/**
 * Formulario para crear/editar perfiles (grupos de Django)
 * Rediseñado para seguir la estructura exacta del backend Django
 */

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import groupService from '../../services/groupService';
import { toast } from 'react-hot-toast';

const ProfileFormNew = ({ 
  mode = 'create', 
  editingProfile = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    permissions: []
  });
  
  const [errors, setErrors] = useState({});
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [expandedApps, setExpandedApps] = useState({});

  // Cargar permisos disponibles al montar el componente
  useEffect(() => {
    loadAvailablePermissions();
  }, []);

  // Inicializar formulario cuando hay un perfil para editar
  useEffect(() => {
    if (editingProfile && mode === 'edit') {
      setFormData({
        name: editingProfile.name || '',
        permissions: editingProfile.permissions?.map(p => p.id) || []
      });
    }
  }, [editingProfile, mode]);

  const loadAvailablePermissions = async () => {
    try {
      setLoadingPermissions(true);
      
      const response = await groupService.getAvailablePermissions();

      if (response.status === 'success' && response.data?.permissions_by_app) {
        setAvailablePermissions(response.data.permissions_by_app);
        
        // Expandir SOLO módulos por defecto - submódulos visibles, permisos ocultos
        const allExpanded = {
          // Solo módulos principales
          'Eventos': true,
          'Chatbot': true,
          'Usuarios': true,
          'Notificaciones': true,
          'Documentación': true,
          'Configuración': true,
          'Permisos': true
          // NOTA: Submódulos y permisos específicos NO están aquí
          // Los submódulos se ven pero sus permisos están cerrados
        };
        setExpandedApps(allExpanded);
      }
    } catch (error) {
      console.error('Error cargando permisos:', error);
      toast.error('Error al cargar permisos');
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Manejar cambios en el nombre
  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, name: value }));
    
    // Validación en tiempo real
    if (errors.name && value.trim().length >= 3) {
      setErrors(prev => ({ ...prev, name: null }));
    }
  };

  // Toggle de permisos individuales
  const togglePermission = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // Toggle de expansión de aplicaciones/módulos
  const toggleAppExpanded = (appKey) => {
    setExpandedApps(prev => ({
      ...prev,
      [appKey]: !prev[appKey]
    }));
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del perfil es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores del formulario');
      return;
    }

    const dataToSubmit = {
      name: formData.name.trim(),
      permissions: formData.permissions
    };

    onSubmit(dataToSubmit);
  };

  // Función para traducir permisos técnicos a español comprensible
  const translatePermissionToSpanish = (permission) => {
    const translations = {
      // Eventos
      'add_evento': 'Crear eventos',
      'change_evento': 'Editar eventos',
      'delete_evento': 'Eliminar eventos',
      'view_evento': 'Ver eventos',
      'add_categoria': 'Crear categorías de eventos',
      'change_categoria': 'Editar categorías de eventos',
      'delete_categoria': 'Eliminar categorías de eventos',
      'view_categoria': 'Ver categorías de eventos',
      
      // Chatbot
      'add_chatbotknowledgebase': 'Crear conocimiento del chatbot',
      'change_chatbotknowledgebase': 'Editar conocimiento del chatbot',
      'delete_chatbotknowledgebase': 'Eliminar conocimiento del chatbot',
      'view_chatbotknowledgebase': 'Ver base de conocimiento',
      'add_chatbotcategory': 'Crear categorías del chatbot',
      'change_chatbotcategory': 'Editar categorías del chatbot',
      'delete_chatbotcategory': 'Eliminar categorías del chatbot',
      'view_chatbotcategory': 'Ver categorías del chatbot',
      'add_chatconversation': 'Crear conversaciones',
      'change_chatconversation': 'Editar conversaciones',
      'delete_chatconversation': 'Eliminar conversaciones',
      'view_chatconversation': 'Ver historial de conversaciones',
      
      // Usuarios
      'add_user': 'Crear usuarios',
      'change_user': 'Editar usuarios',
      'delete_user': 'Eliminar usuarios',
      'view_user': 'Ver usuarios',
      'add_group': 'Crear perfiles de usuario',
      'change_group': 'Editar perfiles de usuario',
      'delete_group': 'Eliminar perfiles de usuario',
      'view_group': 'Ver perfiles de usuario',
      
      // Notificaciones
      'add_notificacion': 'Crear notificaciones',
      'change_notificacion': 'Editar notificaciones',
      'delete_notificacion': 'Eliminar notificaciones',
      'view_notificacion': 'Ver historial de notificaciones',
      'add_devicetoken': 'Registrar dispositivos',
      'change_devicetoken': 'Editar dispositivos',
      'delete_devicetoken': 'Eliminar dispositivos',
      'view_devicetoken': 'Ver dispositivos registrados',
      
      // Configuración y permisos
      'add_permission': 'Crear permisos',
      'change_permission': 'Editar permisos',
      'delete_permission': 'Eliminar permisos',
      'view_permission': 'Ver gestión de permisos'
    };
    
    return translations[permission.codename] || permission.name;
  };

  // Estructura basada en tus módulos reales del menuConfig.js
  const getModuleStructure = () => {
    return {
      'Eventos': {
        title: 'Eventos',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h6l2 2h6a2 2 0 012 2v4m-6 12H6a2 2 0 01-2-2v-7h16v7a2 2 0 01-2 2z" />
          </svg>
        ),
        submodules: [
          { id: 'eventos_gestion', name: 'Gestión de Eventos' },
          { id: 'eventos_categorias', name: 'Categorías' }
        ]
      },
      'Chatbot': {
        title: 'Chatbot',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ),
        submodules: [
          { id: 'chatbot_knowledge', name: 'Base de Conocimiento' },
          { id: 'chatbot_categories', name: 'Categorías' },
          { id: 'chatbot_conversations', name: 'Historial de Conversaciones' }
        ]
      },
      'Usuarios': {
        title: 'Usuarios',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        ),
        submodules: [
          { id: 'usuarios_gestion', name: 'Gestión de Usuarios' },
          { id: 'usuarios_perfiles', name: 'Perfiles' }
        ]
      },
      'Notificaciones': {
        title: 'Notificaciones',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.05 11a8 8 0 1115.9 0c0 .44-.31.8-.69.8H4.74c-.38 0-.69-.36-.69-.8z" />
          </svg>
        ),
        submodules: [
          { id: 'notificaciones_historial', name: 'Historial de Notificaciones' },
          { id: 'notificaciones_dispositivos', name: 'Dispositivos Registrados' }
        ]
      },
      'Documentación': {
        title: 'Documentación',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        submodules: [
          { id: 'documentacion_general', name: 'Documentación General' }
        ]
      },
      'Configuración': {
        title: 'Configuración',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        submodules: [
          { id: 'configuracion_general', name: 'General' },
          { id: 'configuracion_api', name: 'API' }
        ]
      },
      'Permisos': {
        title: 'Permisos',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.012-3a7.5 7.5 0 11-9.775 9.775A7.5 7.5 0 0115.012 9z" />
          </svg>
        ),
        submodules: [
          { id: 'permisos_gestion', name: 'Gestión de Permisos' }
        ]
      }
    };
  };

  // Función granular para obtener permisos específicos por submódulo  
  const getPermissionsForSubmodule = (submoduleId) => {
    // Debug: Log para verificar permisos disponibles
    if (submoduleId === 'usuarios_gestion') {
      console.log('🔍 Debugging usuarios_gestion:');
      console.log('Available permissions:', availablePermissions);
      if (availablePermissions.users) {
        console.log('Users app permissions:', availablePermissions.users);
      }
    }
    const permissionMap = {
      // Eventos
      'eventos_gestion': {
        name: 'Gestión de Eventos',
        actions: [
          { action: 'view', label: 'Ver eventos', codename: 'view_evento' },
          { action: 'add', label: 'Crear eventos', codename: 'add_evento' },
          { action: 'change', label: 'Editar eventos', codename: 'change_evento' },
          { action: 'delete', label: 'Eliminar eventos', codename: 'delete_evento' }
        ]
      },
      'eventos_categorias': {
        name: 'Categorías de Eventos',
        actions: [
          { action: 'view', label: 'Ver categorías', codename: 'view_categoria' },
          { action: 'add', label: 'Crear categorías', codename: 'add_categoria' },
          { action: 'change', label: 'Editar categorías', codename: 'change_categoria' },
          { action: 'delete', label: 'Eliminar categorías', codename: 'delete_categoria' }
        ]
      },
      
      // Chatbot
      'chatbot_knowledge': {
        name: 'Base de Conocimiento',
        actions: [
          { action: 'view', label: 'Ver conocimiento', codename: 'view_chatbotknowledgebase' },
          { action: 'add', label: 'Crear conocimiento', codename: 'add_chatbotknowledgebase' },
          { action: 'change', label: 'Editar conocimiento', codename: 'change_chatbotknowledgebase' },
          { action: 'delete', label: 'Eliminar conocimiento', codename: 'delete_chatbotknowledgebase' }
        ]
      },
      'chatbot_categories': {
        name: 'Categorías del Chatbot',
        actions: [
          { action: 'view', label: 'Ver categorías', codename: 'view_chatbotcategory' },
          { action: 'add', label: 'Crear categorías', codename: 'add_chatbotcategory' },
          { action: 'change', label: 'Editar categorías', codename: 'change_chatbotcategory' },
          { action: 'delete', label: 'Eliminar categorías', codename: 'delete_chatbotcategory' }
        ]
      },
      'chatbot_conversations': {
        name: 'Historial de Conversaciones',
        actions: [
          { action: 'view', label: 'Ver conversaciones', codename: 'view_chatconversation' },
          { action: 'add', label: 'Crear conversaciones', codename: 'add_chatconversation' },
          { action: 'change', label: 'Moderar conversaciones', codename: 'change_chatconversation' },
          { action: 'delete', label: 'Eliminar conversaciones', codename: 'delete_chatconversation' }
        ]
      },
      
      // Usuarios
      'usuarios_gestion': {
        name: 'Gestión de Usuarios',
        actions: [
          { action: 'view', label: 'Ver usuarios', codename: 'view_usuario' },
          { action: 'add', label: 'Crear usuarios', codename: 'add_usuario' },
          { action: 'change', label: 'Editar usuarios', codename: 'change_usuario' },
          { action: 'delete', label: 'Eliminar usuarios', codename: 'delete_usuario' }
        ]
      },
      'usuarios_perfiles': {
        name: 'Perfiles de Usuario',
        actions: [
          { action: 'view', label: 'Ver perfiles', codename: 'view_group' },
          { action: 'add', label: 'Crear perfiles', codename: 'add_group' },
          { action: 'change', label: 'Editar perfiles', codename: 'change_group' },
          { action: 'delete', label: 'Eliminar perfiles', codename: 'delete_group' }
        ]
      },
      
      // Notificaciones
      'notificaciones_historial': {
        name: 'Historial de Notificaciones',
        actions: [
          { action: 'view', label: 'Ver notificaciones', codename: 'view_notificacion' },
          { action: 'add', label: 'Enviar notificaciones', codename: 'add_notificacion' },
          { action: 'change', label: 'Editar notificaciones', codename: 'change_notificacion' },
          { action: 'delete', label: 'Eliminar notificaciones', codename: 'delete_notificacion' }
        ]
      },
      'notificaciones_dispositivos': {
        name: 'Dispositivos Registrados',
        actions: [
          { action: 'view', label: 'Ver dispositivos', codename: 'view_devicetoken' },
          { action: 'add', label: 'Registrar dispositivos', codename: 'add_devicetoken' },
          { action: 'change', label: 'Editar dispositivos', codename: 'change_devicetoken' },
          { action: 'delete', label: 'Eliminar dispositivos', codename: 'delete_devicetoken' }
        ]
      },
      
      // Documentación
      'documentacion_general': {
        name: 'Documentación',
        actions: [
          { action: 'view', label: 'Ver documentación', codename: 'view_permission' }
        ]
      },
      
      // Configuración
      'configuracion_general': {
        name: 'Configuración General',
        actions: [
          { action: 'view', label: 'Ver configuración', codename: 'view_permission' },
          { action: 'change', label: 'Editar configuración', codename: 'change_permission' }
        ]
      },
      'configuracion_api': {
        name: 'Configuración API',
        actions: [
          { action: 'view', label: 'Ver configuración API', codename: 'view_permission' },
          { action: 'change', label: 'Editar configuración API', codename: 'change_permission' }
        ]
      },
      
      // Permisos
      'permisos_gestion': {
        name: 'Gestión de Permisos',
        actions: [
          { action: 'view', label: 'Ver permisos', codename: 'view_permission' },
          { action: 'add', label: 'Crear permisos', codename: 'add_permission' },
          { action: 'change', label: 'Editar permisos', codename: 'change_permission' },
          { action: 'delete', label: 'Eliminar permisos', codename: 'delete_permission' }
        ]
      }
    };

    const submoduleConfig = permissionMap[submoduleId];
    if (!submoduleConfig) return [];

    const permissions = [];
    
    // Buscar en los permisos disponibles del backend y mapear con las acciones específicas
    submoduleConfig.actions.forEach(actionConfig => {
      Object.entries(availablePermissions).forEach(([appKey, appModels]) => {
        Object.values(appModels).forEach(modelPerms => {
          modelPerms.forEach(perm => {
            if (perm.codename === actionConfig.codename) {
              permissions.push({
                ...perm,
                translatedName: actionConfig.label,
                action: actionConfig.action,
                submoduleName: submoduleConfig.name
              });
            }
          });
        });
      });
    });

    return permissions;
  };

  const getSubmodulePermissionStatus = (submoduleId) => {
    const permissions = getPermissionsForSubmodule(submoduleId);
    if (!permissions || permissions.length === 0) return 'none';
    
    const selectedCount = permissions.filter(p => formData.permissions.includes(p.id)).length;
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === permissions.length) return 'all';
    return 'some';
  };

  // Función para obtener el estado de permisos de un módulo completo
  const getModulePermissionStatus = (moduleKey) => {
    const moduleStructure = getModuleStructure();
    const module = moduleStructure[moduleKey];
    if (!module) return 'none';
    
    let totalPermissions = 0;
    let selectedPermissions = 0;
    
    module.submodules.forEach(submodule => {
      const permissions = getPermissionsForSubmodule(submodule.id);
      totalPermissions += permissions.length;
      selectedPermissions += permissions.filter(p => formData.permissions.includes(p.id)).length;
    });
    
    if (totalPermissions === 0) return 'none';
    if (selectedPermissions === 0) return 'none';
    if (selectedPermissions === totalPermissions) return 'all';
    return 'some';
  };

  // Función para seleccionar/deseleccionar todos los permisos de un módulo
  const toggleModulePermissions = (moduleKey, checked) => {
    const moduleStructure = getModuleStructure();
    const module = moduleStructure[moduleKey];
    if (!module) return;
    
    const allModulePermissionIds = [];
    module.submodules.forEach(submodule => {
      const permissions = getPermissionsForSubmodule(submodule.id);
      permissions.forEach(permission => {
        allModulePermissionIds.push(permission.id);
      });
    });
    
    if (checked) {
      // Agregar todos los permisos del módulo
      const newPermissions = [...new Set([...formData.permissions, ...allModulePermissionIds])];
      setFormData(prev => ({ ...prev, permissions: newPermissions }));
    } else {
      // Quitar todos los permisos del módulo
      const newPermissions = formData.permissions.filter(id => !allModulePermissionIds.includes(id));
      setFormData(prev => ({ ...prev, permissions: newPermissions }));
    }
  };

  const toggleSubmodulePermissions = (submoduleId, isChecked) => {
    const permissions = getPermissionsForSubmodule(submoduleId);
    const permissionIds = permissions.map(p => p.id);
    
    setFormData(prev => ({
      ...prev,
      permissions: isChecked
        ? [...new Set([...prev.permissions, ...permissionIds])]
        : prev.permissions.filter(id => !permissionIds.includes(id))
    }));
  };

    const renderModuleStructure = () => {
    const moduleStructure = getModuleStructure();
    
    if (Object.keys(moduleStructure).length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center p-4">
            <p className="text-[13px]">No hay módulos disponibles</p>
            <p className="text-[11px] text-gray-400">Cargando estructura de permisos...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {Object.entries(moduleStructure).map(([moduleKey, module]) => {
          const moduleStatus = getModulePermissionStatus(moduleKey);

          return (
            <div key={moduleKey}>
              {/* Módulo Principal - MINIMALISTA */}
              <div className="flex items-center py-2 hover:bg-gray-50 transition-colors">
                  <button
                    type="button"
                  onClick={() => toggleAppExpanded(moduleKey)}
                  className="w-4 h-4 flex items-center justify-center mr-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                    className={`w-3 h-3 transform transition-transform duration-200 ${
                      expandedApps[moduleKey] ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                
                  <input
                    type="checkbox"
                  checked={moduleStatus === 'all'}
                    ref={input => {
                    if (input) input.indeterminate = moduleStatus === 'some';
                  }}
                  onChange={(e) => toggleModulePermissions(moduleKey, e.target.checked)}
                  className="h-4 w-4 text-[#2D728F] rounded border-gray-300 focus:ring-[#2D728F]/20 focus:border-[#2D728F] mr-3 transition-colors"
                  disabled={isViewMode}
                />
                
                                                                <div className="flex items-center justify-between flex-1">
                  <span className="text-[13px] font-semibold text-gray-800">
                    {module.title}
                  </span>
                  <span className="text-[13px] text-gray-500 mr-4">
                    {module.submodules.length} submódulos
                  </span>
                </div>
              </div>

              {/* Submódulos con línea vertical sutil */}
              {expandedApps[moduleKey] && (
                <div className="ml-6 border-l border-gray-300 pl-6 space-y-1">
                  {module.submodules.map((submodule) => {
                    const permissionStatus = getSubmodulePermissionStatus(submodule.id);
                    const permissions = getPermissionsForSubmodule(submodule.id);

                    return (
                      <div key={submodule.id}>
                        {/* Submódulo */}
                        <div className="flex items-center py-1 hover:bg-gray-50 transition-colors">
                          <button
                            type="button"
                            onClick={() => toggleAppExpanded(submodule.id)}
                            className="w-4 h-4 flex items-center justify-center mr-2 text-gray-400 hover:text-gray-600"
                          >
                            <svg 
                              className={`w-3 h-3 transform transition-transform duration-200 ${
                                expandedApps[submodule.id] ? 'rotate-90' : ''
                              }`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          
                        <input
                          type="checkbox"
                            checked={permissionStatus === 'all'}
                          ref={input => {
                              if (input) input.indeterminate = permissionStatus === 'some';
                            }}
                            onChange={(e) => toggleSubmodulePermissions(submodule.id, e.target.checked)}
                            className="h-4 w-4 text-[#2D728F] rounded border-gray-300 focus:ring-[#2D728F]/20 focus:border-[#2D728F] mr-3 transition-colors"
                            disabled={isViewMode}
                          />
                          
                          <span className="text-[13px] font-medium text-gray-700 flex-1">
                            {submodule.name}
                          </span>
                          

                        </div>

                                                                        {/* Permisos granulares con mejor indentación */}
                        {expandedApps[submodule.id] && permissions.length > 0 && (
                          <div className="ml-8 border-l border-gray-200 pl-8 mt-1 space-y-1">
                            {permissions.map((permission) => (
                              <label
                                key={permission.id}
                                className="flex items-center py-1 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.permissions.includes(permission.id)}
                                  onChange={() => togglePermission(permission.id)}
                                  className="h-4 w-4 text-[#2D728F] rounded border-gray-300 focus:ring-[#2D728F]/20 focus:border-[#2D728F] mr-3 transition-colors"
                                  disabled={isViewMode}
                                />
                                <span className="select-none text-[13px] font-medium text-gray-600">
                                  {permission.translatedName}
                        </span>
                      </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderAssignedModules = () => {
    const moduleStructure = getModuleStructure();
    const assignedModules = {};

    // Filtrar solo submódulos que tienen permisos asignados
    Object.entries(moduleStructure).forEach(([moduleKey, module]) => {
      const assignedSubmodules = [];
      
      module.submodules.forEach(submodule => {
        const permissions = getPermissionsForSubmodule(submodule.id);
        const assignedPermissions = permissions.filter(p => formData.permissions.includes(p.id));
        
        if (assignedPermissions.length > 0) {
          assignedSubmodules.push({
            ...submodule,
            assignedPermissions
          });
        }
      });

      if (assignedSubmodules.length > 0) {
        assignedModules[moduleKey] = {
          ...module,
          assignedSubmodules
        };
      }
    });

    if (Object.keys(assignedModules).length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center p-6">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.012-3a7.5 7.5 0 11-9.775 9.775A7.5 7.5 0 0115.012 9z" />
            </svg>
            <p className="text-[13px] font-medium text-gray-600 mb-1">Sin accesos asignados</p>
            <p className="text-[11px] text-gray-400">Selecciona módulos de la izquierda para otorgar permisos</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {Object.entries(assignedModules).map(([moduleKey, module]) => (
          <div key={moduleKey}>
            {/* Módulo asignado - LIMPIO */}
            <div className="flex items-center py-2 bg-[#2D728F]/5 border border-[#2D728F]/10 rounded-md transition-colors">
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <svg className="w-3 h-3 text-[#2D728F]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              
              <span className="text-[13px] font-semibold text-[#2D728F] flex-1">{module.title}</span>
              <span className="text-[13px] text-[#2D728F]/70 bg-[#2D728F]/10 px-2 py-1 rounded-full">Activo</span>
            </div>

            {/* Submódulos asignados con línea vertical sutil */}
            <div className="ml-6 border-l border-gray-300 pl-6 space-y-2">
              {module.assignedSubmodules.map((submodule) => (
                <div key={`assigned.${submodule.id}`}>
                  {/* Submódulo asignado - LIMPIO sin card */}
                  <div className="flex items-center justify-between py-1.5">
                    <button
                      type="button"
                      onClick={() => toggleAppExpanded(`assigned.${submodule.id}`)}
                      className="flex items-center text-left hover:text-[#2D728F] transition-colors"
                    >
                      <svg 
                        className={`w-3 h-3 mr-2 transform transition-transform duration-200 text-gray-400 ${
                          expandedApps[`assigned.${submodule.id}`] ? 'rotate-90' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-[13px] font-medium text-gray-800">{submodule.name}</span>
                    </button>
                  </div>
                  
                  {/* Lista de permisos asignados - SOLO SI ESTÁ DESPLEGADO */}
                  {expandedApps[`assigned.${submodule.id}`] && (
                    <div className="ml-8 border-l border-gray-200 pl-8 space-y-1">
                      {submodule.assignedPermissions.map((permission) => (
                        <div key={`assigned.${permission.id}`} className="flex items-center py-1">
                          <svg className="w-3 h-3 mr-3 text-[#2D728F] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[13px] font-medium text-gray-700">{permission.translatedName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header como en la imagen con campo nombre */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[13px] font-semibold text-gray-900">Nuevo perfil</h1>
            <div className="flex items-center space-x-3">
        <button 
                type="button"
          onClick={onCancel} 
                className="flex items-center space-x-2 px-4 py-2 text-[13px] text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Cancelar</span>
              </button>
              <button 
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex items-center space-x-2 px-4 py-2 text-[13px] text-white bg-[#2D728F] hover:bg-[#2D728F]/90 disabled:bg-gray-400 disabled:cursor-not-allowed border border-transparent rounded-lg transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
                )}
                <span>Grabar</span>
        </button>
            </div>
      </div>

          {/* Campo de nombre dentro del header */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-[13px] font-semibold text-gray-700">
              Nombre del Perfil <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Ej. Administrador de Contenido"
              className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400"
              required
              disabled={isViewMode}
            />
            {errors.name && (
              <p className="text-[13px] text-red-600 mt-1">{errors.name}</p>
            )}
            <p className="text-[13px] text-gray-500">
              Este será el nombre del grupo en Django
            </p>
            </div>
          </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Sistema de Permisos - Dos Columnas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold text-gray-900">
                  Configuración de Permisos
          </h3>
                <p className="text-[13px] text-gray-500 mt-1">
                  Selecciona los módulos y permisos específicos para este perfil
                </p>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-white rounded-full border border-gray-200">
                <div className="w-2 h-2 bg-[#2D728F] rounded-full animate-pulse"></div>
                <span className="text-[13px] font-medium text-gray-600">
                  {formData.permissions.length} permisos activos
                </span>
              </div>
          </div>
        </div>
          
          {loadingPermissions ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D728F] mx-auto"></div>
                <p className="text-[13px] text-gray-500 mt-3">Cargando estructura de permisos...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 p-6">
              {/* Columna Izquierda: Módulos Disponibles */}
              <div>
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <h4 className="text-[13px] font-bold text-gray-800">Módulos del Sistema</h4>
                </div>
                <div className="space-y-1">
                  {renderModuleStructure()}
                </div>
              </div>

              {/* Columna Derecha: Permisos Asignados */}
              <div>
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <h4 className="text-[13px] font-bold text-gray-800">Permisos Asignados</h4>
                </div>
                <div className="space-y-1">
                  {renderAssignedModules()}
                </div>
              </div>
            </div>
          )}
        </div>


      </form>

      {/* Estilos para scroll personalizado */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
          </div>
    </div>
  );
};

ProfileFormNew.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit', 'view']),
  editingProfile: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default React.memo(ProfileFormNew);