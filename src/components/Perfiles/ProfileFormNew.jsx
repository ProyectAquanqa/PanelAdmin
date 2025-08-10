import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import groupService from '../../services/groupService';

/**
 * Formulario simplificado para crear/editar perfiles
 * Sigue las DEVELOPMENT_GUIDELINES.md estrictamente
 */
const ProfileFormNew = ({ 
  mode = 'create', 
  editingProfile = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  // Estados básicos
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    is_active: true,
    permisos: []
  });
  
  const [errors, setErrors] = useState({});
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Cargar permisos disponibles
  useEffect(() => {
    loadAvailablePermissions();
  }, []);

  // Expandir algunos módulos por defecto
  useEffect(() => {
    if (Object.keys(availablePermissions).length > 0) {
      const defaultExpanded = {};
      Object.keys(availablePermissions).forEach(appKey => {
        defaultExpanded[appKey] = true; // Expandir módulos principales por defecto
      });
      setExpandedModules(defaultExpanded);
    }
  }, [availablePermissions]);

  // Resetear formulario cuando cambie el perfil
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

      // Normalizar respuesta: aceptar array directo o {data: array}
      const raw = Array.isArray(response)
        ? response
        : (response && Array.isArray(response.data) ? response.data : []);

      // Convertir a objeto { app_label: { name, models: { model: {name, permissions[]} } } }
      const normalized = {};
      raw.forEach(app => {
        const appKey = app.app_label || app.name || 'app';
        const modelsObj = {};
        (app.models || []).forEach(m => {
          modelsObj[m.model] = {
            name: m.model,
            permissions: Array.isArray(m.permissions) ? m.permissions : [],
          };
        });
        normalized[appKey] = {
          name: appKey,
          models: modelsObj,
        };
      });

      setAvailablePermissions(normalized);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Error al cargar permisos');
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const toggleModuleExpanded = (moduleKey) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  const handleModuleChange = (permissions, isChecked) => {
    const permissionIds = permissions.map(p => p.id);
    
    setFormData(prev => ({
      ...prev,
      permisos: isChecked
        ? [...new Set([...prev.permisos, ...permissionIds])] // Agregar todos los permisos del módulo
        : prev.permisos.filter(id => !permissionIds.includes(id)) // Quitar todos los permisos del módulo
    }));
  };

  const handleAppModuleChange = (appData, isChecked) => {
    // Manejar checkbox de módulo principal (ej: "Eventos")
    const allAppPermissions = [];
    Object.values(appData.models || {}).forEach(modelData => {
      allAppPermissions.push(...modelData.permissions.map(p => p.id));
    });
    
    setFormData(prev => ({
      ...prev,
      permisos: isChecked
        ? [...new Set([...prev.permisos, ...allAppPermissions])]
        : prev.permisos.filter(id => !allAppPermissions.includes(id))
    }));
  };

  const getAssignedPermissions = () => {
    const assigned = {};
    
    // Mostrar módulos con permisos asignados (completos o parciales)
    Object.entries(availablePermissions).forEach(([appKey, appData]) => {
      const allAppPermissions = [];
      Object.values(appData.models || {}).forEach(modelData => {
        allAppPermissions.push(...modelData.permissions.map(p => p.id));
      });

      const hasAllAppPermissions = allAppPermissions.every(id => formData.permisos.includes(id));
      const hasSomeAppPermissions = allAppPermissions.some(id => formData.permisos.includes(id));

      // Si el módulo principal tiene algunos o todos los permisos asignados
      if (hasSomeAppPermissions) {
        const assignedAppModels = {};
        
        Object.entries(appData.models || {}).forEach(([modelKey, modelData]) => {
          const hasAllModelPermissions = modelData.permissions.every(p => 
            formData.permisos.includes(p.id)
          );
          const hasSomeModelPermissions = modelData.permissions.some(p => 
            formData.permisos.includes(p.id)
          );
          
          // Solo incluir submódulos que tienen al menos algunos permisos
          if (hasSomeModelPermissions) {
            assignedAppModels[modelKey] = {
              ...modelData,
              permissions: modelData.permissions.filter(p => formData.permisos.includes(p.id))
            };
          }
        });
        
        if (Object.keys(assignedAppModels).length > 0) {
          assigned[appKey] = {
            ...appData,
            models: assignedAppModels,
            allPermissionsAssigned: hasAllAppPermissions
          };
        }
      }
    });
    
    return assigned;
  };

  const renderPermissionTree = (permissions, isAssigned = false) => {
    if (Object.keys(permissions).length === 0) {
      const message = isAssigned ? 'No hay permisos asignados' : 'No hay permisos disponibles';
      const subtitle = isAssigned ? 'Selecciona módulos de la columna izquierda' : 'Cargando permisos...';
      
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.012-3a7.5 7.5 0 11-9.775 9.775A7.5 7.5 0 0115.012 9z" />
            </svg>
            <p className="mt-2 text-sm">{message}</p>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1 p-3">
        {Object.entries(permissions).map(([appKey, appData]) => {
          const allAppPermissions = [];
          Object.values(appData.models || {}).forEach(modelData => {
            allAppPermissions.push(...modelData.permissions.map(p => p.id));
          });
          
          const hasAllAppPermissions = allAppPermissions.every(id => formData.permisos.includes(id));
          const hasSomeAppPermissions = allAppPermissions.some(id => formData.permisos.includes(id));
          const hasSubmodules = Object.keys(appData.models || {}).length > 0;

          return (
            <div key={appKey} className="border-b border-gray-100 last:border-b-0 pb-2">
              {/* Módulo Principal con checkbox y flecha */}
              <div className="flex items-center p-2 hover:bg-gray-50 rounded group">
                {/* Flecha de expansión (solo si tiene submódulos) */}
                {hasSubmodules ? (
                  <button
                    type="button"
                    onClick={() => toggleModuleExpanded(appKey)}
                    className="flex items-center justify-center w-4 h-4 mr-2 hover:bg-gray-200 rounded transition-colors"
                  >
                    <svg
                      className={`w-3 h-3 transform transition-transform text-gray-500 ${
                        expandedModules[appKey] ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <div className="w-4 h-4 mr-2"></div>
                )}
                
                {/* Checkbox del módulo principal */}
                <label className="flex items-center cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={hasAllAppPermissions}
                    ref={input => {
                      if (input) input.indeterminate = hasSomeAppPermissions && !hasAllAppPermissions;
                    }}
                    onChange={(e) => handleAppModuleChange(appData, e.target.checked)}
                    className="form-checkbox h-4 w-4 text-[#2D728F] rounded border-gray-300 focus:ring-[#2D728F] mr-3"
                    disabled={mode === 'view'}
                  />
                  <span className="text-sm font-medium text-gray-700">{appData.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({allAppPermissions.length} permisos)
                  </span>
                </label>
              </div>

              {/* Submódulos */}
              {hasSubmodules && expandedModules[appKey] && (
                <div className="ml-10 space-y-1 border-l-2 border-gray-100 pl-3">
                  {Object.entries(appData.models || {}).map(([modelKey, modelData]) => {
                    const hasAllModelPermissions = modelData.permissions.every(p => formData.permisos.includes(p.id));
                    const hasSomeModelPermissions = modelData.permissions.some(p => formData.permisos.includes(p.id));

                    return (
                      <label key={`${appKey}.${modelKey}`} className="flex items-center text-sm text-gray-600 cursor-pointer py-1 px-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={hasAllModelPermissions}
                          ref={input => {
                            if (input) input.indeterminate = hasSomeModelPermissions && !hasAllModelPermissions;
                          }}
                          onChange={(e) => handleModuleChange(modelData.permissions, e.target.checked)}
                          className="form-checkbox h-4 w-4 text-[#2D728F] rounded border-gray-300 focus:ring-[#2D728F] mr-3"
                          disabled={mode === 'view'}
                        />
                        <span className="select-none">{modelData.name}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({modelData.permissions.length} permisos)
                        </span>
                      </label>
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
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
      permissions: formData.permisos
    };

    onSubmit(dataToSubmit);
  };

  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';

  return (
    <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onCancel} 
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-[13px] font-semibold ml-2">Volver</span>
        </button>
        
        <h1 className="text-xl font-semibold text-gray-900">
          {mode === 'create' ? 'Crear Perfil' : mode === 'edit' ? 'Editar Perfil' : 'Ver Perfil'}
        </h1>
        
        <div></div> {/* Spacer */}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
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
                placeholder="Ej: Editor de Eventos"
                disabled={mode === 'view'}
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
                disabled={mode === 'view'}
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
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg text-[13px] transition-colors resize-none ${
                errors.descripcion
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              } focus:outline-none focus:ring-2`}
              placeholder="Ej: Puede gestionar eventos y categorías..."
              disabled={mode === 'view'}
            />
            {errors.descripcion && (
              <p className="mt-1 text-[11px] text-red-600">{errors.descripcion}</p>
            )}
          </div>
        </div>

        {/* Sistema de Permisos - Dos Columnas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Permisos del Panel
          </h3>
          
          {loadingPermissions ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D728F]"></div>
              <p className="text-gray-500 ml-3">Cargando permisos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {/* Columna Izquierda: Módulos Disponibles */}
              <div className="flex flex-col">
                <div className="bg-gray-50 p-3 rounded-t-lg border border-gray-200 border-b-0">
                  <h4 className="text-sm font-medium text-gray-700">
                    Módulos Disponibles
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Marca los módulos para dar acceso completo
                  </p>
                </div>
                <div className="border border-gray-200 rounded-b-lg h-80 overflow-y-auto bg-white">
                  {renderPermissionTree(availablePermissions)}
                </div>
              </div>

              {/* Columna Derecha: Módulos Asignados */}
              <div className="flex flex-col">
                <div className="bg-gray-50 p-3 rounded-t-lg border border-gray-200 border-b-0">
                  <h4 className="text-sm font-medium text-gray-700">
                    Módulos Asignados
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Módulos con acceso completo otorgado
                  </p>
                </div>
                <div className="border border-gray-200 rounded-b-lg h-80 overflow-y-auto bg-white">
                  {renderPermissionTree(getAssignedPermissions(), true)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        {mode !== 'view' && (
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-4 py-2 text-[13px] font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className={`px-4 py-2 text-[13px] font-semibold text-white rounded-lg transition-colors ${
                loading 
                  ? 'bg-[#2D728F]/70 cursor-not-allowed' 
                  : 'bg-[#2D728F] hover:bg-[#2D728F]/90'
              }`}
            >
              {loading ? 'Guardando...' : 'Grabar Perfil'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

ProfileFormNew.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit', 'view']),
  editingProfile: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default ProfileFormNew;
 