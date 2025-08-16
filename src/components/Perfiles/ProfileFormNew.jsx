/**
 * SOLUCIÓN SIMPLE Y DIRECTA - SIN COMPLEJIDAD INNECESARIA
 * Enfoque: Los datos del backend son la verdad absoluta
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import groupService from '../../services/groupService';
import dynamicPermissionsService from '../../services/dynamicPermissionsService';
import { useMenuPermissions } from '../../hooks/useMenuPermissions';
import { toast } from 'react-hot-toast';


const ProfileFormNew = ({ 
  mode = 'create', 
  editingProfile = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const { canManageProfiles } = useMenuPermissions();
  
  // Estados básicos
  const [formData, setFormData] = useState({
    name: '',
    permissions: []
  });
  const [errors, setErrors] = useState({});
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [expandedApps, setExpandedApps] = useState({});



  // Cargar permisos disponibles
  useEffect(() => {
    loadAvailablePermissions();
  }, []);

  // Inicializar formulario al editar
  useEffect(() => {
    if (editingProfile && mode === 'edit') {
      // Los permisos pueden venir como objetos {id, name, codename...} o como IDs
      let permissionIds = [];
      if (Array.isArray(editingProfile.permissions)) {
        permissionIds = editingProfile.permissions.map(permission => {
          // Si es objeto, extraer el ID, si es primitivo, usar tal como está
          return typeof permission === 'object' && permission.id 
            ? permission.id 
            : permission;
        });
      }
      
      setFormData({
        name: editingProfile.name || '',
        permissions: permissionIds
      });
    }
  }, [editingProfile, mode]);

  const loadAvailablePermissions = async () => {
    try {
      setLoadingPermissions(true);
      dynamicPermissionsService.clearCache();
      const moduleStructure = await dynamicPermissionsService.getCompleteModuleStructureForProfiles();
      setAvailablePermissions(moduleStructure);
      
      // Expandir todos los módulos
      const allExpanded = {};
      Object.keys(moduleStructure).forEach(moduleKey => {
        allExpanded[moduleKey] = true;
      });
      setExpandedApps(allExpanded);
      
    } catch (error) {
      toast.error('Error al cargar permisos');
    } finally {
      setLoadingPermissions(false);
    }
  };

  // LÓGICA SIMPLE: Un permiso está seleccionado si está en formData.permissions
  const isPermissionSelected = (permission) => {
    const perms = formData.permissions || [];
    
    // Buscar por ID numérico
    if (perms.includes(permission.id)) return true;
    
    // Buscar por string ID
    if (perms.includes(String(permission.id))) return true;
    
    // Buscar por full_codename si existe
    if (permission.app_label && permission.codename) {
      const fullCodename = `${permission.app_label}.${permission.codename}`;
      if (perms.includes(fullCodename)) return true;
    }
    
    // Si es view y hay escritura del mismo modelo, marcar como seleccionado
    if (permission.action === 'view') {
      const model = permission.model || extractModelFromCodename(permission.codename);
      if (model) {
        const hasWrite = perms.some(p => {
          if (typeof p === 'object') {
            return p.model === model && ['add', 'change', 'delete'].includes(p.action);
          }
          if (typeof p === 'string') {
            return p.includes(`add_${model}`) || p.includes(`change_${model}`) || p.includes(`delete_${model}`);
          }
          return false;
        });
        if (hasWrite) return true;
      }
    }
    
    return false;
  };

  const extractModelFromCodename = (codename) => {
    if (!codename) return null;
    const parts = codename.split('_');
    return parts.length > 1 ? parts.slice(1).join('_') : null;
  };

  const extractActionFromCodename = (codename) => {
    if (!codename) return null;
    return codename.split('_')[0];
  };

  const togglePermission = (permissionId) => {
    setFormData(prev => {
      const currentPerms = prev.permissions || [];
      const isSelected = currentPerms.includes(permissionId) || currentPerms.includes(String(permissionId));
      
      if (isSelected) {
        // Remover
        return {
          ...prev,
          permissions: currentPerms.filter(p => p !== permissionId && p !== String(permissionId))
        };
      } else {
        // Agregar
        return {
          ...prev,
          permissions: [...currentPerms, permissionId]
        };
      }
    });
  };

  const toggleAppExpanded = (appKey) => {
    setExpandedApps(prev => ({
      ...prev,
      [appKey]: !prev[appKey]
    }));
  };

  // Obtener estado de selección de un módulo completo
  const getModulePermissionStatus = (moduleKey) => {
    const module = availablePermissions[moduleKey];
    if (!module) return 'none';
    
    let totalPermissions = 0;
    let selectedPermissions = 0;
    
    module.submodules?.forEach(submodule => {
      const permissions = getPermissionsForSubmodule(submodule.id);
      totalPermissions += permissions.length;
      selectedPermissions += permissions.filter(p => isPermissionSelected(p)).length;
    });
    
    if (totalPermissions === 0) return 'none';
    if (selectedPermissions === 0) return 'none';
    if (selectedPermissions === totalPermissions) return 'all';
    return 'some';
  };

  // Obtener estado de selección de un submódulo
  const getSubmodulePermissionStatus = (submoduleId) => {
    const permissions = getPermissionsForSubmodule(submoduleId);
    if (permissions.length === 0) return 'none';
    
    const selectedCount = permissions.filter(p => isPermissionSelected(p)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === permissions.length) return 'all';
    return 'some';
  };

  // Toggle permisos de módulo completo
  const toggleModulePermissions = (moduleKey, checked) => {
    const module = availablePermissions[moduleKey];
    if (!module) return;
    
    const allModulePermissionIds = [];
    module.submodules?.forEach(submodule => {
      const permissions = getPermissionsForSubmodule(submodule.id);
      permissions.forEach(permission => {
        if (!permission.artificial) { // No incluir permisos artificiales
          allModulePermissionIds.push(permission.id);
        }
      });
    });
    
    setFormData(prev => {
      if (checked) {
        // Agregar todos los permisos del módulo
        const newPermissions = [...new Set([...prev.permissions, ...allModulePermissionIds])];
        return { ...prev, permissions: newPermissions };
      } else {
        // Quitar todos los permisos del módulo
        const newPermissions = prev.permissions.filter(id => !allModulePermissionIds.includes(id));
        return { ...prev, permissions: newPermissions };
      }
    });
  };

  // Toggle permisos de submódulo completo
  const toggleSubmodulePermissions = (submoduleId, checked) => {
    const permissions = getPermissionsForSubmodule(submoduleId);
    const permissionIds = permissions
      .filter(p => !p.artificial) // No incluir permisos artificiales
      .map(p => p.id);
    
    setFormData(prev => {
      if (checked) {
        // Agregar todos los permisos del submódulo
        const newPermissions = [...new Set([...prev.permissions, ...permissionIds])];
        return { ...prev, permissions: newPermissions };
      } else {
        // Quitar todos los permisos del submódulo
        const newPermissions = prev.permissions.filter(id => !permissionIds.includes(id));
        return { ...prev, permissions: newPermissions };
      }
    });
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, name: value }));
    if (errors.name && value.trim().length >= 3) {
      setErrors(prev => ({ ...prev, name: null }));
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Por favor corrige los errores del formulario');
      return;
    }

    // Filtrar solo IDs numéricos válidos y remover artificiales
    const validPermissions = (formData.permissions || [])
      .filter(p => {
        // Excluir permisos artificiales
        if (typeof p === 'string' && p.startsWith('artificial_')) return false;
        
        // Solo incluir IDs numéricos válidos
        const numId = typeof p === 'string' ? parseInt(p) : p;
        return !isNaN(numId) && numId > 0;
      })
      .map(p => typeof p === 'string' ? parseInt(p) : p);

    const dataToSubmit = {
      name: formData.name.trim(),
      permissions: validPermissions
    };
    onSubmit(dataToSubmit);
  };

  // Obtener permisos de un submódulo
  const getPermissionsForSubmodule = (submoduleId) => {
    for (const [, moduleData] of Object.entries(availablePermissions)) {
      if (moduleData.submodules) {
        const submodule = moduleData.submodules.find(sub => sub.id === submoduleId);
        if (submodule && submodule.permissions) {
          const crudActions = ['view', 'add', 'change', 'delete'];
          const crudPermissions = [];
          const seenActions = new Set();
          
          submodule.permissions.forEach(permission => {
            const action = permission.action || extractActionFromCodename(permission.codename || permission.name);
            if (crudActions.includes(action) && !seenActions.has(action)) {
              seenActions.add(action);
              
              // Traducir nombre
              const translatedName = translatePermissionToSpanish(permission, submodule.name, action);
              
              crudPermissions.push({
                ...permission,
                translatedName,
                action,
                model: permission.model || extractModelFromCodename(permission.codename || permission.name)
              });
            }
          });
          
          // Crear permiso VIEW artificial si no existe pero hay escritura
          const hasWritePermissions = crudPermissions.some(p => ['add', 'change', 'delete'].includes(p.action));
          const hasViewPermission = crudPermissions.some(p => p.action === 'view');
          
          if (hasWritePermissions && !hasViewPermission) {
            const firstPermission = crudPermissions[0];
            crudPermissions.unshift({
              ...firstPermission,
              id: `artificial_view_${submodule.id}`,
              codename: `view_${submodule.model}`,
              action: 'view',
              translatedName: `Ver ${submodule.name}`,
              artificial: true
            });
          }
          
          return crudPermissions.sort((a, b) => {
            const actionOrder = ['view', 'add', 'change', 'delete'];
            return actionOrder.indexOf(a.action) - actionOrder.indexOf(b.action);
          });
        }
      }
    }
    return [];
  };

  const translatePermissionToSpanish = (permission, contextName, action) => {
    const actionTranslations = {
      'add': 'Crear',
      'change': 'Editar', 
      'delete': 'Eliminar',
      'view': 'Ver'
    };
    
    const actionSpanish = actionTranslations[action] || action;
    return `${actionSpanish} ${contextName}`;
  };

  const renderModuleStructure = () => {
    if (Object.keys(availablePermissions).length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center p-4">
            <p className="text-[13px]">No hay módulos disponibles</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {Object.entries(availablePermissions).map(([moduleKey, module]) => (
          <div key={moduleKey}>
            {/* Módulo Principal */}
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
                checked={getModulePermissionStatus(moduleKey) === 'all'}
                ref={input => {
                  if (input) input.indeterminate = getModulePermissionStatus(moduleKey) === 'some';
                }}
                onChange={(e) => toggleModulePermissions(moduleKey, e.target.checked)}
                className="h-4 w-4 text-[#2D728F] rounded border-gray-300 focus:ring-[#2D728F]/20 focus:border-[#2D728F] mr-3 transition-colors"
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

            {/* Submódulos */}
            {expandedApps[moduleKey] && (
              <div className="ml-6 border-l border-gray-300 pl-6 space-y-1">
                {module.submodules.map((submodule) => {
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
                          checked={getSubmodulePermissionStatus(submodule.id) === 'all'}
                          ref={input => {
                            if (input) input.indeterminate = getSubmodulePermissionStatus(submodule.id) === 'some';
                          }}
                          onChange={(e) => toggleSubmodulePermissions(submodule.id, e.target.checked)}
                          className="h-4 w-4 text-[#2D728F] rounded border-gray-300 focus:ring-[#2D728F]/20 focus:border-[#2D728F] mr-3 transition-colors"
                        />
                        
                        <span className="text-[13px] font-medium text-gray-700 flex-1">
                          {submodule.name}
                        </span>
                      </div>

                      {/* Permisos */}
                      {expandedApps[submodule.id] && permissions.length > 0 && (
                        <div className="ml-8 border-l border-gray-200 pl-8 mt-1 space-y-1">
                          {permissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-center py-1 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isPermissionSelected(permission)}
                                onChange={() => togglePermission(permission.id)}
                                className="h-4 w-4 text-[#2D728F] rounded border-gray-300 focus:ring-[#2D728F]/20 focus:border-[#2D728F] mr-3 transition-colors"
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
        ))}
      </div>
    );
  };

  const renderAssignedModules = () => {
    const moduleStructure = availablePermissions || {};
    const assignedModules = {};

    // Filtrar solo submódulos que tienen permisos asignados
    Object.entries(moduleStructure).forEach(([moduleKey, module]) => {
      const assignedSubmodules = [];
      
      module.submodules?.forEach(submodule => {
        const permissions = getPermissionsForSubmodule(submodule.id);
        const assignedPermissions = permissions.filter(p => isPermissionSelected(p));
        
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
            {/* Módulo asignado */}
            <div className="flex items-center py-2 bg-[#2D728F]/5 border border-[#2D728F]/10 rounded-md transition-colors">
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <svg className="w-3 h-3 text-[#2D728F]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              
              <span className="text-[13px] font-semibold text-[#2D728F] flex-1">{module.title}</span>
              <span className="text-[13px] text-[#2D728F]/70 bg-[#2D728F]/10 px-2 py-1 rounded-full">Activo</span>
            </div>

            {/* Submódulos asignados */}
            <div className="ml-6 border-l border-gray-300 pl-6 space-y-2">
              {module.assignedSubmodules.map((submodule) => (
                <div key={`assigned.${submodule.id}`}>
                  {/* Submódulo asignado */}
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
                  
                  {/* Lista de permisos asignados */}
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[13px] font-semibold text-gray-900">
              {mode === 'edit' ? 'Editar perfil' : 'Nuevo perfil'}
            </h1>
            <div className="flex items-center space-x-3">
              <button 
                type="button"
                onClick={onCancel} 
                className="flex items-center space-x-2 px-4 py-2 text-[13px] text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span>Cancelar</span>
              </button>
              <button 
                type="submit"
                form="profile-form"
                disabled={loading || !formData.name.trim()}
                className="flex items-center space-x-2 px-4 py-2 text-[13px] text-white bg-[#2D728F] hover:bg-[#2D728F]/90 disabled:bg-gray-400 disabled:cursor-not-allowed border border-transparent rounded-lg transition-colors"
                onClick={handleSubmit}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <span>Guardar</span>
                )}
              </button>
            </div>
          </div>

          {/* Campo de nombre */}
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
            />
            {errors.name && (
              <p className="text-[13px] text-red-600 mt-1">{errors.name}</p>
            )}
          </div>
        </div>

        {/* Sistema de Permisos */}
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
                <div className="flex items-center space-x-1 px-3 py-1.5 bg-white rounded-full border border-gray-200">
                  <div className="w-2 h-2 bg-[#2D728F] rounded-full animate-pulse"></div>
                  <span className="text-[13px] font-medium text-gray-600">
                    {(formData.permissions?.length || 0)} permisos activos
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