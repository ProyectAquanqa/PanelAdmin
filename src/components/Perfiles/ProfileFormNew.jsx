/**
 * Formulario para crear/editar perfiles (grupos de Django)
 * Rediseñado para seguir la estructura exacta del backend Django
 */

import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import groupService from '../../services/groupService';
import dynamicPermissionsService from '../../services/dynamicPermissionsService';
import PermissionsDebugger from './PermissionsDebugger';
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
      
      // Limpiar cache antes de cargar para obtener datos frescos
      dynamicPermissionsService.clearCache();
      
      // Usar el nuevo servicio dinámico de permisos
      const moduleStructure = await dynamicPermissionsService.getModulePermissionsStructure();
      
      console.log('🔄 Estructura de módulos obtenida (limpia):', moduleStructure);
      setAvailablePermissions(moduleStructure);
      
      // Expandir SOLO módulos por defecto - submódulos visibles, permisos ocultos
      const allExpanded = {};
      Object.keys(moduleStructure).forEach(moduleKey => {
        allExpanded[moduleKey] = true; // Expandir módulos principales
        // Los submódulos y permisos específicos NO se expanden inicialmente
      });
      
      setExpandedApps(allExpanded);
      
    } catch (error) {
      console.error('Error cargando permisos:', error);
      toast.error('Error al cargar permisos');
      
      // Fallback a método anterior si falla el nuevo servicio
      try {
        const response = await groupService.getAvailablePermissions();
        if (response.status === 'success' && response.data?.permissions_by_app) {
          setAvailablePermissions(response.data.permissions_by_app);
        }
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
      }
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
    
    console.log('🚀 Formulario enviado - Iniciando validación...');
    
    if (!validateForm()) {
      console.log('❌ Validación fallida');
      toast.error('Por favor corrige los errores del formulario');
      return;
    }

    const dataToSubmit = {
      name: formData.name.trim(),
      permissions: formData.permissions
    };

    console.log('✅ Datos a enviar:', dataToSubmit);
    console.log('📊 Total de permisos seleccionados:', dataToSubmit.permissions.length);
    
    try {
      onSubmit(dataToSubmit);
      console.log('✅ Llamada a onSubmit exitosa');
    } catch (error) {
      console.error('❌ Error en onSubmit:', error);
      toast.error('Error al guardar el perfil');
    }
  };

  // Función mejorada para traducir permisos técnicos a español comprensible
  const translatePermissionToSpanish = (permission, contextName = '') => {
    const codename = permission.codename || permission.name || '';
    
    // Extraer acción y modelo del codename
    const action = extractActionFromCodename(codename);
    const modelPart = codename.replace(`${action}_`, '');
    
    // Mapeo de acciones a español
    const actionTranslations = {
      'add': 'Crear',
      'change': 'Editar', 
      'delete': 'Eliminar',
      'view': 'Ver',
      'publish': 'Publicar',
      'pin': 'Destacar',
      'feature': 'Promover',
      'manage': 'Gestionar',
      'export': 'Exportar',
      'import': 'Importar',
      'approve': 'Aprobar',
      'moderate': 'Moderar',
      'archive': 'Archivar'
    };
    
    // Mapeo de modelos específicos a español
    const modelTranslations = {
      'evento': 'eventos',
      'categoria': 'categorías',
      'user': 'usuarios',
      'usuario': 'usuarios', 
      'group': 'grupos',
      'grupo': 'grupos',
      'chatbotknowledgebase': 'conocimiento del chatbot',
      'chatbotcategory': 'categorías del chatbot',
      'chatconversation': 'conversaciones',
      'notificacion': 'notificaciones',
      'devicetoken': 'dispositivos',
      'permission': 'permisos',
      'permiso': 'permisos',
      'almuerzo': 'almuerzos'
    };
    
    // Obtener traducción de acción
    const actionSpanish = actionTranslations[action] || action;
    
    // Obtener traducción de modelo (usar contexto si no hay traducción específica)
    const modelSpanish = modelTranslations[modelPart] || contextName || modelPart;
    
    // Construir traducción final
    const finalTranslation = `${actionSpanish} ${modelSpanish}`;
    
    // Diccionario de traducciones específicas para casos especiales
    const specificTranslations = {
      'add_evento': 'Crear eventos',
      'change_evento': 'Editar eventos', 
      'delete_evento': 'Eliminar eventos',
      'view_evento': 'Ver eventos',
      'publish_evento': 'Publicar eventos',
      'pin_evento': 'Destacar eventos',
      'feature_evento': 'Promover eventos',
      
      'add_categoria': 'Crear categorías',
      'change_categoria': 'Editar categorías',
      'delete_categoria': 'Eliminar categorías', 
      'view_categoria': 'Ver categorías',
      
      'add_user': 'Crear usuarios',
      'change_user': 'Editar usuarios',
      'delete_user': 'Eliminar usuarios',
      'view_user': 'Ver usuarios',
      
      'add_group': 'Crear grupos',
      'change_group': 'Editar grupos',
      'delete_group': 'Eliminar grupos',
      'view_group': 'Ver grupos'
    };
    
    // Usar traducción específica si existe, sino usar la construida dinámicamente
    return specificTranslations[codename] || finalTranslation;
  };

  // Estructura dinámica basada en los datos del backend
  const getModuleStructure = () => {
    // Usar directamente la estructura obtenida del backend dinámicamente
    return availablePermissions || {};
  };

  // Función granular para obtener permisos específicos por submódulo  
  const getPermissionsForSubmodule = (submoduleId) => {
    // Debug: Log para verificar permisos disponibles
    console.log(`🔍 Obteniendo permisos para submódulo: ${submoduleId}`);
    
    // Buscar el submódulo en la nueva estructura dinámica
    for (const [moduleKey, moduleData] of Object.entries(availablePermissions)) {
      if (moduleData.submodules) {
        const submodule = moduleData.submodules.find(sub => sub.id === submoduleId);
        if (submodule && submodule.permissions) {
          
          // FILTRAR SOLO PERMISOS CRUD PRINCIPALES
          const crudActions = ['view', 'add', 'change', 'delete'];
          const crudPermissions = [];
          const seenActions = new Set();
          
          submodule.permissions.forEach(permission => {
            const codename = permission.codename || permission.name;
            const action = permission.action || extractActionFromCodename(codename);
            
            // Solo incluir permisos CRUD principales y evitar duplicados
            if (crudActions.includes(action) && !seenActions.has(action)) {
              seenActions.add(action);
              
              // Mejorar traducción
              const translatedName = translatePermissionToSpanish(permission, submodule.name);
              
              crudPermissions.push({
                ...permission,
                translatedName: translatedName,
                action: action,
                submoduleName: submodule.name
              });
            }
          });
          
          // Ordenar permisos en orden lógico CRUD
          const sortedPermissions = crudPermissions.sort((a, b) => {
            const actionOrder = ['view', 'add', 'change', 'delete'];
            const aIndex = actionOrder.indexOf(a.action);
            const bIndex = actionOrder.indexOf(b.action);
            return aIndex - bIndex;
          });
          
          console.log(`✅ Permisos CRUD para ${submoduleId}:`, sortedPermissions);
          return sortedPermissions;
        }
      }
    }

    console.warn(`⚠️ No se encontraron permisos para submódulo: ${submoduleId}`);
    return [];
  };

  // Función mejorada para extraer acción del codename
  const extractActionFromCodename = (codename) => {
    if (!codename) return 'unknown';
    const parts = codename.split('_');
    return parts.length > 1 ? parts[0] : codename;
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
                form="profile-form"
                disabled={loading || !formData.name.trim()}
                className="flex items-center space-x-2 px-4 py-2 text-[13px] text-white bg-[#2D728F] hover:bg-[#2D728F]/90 disabled:bg-gray-400 disabled:cursor-not-allowed border border-transparent rounded-lg transition-colors"
                onClick={() => console.log('🔘 Botón Guardar clickeado')}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
                )}
                <span>Guardar</span>
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

      <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">

        {/* Debug Component - Solo en desarrollo */}
        {import.meta.env.DEV && (
          <PermissionsDebugger 
            availablePermissions={availablePermissions}
            formPermissions={formData.permissions}
          />
        )}

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
              <div className="flex items-center space-x-3">
                {/* Botón de recarga en desarrollo */}
                {import.meta.env.DEV && (
                  <button
                    type="button"
                    onClick={loadAvailablePermissions}
                    disabled={loadingPermissions}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded border border-blue-300 transition-colors"
                  >
                    {loadingPermissions ? '⏳' : '🔄'} Recargar
                  </button>
                )}
                
                <div className="flex items-center space-x-1 px-3 py-1.5 bg-white rounded-full border border-gray-200">
                  <div className="w-2 h-2 bg-[#2D728F] rounded-full animate-pulse"></div>
                  <span className="text-[13px] font-medium text-gray-600">
                    {formData.permissions.length} permisos activos
                  </span>
                </div>
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