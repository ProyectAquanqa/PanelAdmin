/**
 * Modal para crear/editar/ver usuarios del sistema - VERSIÓN MEJORADA
 * Layout de 2 columnas con foto a la izquierda y checkboxes simples
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useUserForm } from '../../hooks/useUserForm';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

/**
 * Componente de modal para crear/editar/ver usuarios
 */
const UserModal = ({
  show,
  onClose,
  onSubmit,
  editingUser,
  loading,
  availableRoles = [],
  mode = 'edit' // 'create', 'edit', 'view'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [loadingDni, setLoadingDni] = useState(false);
  const [fieldsFromDni, setFieldsFromDni] = useState(false);
  const [groupsDisponibles, setGroupsDisponibles] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  
  // Usar hook de formulario
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    getInputProps,
    getCheckboxProps,
    getSelectProps,
    isValid,
    setFieldValue
  } = useUserForm(editingUser || {}, { 
    formType: mode === 'create' ? 'create' : 'edit' 
  });

  // Limpiar estados cuando cambie el usuario a editar o el modo
  useEffect(() => {
    setFieldsFromDni(false);
    setImagePreview(null);
    setLoadingDni(false);
  }, [editingUser, mode]);

  // Sin pre-selección automática de tipo_usuario (vista unificada)

  // Cargar grupos disponibles cuando cambie el tipo de usuario
  useEffect(() => {
    const loadGroups = async () => {
      if (!formData.tipo_usuario) {
        setGroupsDisponibles([]);
        return;
      }
      
      setLoadingGroups(true);
      try {
        const response = await userService.users.getGroupsDisponibles(formData.tipo_usuario);
        if (response.status === 'success') {
          setGroupsDisponibles(response.data.results || response.data || []);
        } else if (response.results) {
          // Formato directo del backend sin wrapper
          setGroupsDisponibles(response.results);
        } else {
          toast.error('Error al cargar grupos disponibles');
          setGroupsDisponibles([]);
        }
      } catch (error) {
        toast.error('Error al cargar grupos: ' + error.message);
        setGroupsDisponibles([]);
      } finally {
        setLoadingGroups(false);
      }
    };

    loadGroups();
  }, [formData.tipo_usuario]);

  // Manejar envío del formulario
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'view') {
      handleClose();
      return;
    }
    
    const result = await handleSubmit(onSubmit);
    
    if (result.success) {
      handleClose();
    }
  };

  // Manejar cierre del modal (limpiar estados)
  const handleClose = () => {
    setFieldsFromDni(false);
    setImagePreview(null);
    setLoadingDni(false);
    onClose();
  };



  // Autocompletar datos desde DNI usando el servicio real
  const handleDniBlur = async (dni) => {
    if (!dni || dni.length !== 8 || !dni.match(/^\d+$/)) {
      setFieldsFromDni(false);
      return;
    }
    
    setLoadingDni(true);
    try {
      const response = await userService.utils.consultarDni(dni);
      
      if (response.status === 'success') {
        const { nombres, apellido_paterno, apellido_materno } = response.data;
        
        // Autocompletar campos
        setFieldValue('first_name', nombres);
        setFieldValue('last_name', `${apellido_paterno} ${apellido_materno}`.trim());
        
        // Marcar que los campos fueron autocompletados
        setFieldsFromDni(true);
        
        toast.success('DNI encontrado. Datos cargados automáticamente.');
      } else {
        toast.error(response.message || 'Error al consultar DNI');
        setFieldsFromDni(false);
      }
      
    } catch (error) {
      toast.error(error.message || 'Error al consultar DNI');
      setFieldsFromDni(false);
    } finally {
      setLoadingDni(false);
    }
  };

  // Manejar upload de imagen
  const handleImageUpload = (e, imageType = 'foto_perfil') => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        setFieldValue(imageType, file);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!show) return null;

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header Minimalista */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                {isCreateMode && 'Crear Nuevo Usuario'}
                {isEditMode && 'Editar Usuario'}
                {isViewMode && 'Detalles del Usuario'}
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {isCreateMode && 'Completa los campos para registrar un nuevo usuario'}
                {isEditMode && 'Modifica los datos del usuario'}
                {isViewMode && 'Información completa del usuario'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="px-6 py-6">
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Columna Izquierda - Foto y Estados */}
                <div className="lg:col-span-1">
                  <div className="bg-slate-50/50 rounded-xl p-6 h-full flex flex-col justify-between border border-slate-200/50">
                    {/* Foto de perfil */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm overflow-hidden border-2 border-white shadow-lg transition-all duration-200 group-hover:shadow-xl">
                          {imagePreview || editingUser?.foto_perfil ? (
                            <img 
                              src={imagePreview || editingUser?.foto_perfil} 
                              alt="Foto de perfil"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg className="w-10 h-10 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          )}
                        </div>
                        {!isViewMode && (
                          <label className="absolute -bottom-1 -right-1 bg-slate-600 hover:bg-slate-700 text-white rounded-xl p-2 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'foto_perfil')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 text-center">Foto de perfil</p>
                    </div>

                    {/* Estados - Minimalista */}
                    <div className="space-y-4 mt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex-1">
                            <span className="text-[12px] font-medium text-slate-700">Usuario Activo</span>
                            <p className="text-[10px] text-slate-500">Puede acceder al sistema</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              {...getCheckboxProps('is_active')}
                              type="checkbox"
                              disabled={isViewMode}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <div className="flex-1">
                            <span className="text-[12px] font-medium text-slate-700">Personal Staff</span>
                            <p className="text-[10px] text-slate-500">Acceso al panel</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              {...getCheckboxProps('is_staff')}
                              type="checkbox"
                              disabled={isViewMode}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha - Formulario */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Información básica */}
                  <div className="space-y-5">
                    <h4 className="text-[14px] font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">Información Personal</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* DNI (Username) */}
                      <div className="space-y-2">
                        <label htmlFor="username" className="block text-[13px] font-semibold text-gray-700">
                          DNI <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...getInputProps('username')}
                            type="text"
                            placeholder="12345678"
                            maxLength="8"
                            disabled={isViewMode || isEditMode}
                            onBlur={(e) => {
                              if (isCreateMode && e.target.value) {
                                handleDniBlur(e.target.value);
                              }
                            }}
                            className={`w-full px-3 py-2.5 pr-10 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${
                              errors.username ? 'border-red-500 bg-red-50' : 'bg-white'
                            } ${(isViewMode || isEditMode) ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                          />
                          {loadingDni && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-500 border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                        {errors.username && (
                          <p className="text-[12px] text-red-600">{errors.username}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-[13px] font-semibold text-gray-700">
                          Email
                        </label>
                        <input
                          {...getInputProps('email')}
                          type="email"
                          placeholder="usuario@empresa.com"
                          disabled={isViewMode}
                          className={`w-full px-3 py-2.5 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${
                            errors.email ? 'border-red-500 bg-red-50' : 'bg-white'
                          } ${isViewMode ? 'bg-gray-50' : ''}`}
                        />
                        {errors.email && (
                          <p className="text-[12px] text-red-600">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nombres */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="first_name" className="block text-[13px] font-semibold text-gray-700">
                            Nombres <span className="text-red-500">*</span>
                            {fieldsFromDni && <span className="text-green-600 text-[11px] ml-1">(Autocompletado)</span>}
                          </label>
                          {fieldsFromDni && !isViewMode && (
                            <button
                              type="button"
                              onClick={() => {
                                setFieldsFromDni(false);
                                setFieldValue('first_name', '');
                                setFieldValue('last_name', '');
                                toast.info('Campos liberados para edición manual');
                              }}
                              className="text-[11px] text-slate-600 hover:text-slate-800 underline"
                            >
                              Editar manualmente
                            </button>
                          )}
                        </div>
                        <input
                          {...getInputProps('first_name')}
                          type="text"
                          placeholder="Juan Carlos"
                          disabled={isViewMode}
                          className={`w-full px-3 py-2.5 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${
                            errors.first_name ? 'border-red-500 bg-red-50' : 'bg-white'
                          } ${isViewMode ? 'bg-gray-50' : ''}`}
                        />
                        {errors.first_name && (
                          <p className="text-[12px] text-red-600">{errors.first_name}</p>
                        )}
                      </div>

                      {/* Apellidos */}
                      <div className="space-y-2">
                        <label htmlFor="last_name" className="block text-[13px] font-semibold text-gray-700">
                          Apellidos <span className="text-red-500">*</span>
                          {fieldsFromDni && <span className="text-green-600 text-[11px] ml-1">(Autocompletado)</span>}
                        </label>
                        <input
                          {...getInputProps('last_name')}
                          type="text"
                          placeholder="Pérez Rodríguez"
                          disabled={isViewMode}
                          className={`w-full px-3 py-2.5 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${
                            errors.last_name ? 'border-red-500 bg-red-50' : 'bg-white'
                          } ${isViewMode ? 'bg-gray-50' : ''}`}
                        />
                        {errors.last_name && (
                          <p className="text-[12px] text-red-600">{errors.last_name}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contraseñas (solo para crear) */}
                  {isCreateMode && (
                    <div className="space-y-5">
                      <h4 className="text-[14px] font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">Seguridad</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="password" className="block text-[13px] font-semibold text-gray-700">
                            Contraseña <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              {...getInputProps('password')}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Mínimo 6 caracteres"
                              className={`w-full px-3 py-2.5 pr-10 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${
                                errors.password ? 'border-red-500 bg-red-50' : 'bg-white'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {showPassword ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                )}
                              </svg>
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-[12px] text-red-600">{errors.password}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="confirmPassword" className="block text-[13px] font-semibold text-gray-700">
                            Confirmar Contraseña <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...getInputProps('confirmPassword')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Repetir contraseña"
                            className={`w-full px-3 py-2.5 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${
                              errors.confirmPassword ? 'border-red-500 bg-red-50' : 'bg-white'
                            }`}
                          />
                          {errors.confirmPassword && (
                            <p className="text-[12px] text-red-600">{errors.confirmPassword}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}



                  {/* Sistema de Grupos - Nuevo sistema basado en backend */}
                  <div className="space-y-5">
                    <h4 className="text-[14px] font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">Sistema de Perfiles</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tipo de Usuario */}
                      <div className="space-y-2">
                        <label htmlFor="tipo_usuario" className="block text-[13px] font-semibold text-gray-700">
                          Tipo de Usuario <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...getSelectProps('tipo_usuario')}
                                  disabled={isViewMode}
                          className={`w-full px-3 py-2.5 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${
                            errors.tipo_usuario ? 'border-red-500 bg-red-50' : 'bg-white'
                          } ${isViewMode ? 'bg-gray-50' : ''}`}
                        >
                          <option value="">Seleccionar tipo</option>
                          <option value="ADMIN">Administrativo</option>
                          <option value="TRABAJADOR">Trabajador</option>
                        </select>
                        {errors.tipo_usuario && (
                          <p className="text-[12px] text-red-600">{errors.tipo_usuario}</p>
                        )}
                      </div>

                      {/* Grupo (perfil) */}
                      <div className="space-y-2">
                        <label htmlFor="groups" className="block text-[13px] font-semibold text-gray-700">
                          Perfil <span className="text-red-500">*</span>
                              </label>
                        <select
                          {...getSelectProps('groups_ids')}
                          disabled={isViewMode || !formData.tipo_usuario || loadingGroups}
                          className={`w-full px-3 py-2.5 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${
                            errors.groups ? 'border-red-500 bg-red-50' : 'bg-white'
                          } ${(isViewMode || !formData.tipo_usuario) ? 'bg-gray-50' : ''}`}
                        >
                          <option value="">
                            {loadingGroups ? 'Cargando perfiles...' : 
                             !formData.tipo_usuario ? 'Selecciona tipo de usuario primero' : 
                             'Seleccionar perfil'}
                          </option>
                          {groupsDisponibles.map(group => (
                            <option key={group.id} value={group.id}>
                              {group.nombre || group.name}
                            </option>
                          ))}
                        </select>
                        {errors.groups_ids && (
                          <p className="text-[12px] text-red-600">{errors.groups_ids}</p>
                        )}
                      </div>
                          </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Empresa */}
                      <div className="space-y-2">
                        <label htmlFor="empresa" className="block text-[13px] font-semibold text-gray-700">
                          Empresa
                        </label>
                        <input
                          {...getInputProps('empresa')}
                          type="text"
                          placeholder="Nombre de la empresa"
                          disabled={isViewMode}
                          className={`w-full px-3 py-2.5 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${
                            errors.empresa ? 'border-red-500 bg-red-50' : 'bg-white'
                          } ${isViewMode ? 'bg-gray-50' : ''}`}
                        />
                        {errors.empresa && (
                          <p className="text-[12px] text-red-600">{errors.empresa}</p>
                        )}
                          </div>

                      {/* Departamento */}
                      <div className="space-y-2">
                        <label htmlFor="departamento" className="block text-[13px] font-semibold text-gray-700">
                          Departamento
                        </label>
                        <input
                          {...getInputProps('departamento')}
                          type="text"
                          placeholder="Departamento"
                          disabled={isViewMode}
                          className={`w-full px-3 py-2.5 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${
                            errors.departamento ? 'border-red-500 bg-red-50' : 'bg-white'
                          } ${isViewMode ? 'bg-gray-50' : ''}`}
                        />
                        {errors.departamento && (
                          <p className="text-[12px] text-red-600">{errors.departamento}</p>
                        )}
                      </div>
                    </div>

                    {/* Código de Empleado */}
                    <div className="space-y-2">
                      <label htmlFor="codigo_empleado" className="block text-[13px] font-semibold text-gray-700">
                        Código de Empleado
                      </label>
                      <input
                        {...getInputProps('codigo_empleado')}
                        type="text"
                        placeholder="Código único del empleado"
                        disabled={isViewMode}
                        className={`w-full px-3 py-2.5 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all ${
                          errors.codigo_empleado ? 'border-red-500 bg-red-50' : 'bg-white'
                        } ${isViewMode ? 'bg-gray-50' : ''}`}
                      />
                      {errors.codigo_empleado && (
                        <p className="text-[12px] text-red-600">{errors.codigo_empleado}</p>
                      )}
                    </div>

                    {/* Accesos Web y Móvil */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <span className="text-[12px] font-medium text-slate-700">Acceso Web</span>
                          <p className="text-[10px] text-slate-500">Puede acceder vía interfaz web</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            {...getCheckboxProps('acceso_web_activo')}
                            type="checkbox"
                            disabled={isViewMode}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <span className="text-[12px] font-medium text-slate-700">Acceso Móvil</span>
                          <p className="text-[10px] text-slate-500">Puede acceder vía app móvil</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            {...getCheckboxProps('acceso_movil_activo')}
                            type="checkbox"
                            disabled={isViewMode}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Información adicional (solo vista) */}
                  {isViewMode && editingUser && (
                    <div className="space-y-5">
                      <h4 className="text-[14px] font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">Información del Sistema</h4>
                      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                          <div className="flex justify-between">
                            <span className="text-slate-600 font-medium">Registrado:</span>
                            <span className="text-slate-800">
                              {editingUser.date_joined_formatted || new Date(editingUser.date_joined).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 font-medium">Último acceso:</span>
                            <span className="text-slate-800">
                              {editingUser.last_login_formatted || 'Nunca'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 font-medium">ID:</span>
                            <span className="text-slate-800">#{editingUser.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 font-medium">Tipo:</span>
                            <span className="text-slate-800">{editingUser.tipo_usuario === 'ADMIN' ? 'Administrativo' : 'Trabajador'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              {isViewMode ? 'Cerrar' : 'Cancelar'}
            </button>
            
            {!isViewMode && (
              <button
                type="submit"
                onClick={handleFormSubmit}
                disabled={loading || !isValid}
                className={`px-5 py-2.5 text-[13px] font-medium text-white rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                  loading || !isValid
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-slate-500 hover:bg-slate-600 shadow-sm hover:shadow-md'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando...</span>
                  </div>
                ) : (
                  isCreateMode ? 'Crear Usuario' : 'Guardar Cambios'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

UserModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingUser: PropTypes.object,
  loading: PropTypes.bool,
  availableRoles: PropTypes.array,
  mode: PropTypes.oneOf(['create', 'edit', 'view'])
};

export default UserModal;