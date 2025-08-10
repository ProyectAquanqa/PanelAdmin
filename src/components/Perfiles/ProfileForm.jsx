/**
 * Formulario de perfil integrado en la página (no modal)
 * Sistema de permisos jerárquico con dos columnas como en la imagen
 * Sistema híbrido Django Groups + GroupProfile
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import groupService from '../../services/groupService';

const ProfileForm = ({
  editingProfile = null,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    is_active: true,
    permisos: [] // Array de IDs de permisos seleccionados
  });

  const [errors, setErrors] = useState({});
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const isEditMode = !!editingProfile;

  // Cargar permisos disponibles al montar el componente
  useEffect(() => {
    loadAvailablePermissions();
  }, []);

  // Resetear formulario cuando cambie el perfil editado
  useEffect(() => {
    if (editingProfile) {
      setFormData({
        nombre: editingProfile.nombre || editingProfile.name || '',
        descripcion: editingProfile.descripcion || '',
        is_active: editingProfile.is_active !== undefined ? editingProfile.is_active : true,
        permisos: editingProfile.permissions?.map(p => p.id) || []
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        is_active: true,
        permisos: []
      });
    }
    setErrors({});
  }, [editingProfile]);

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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dataToSubmit = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      is_active: formData.is_active,
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
    <div className="w-full bg-slate-50">
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header con botón volver */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onCancel}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Crear Perfil' : mode === 'edit' ? 'Editar Perfil' : 'Ver Perfil'}
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Formulario básico siguiendo patrón KnowledgeBase */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">
                  Nombre del Perfil *
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
                  placeholder="Ej: Editor de Eventos, Supervisor General..."
                />
                {errors.nombre && (
                  <p className="mt-1 text-[11px] text-red-600">{errors.nombre}</p>
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
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-4">
              <label className="block text-[13px] font-medium text-gray-700 mb-1">
                Descripción del Perfil *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg text-[13px] transition-colors resize-none ${
                  errors.descripcion
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                } focus:outline-none focus:ring-2`}
                placeholder="Ej: Puede gestionar eventos y categorías, con acceso completo al módulo de eventos..."
              />
              {errors.descripcion && (
                <p className="mt-1 text-[11px] text-red-600">{errors.descripcion}</p>
              )}
            </div>
          </div>

          {/* Sistema de Permisos */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Permisos del Panel
            </h3>
            
            <div className="space-y-4">
              {loadingPermissions ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D728F]"></div>
                  <p className="text-gray-500 ml-3">Cargando permisos...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(availablePermissions).map(([appKey, appData]) => (
                    <div key={appKey} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h4 className="text-sm font-semibold text-gray-800">{appData.name}</h4>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(appData.models).map(([modelKey, modelData]) => (
                          <div key={modelKey}>
                            <p className="text-xs font-medium text-gray-600 mb-1">{modelData.name}</p>
                            <div className="grid grid-cols-2 gap-1">
                              {modelData.permissions.map(permission => (
                                <label key={permission.id} className="flex items-center text-xs cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={formData.permisos.includes(permission.id)}
                                    onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                    className="form-checkbox h-3 w-3 text-[#2D728F] rounded mr-1"
                                    disabled={mode === 'view'}
                                  />
                                  <span className="text-gray-700">{permission.action_display}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 bg-white rounded-lg border border-gray-200 p-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-[13px] font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 text-[13px] font-medium text-white rounded-lg focus:outline-none focus:ring-2 transition-colors ${
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
          </div>
        </form>
      </div>
    </div>
  );
};

ProfileForm.propTypes = {
  editingProfile: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default ProfileForm;
 