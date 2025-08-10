/**
 * Modal para gestión de perfiles con sistema de permisos jerárquico
 * Siguiendo el patrón de la imagen con dos columnas: Disponibles/Asignados
 * Sistema híbrido Django Groups + GroupProfile
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../Common';
import groupService from '../../services/groupService';

const ProfileModalNew = ({
  show,
  onClose,
  onSubmit,
  editingProfile,
  loading,
  mode = 'edit' // 'create', 'edit', 'view'
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo_acceso: 'AMBOS',
    is_admin_group: false,
    is_worker_group: false,
    is_active: true,
    permisos: [] // Array de IDs de permisos seleccionados
  });

  const [errors, setErrors] = useState({});
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Derivar estados del mode
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';

  // Cargar permisos disponibles al montar el componente
  useEffect(() => {
    if (show) {
      loadAvailablePermissions();
    }
  }, [show]);

  // Resetear formulario cuando cambie el perfil editado o el mode
  useEffect(() => {
    if (isCreateMode) {
      setFormData({
        nombre: '',
        descripcion: '',
        tipo_acceso: 'AMBOS',
        is_admin_group: false,
        is_worker_group: false,
        is_active: true,
        permisos: []
      });
    } else if (editingProfile && (isEditMode || isViewMode)) {
      setFormData({
        nombre: editingProfile.nombre || editingProfile.name || '',
        descripcion: editingProfile.descripcion || '',
        tipo_acceso: editingProfile.tipo_acceso || 'AMBOS',
        is_admin_group: editingProfile.is_admin_group || false,
        is_worker_group: editingProfile.is_worker_group || false,
        is_active: editingProfile.is_active !== undefined ? editingProfile.is_active : true,
        permisos: editingProfile.permissions?.map(p => p.id) || []
      });
    }
    setErrors({});
  }, [editingProfile, mode, isCreateMode, isEditMode, isViewMode]);

  const loadAvailablePermissions = async () => {
    try {
      setLoadingPermissions(true);
      const response = await groupService.getAvailablePermissions();
      
      if (response.success && response.data) {
        setAvailablePermissions(response.data);
        
        // Expandir módulos por defecto
        const defaultExpanded = {};
        Object.keys(response.data).forEach(app => {
          defaultExpanded[app] = true;
          Object.keys(response.data[app].models).forEach(model => {
            defaultExpanded[`${app}.${model}`] = false; // Sub-módulos cerrados por defecto
          });
        });
        setExpandedModules(defaultExpanded);
      }
    } catch (error) {
      console.error('Error cargando permisos:', error);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (isViewMode) return;

    // Validación especial para Admin OR Worker, no ambos
    if (field === 'is_admin_group' && value) {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        is_worker_group: false
      }));
    } else if (field === 'is_worker_group' && value) {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        is_admin_group: false
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const toggleModuleExpanded = (moduleKey) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  const handlePermissionToggle = (permissionId) => {
    if (isViewMode) return;

    setFormData(prev => ({
      ...prev,
      permisos: prev.permisos.includes(permissionId)
        ? prev.permisos.filter(id => id !== permissionId)
        : [...prev.permisos, permissionId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.is_admin_group && !formData.is_worker_group) {
      newErrors.type = 'Debe seleccionar Admin O Worker';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const dataToSubmit = {
      ...formData,
      name: formData.nombre, // Backend espera 'name' para Django Group
      permissions: formData.permisos // Enviar IDs de permisos seleccionados
    };

    onSubmit(dataToSubmit);
  };

  const renderPermissionTree = (permissions, isAssigned = false) => {
    if (loadingPermissions) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2D728F]"></div>
          <span className="ml-2 text-sm text-gray-500">Cargando permisos...</span>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {Object.entries(permissions).map(([appKey, appData]) => (
          <div key={appKey} className="border-b border-gray-100 last:border-b-0">
            {/* Módulo Principal */}
            <div
              className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleModuleExpanded(appKey)}
            >
              <svg
                className={`w-4 h-4 mr-2 transform transition-transform ${
                  expandedModules[appKey] ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="w-4 h-4 mr-2 bg-blue-500 rounded-sm flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">{appData.name}</span>
            </div>

            {/* Sub-módulos */}
            {expandedModules[appKey] && (
              <div className="ml-6 space-y-1">
                {Object.entries(appData.models).map(([modelKey, modelData]) => (
                  <div key={`${appKey}.${modelKey}`}>
                    {/* Nombre del modelo */}
                    <div
                      className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleModuleExpanded(`${appKey}.${modelKey}`)}
                    >
                      <svg
                        className={`w-3 h-3 mr-2 transform transition-transform ${
                          expandedModules[`${appKey}.${modelKey}`] ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      
                      {/* Checkbox del modelo */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={modelData.permissions.every(p => formData.permisos.includes(p.id))}
                          onChange={(e) => {
                            if (isViewMode) return;
                            const modelPermissionIds = modelData.permissions.map(p => p.id);
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                permisos: [...new Set([...prev.permisos, ...modelPermissionIds])]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                permisos: prev.permisos.filter(id => !modelPermissionIds.includes(id))
                              }));
                            }
                          }}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={isViewMode}
                        />
                        <span className="text-sm text-gray-600">{modelData.name}</span>
                      </div>
                    </div>

                    {/* Permisos específicos */}
                    {expandedModules[`${appKey}.${modelKey}`] && (
                      <div className="ml-6 space-y-1">
                        {modelData.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center p-1 hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={formData.permisos.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              disabled={isViewMode}
                            />
                            <span className="text-xs text-gray-500">{permission.action_display}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const getAssignedPermissions = () => {
    const assigned = {};
    
    Object.entries(availablePermissions).forEach(([appKey, appData]) => {
      const appHasAssigned = Object.entries(appData.models).some(([_, modelData]) => 
        modelData.permissions.some(p => formData.permisos.includes(p.id))
      );
      
      if (appHasAssigned) {
        assigned[appKey] = {
          ...appData,
          models: {}
        };
        
        Object.entries(appData.models).forEach(([modelKey, modelData]) => {
          const assignedModelPerms = modelData.permissions.filter(p => 
            formData.permisos.includes(p.id)
          );
          
          if (assignedModelPerms.length > 0) {
            assigned[appKey].models[modelKey] = {
              ...modelData,
              permissions: assignedModelPerms
            };
          }
        });
      }
    });
    
    return assigned;
  };

  return (
    <Modal show={show} onClose={onClose} size="6xl">
      <div className="flex flex-col h-[80vh]">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
            {isCreateMode && 'Nuevo Perfil'}
            {isEditMode && 'Editar Perfil'}
            {isViewMode && 'Detalles del Perfil'}
          </h3>
          <p className="text-[13px] text-gray-500 mt-1">
            {isCreateMode && 'Define un nuevo perfil con permisos específicos'}
            {isEditMode && 'Modifica los datos y permisos del perfil'}
            {isViewMode && 'Información completa del perfil y sus permisos'}
          </p>
        </div>

        {/* Formulario básico */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-[13px] transition-colors ${
                  errors.nombre
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                } focus:outline-none focus:ring-2`}
                placeholder="Nombre del perfil..."
                disabled={isViewMode}
              />
              {errors.nombre && (
                <p className="mt-1 text-[11px] text-red-600">{errors.nombre}</p>
              )}
            </div>

            {/* Tipo de Perfil */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">
                Tipo de Perfil *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.is_admin_group}
                    onChange={() => handleInputChange('is_admin_group', true)}
                    className="mr-2 text-blue-600"
                    disabled={isViewMode}
                  />
                  <span className="text-[13px] text-gray-700">Admin</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={formData.is_worker_group}
                    onChange={() => handleInputChange('is_worker_group', true)}
                    className="mr-2 text-blue-600"
                    disabled={isViewMode}
                  />
                  <span className="text-[13px] text-gray-700">Worker</span>
                </label>
              </div>
              {errors.type && (
                <p className="mt-1 text-[11px] text-red-600">{errors.type}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.is_active ? 'ACTIVO' : 'INACTIVO'}
                onChange={(e) => handleInputChange('is_active', e.target.value === 'ACTIVO')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                disabled={isViewMode}
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className="mt-4">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              rows={2}
              className={`w-full px-3 py-2 border rounded-lg text-[13px] transition-colors resize-none ${
                errors.descripcion
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              } focus:outline-none focus:ring-2`}
              placeholder="Describe las responsabilidades de este perfil..."
              disabled={isViewMode}
            />
            {errors.descripcion && (
              <p className="mt-1 text-[11px] text-red-600">{errors.descripcion}</p>
            )}
          </div>
        </div>

        {/* Sistema de Permisos - Dos Columnas */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Columna Izquierda: Accesos Disponibles */}
            <div className="flex flex-col h-full">
              <h4 className="text-sm font-medium text-gray-700 mb-3 p-3 bg-gray-50 rounded-t-lg">
                Accesos Disponibles
              </h4>
              <div className="flex-1 border border-gray-200 rounded-b-lg overflow-y-auto">
                {renderPermissionTree(availablePermissions)}
              </div>
            </div>

            {/* Columna Derecha: Accesos Asignados */}
            <div className="flex flex-col h-full">
              <h4 className="text-sm font-medium text-gray-700 mb-3 p-3 bg-gray-50 rounded-t-lg">
                Accesos Asignados
              </h4>
              <div className="flex-1 border border-gray-200 rounded-b-lg overflow-y-auto">
                {Object.keys(getAssignedPermissions()).length > 0 ? (
                  renderPermissionTree(getAssignedPermissions(), true)
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.012-3a7.5 7.5 0 11-9.775 9.775A7.5 7.5 0 0115.012 9z" />
                      </svg>
                      <p className="mt-2 text-sm">No hay permisos asignados</p>
                      <p className="text-xs text-gray-400">Selecciona permisos de la columna izquierda</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Cancelar
            </button>
            
            {!isViewMode && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`px-4 py-2 text-[13px] font-medium text-white rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#2D728F] hover:bg-[#1e5a75] focus:ring-[#2D728F]'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  'Grabar'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

ProfileModalNew.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingProfile: PropTypes.object,
  loading: PropTypes.bool,
  mode: PropTypes.oneOf(['create', 'edit', 'view'])
};

export default ProfileModalNew;
 