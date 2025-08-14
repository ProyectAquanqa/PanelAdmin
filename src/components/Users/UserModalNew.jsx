/**
 * Modal para crear/editar usuarios del sistema - DISEÑO MEJORADO
 * Siguiendo el patrón de los modales de "ver detalles" con sistema de pestañas limpio
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useUserForm } from '../../hooks/useUserForm';
// import { useAreas } from '../../hooks/useAreas'; // Removido para evitar múltiples instancias
import userService from '../../services/userService';
import toast from 'react-hot-toast';

/**
 * Componente principal del modal de usuarios con diseño mejorado
 */
const UserModal = ({
  show,
  onClose,
  onSubmit,
  editingUser,
  loading,
  availableRoles = [],
  availableCargos = [],
  mode = 'create' // 'create', 'edit', 'view'
}) => {
  // Estados de UI
  const [activeTab, setActiveTab] = useState('datos');
  const [loadingDni, setLoadingDni] = useState(false);
  const [fieldsFromDni, setFieldsFromDni] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados de datos
  const [groupsDisponibles, setGroupsDisponibles] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  
  // Los cargos ahora se reciben como prop para evitar múltiples instancias de useAreas
  // const { cargos, fetchCargos, fetchAreasWithCargos } = useAreas(); // Removido
  
  // Hook de formulario
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    getInputProps,
    getCheckboxProps,
    getSelectProps,
    isValid,
    setFieldValue,
    resetForm
  } = useUserForm(editingUser || {}, { 
    formType: mode === 'create' ? 'create' : 'edit' 
  });

  // Función para obtener el tipo de usuario basado en el grupo seleccionado
  const getTipoUsuarioFromGroup = useCallback(() => {
    if (!Array.isArray(formData.groups) || formData.groups.length === 0) {
      return 'Sin definir';
    }
    
    const groupName = formData.groups[0];
    
    // Grupos administrativos
    const adminGroups = [
      'Administrador de Contenido',
      'Editor de Contenido', 
      'Gestor de Chatbot',
      'Admin',
      'Administrador'
    ];
    
    if (adminGroups.includes(groupName)) {
      return 'Administrativo';
    } else if (groupName === 'Trabajador') {
      return 'Trabajador';
    } else {
      return 'Sin definir';
    }
  }, [formData.groups]);

  // Configuración de pestañas sin emojis
  const tabs = [
    { 
      id: 'datos', 
      label: 'Datos Personales', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'acceso', 
      label: 'Acceso y Perfil', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    { 
      id: 'organizacion', 
      label: 'Organización', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ];

  // Estados derivados
  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';

  // Función para obtener errores por pestaña
  const getTabErrors = (tabId) => {
    const tabFields = {
      datos: ['username', 'first_name', 'last_name', 'email', 'foto_perfil'],
      acceso: ['password', 'confirmPassword', 'groups', 'is_active'],
      organizacion: ['cargo', 'empresa']
    };
    
    return Object.keys(errors).filter(field => tabFields[tabId]?.includes(field));
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (!show) return;

    const loadInitialData = async () => {
      // Cargar grupos
      setLoadingGroups(true);
      try {
        const response = await userService.groups.list();
        if (response.status === 'success') {
          setGroupsDisponibles(response.data || []);
        } else if (Array.isArray(response)) {
          setGroupsDisponibles(response);
        }
      } catch (error) {
        toast.error('Error al cargar grupos: ' + error.message);
        setGroupsDisponibles([]);
      } finally {
        setLoadingGroups(false);
      }

      // Los cargos se pasan como prop availableCargos, no necesitamos cargarlos aquí
      console.log('📋 Cargos disponibles desde props:', availableCargos);
    };

    loadInitialData();
  }, [show]); // Solo depende de show ya que los cargos vienen como props

  // Limpiar estados cuando cambie el modo o usuario
  useEffect(() => {
    setFieldsFromDni(false);
    setLoadingDni(false);
    setActiveTab('datos');
  }, [editingUser, mode]);

  // Manejar cierre del modal
  const handleClose = useCallback(() => {
    setFieldsFromDni(false);
    setLoadingDni(false);
    setActiveTab('datos');
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Manejar envío del formulario con corrección de grupos
  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (mode === 'view') {
      handleClose();
      return;
    }
    
    try {
      console.log('📝 Iniciando envío del formulario, modo:', mode);
      console.log('📝 Datos del formulario:', formData);
      
      const result = await handleSubmit(onSubmit);
      
      if (result.success) {
        console.log('✅ Formulario enviado exitosamente');
        handleClose();
      } else {
        console.log('❌ Error en el envío del formulario:', result);
        if (result.error) {
          toast.error(`Error: ${result.error.message || 'Error desconocido'}`);
        }
      }
    } catch (error) {
      console.error('❌ Error capturado en handleFormSubmit:', error);
      toast.error(`Error inesperado: ${error.message}`);
    }
  }, [mode, handleSubmit, onSubmit, handleClose, formData]);

  // Consultar DNI
  const handleDniBlur = useCallback(async (dni) => {
    if (!dni || dni.length !== 8 || !dni.match(/^\d+$/)) {
      setFieldsFromDni(false);
      return;
    }
    
    setLoadingDni(true);
    try {
      const response = await userService.utils.consultarDni(dni);
      
      if (response.status === 'success') {
        const { nombres, apellido_paterno, apellido_materno } = response.data;
        
        setFieldValue('first_name', nombres);
        setFieldValue('last_name', `${apellido_paterno} ${apellido_materno}`.trim());
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
  }, [setFieldValue]);

  // Renderizado de pestaña Datos Personales
  const renderDatosPersonales = () => (
    <div className="space-y-4">
      {/* Header de sección */}
      <div className="pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
            Información Personal
          </h4>
        </div>
      </div>

      {/* DNI */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">DNI (Usuario)</h5>
        </div>
        <div className="p-3 space-y-2">
          <div className="relative">
            <input
              {...getInputProps('username')}
              type="text"
              placeholder="12345678"
              maxLength={8}
              onBlur={(e) => handleDniBlur(e.target.value)}
              className={`w-full px-4 py-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 ${
                errors.username ? 'border-red-300 bg-red-50' : 'bg-white'
              } ${loadingDni ? 'pr-10' : ''}`}
            />
            {loadingDni && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          {errors.username && (
            <p className="text-[13px] text-red-600">{errors.username}</p>
          )}
          <p className="text-[13px] text-gray-500">
            El DNI será usado como nombre de usuario para el sistema
          </p>
        </div>
      </div>

      {/* Nombres */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Nombres</h5>
          </div>
          <div className="p-3 space-y-2">
            <input
              {...getInputProps('first_name')}
              type="text"
              placeholder="Juan Carlos"
              readOnly={fieldsFromDni}
              className={`w-full px-4 py-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 ${
                errors.first_name ? 'border-red-300 bg-red-50' : 
                fieldsFromDni ? 'bg-green-50 border-green-200' : 'bg-white'
              }`}
            />
            {errors.first_name && (
              <p className="text-[13px] text-red-600">{errors.first_name}</p>
            )}
            {fieldsFromDni && (
              <p className="text-[13px] text-green-600 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Obtenido del DNI
              </p>
            )}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Apellidos</h5>
          </div>
          <div className="p-3 space-y-2">
            <input
              {...getInputProps('last_name')}
              type="text"
              placeholder="Pérez García"
              readOnly={fieldsFromDni}
              className={`w-full px-4 py-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 ${
                errors.last_name ? 'border-red-300 bg-red-50' : 
                fieldsFromDni ? 'bg-green-50 border-green-200' : 'bg-white'
              }`}
            />
            {errors.last_name && (
              <p className="text-[13px] text-red-600">{errors.last_name}</p>
            )}
            {fieldsFromDni && (
              <p className="text-[13px] text-green-600 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Obtenido del DNI
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Correo Electrónico</h5>
        </div>
        <div className="p-3 space-y-2">
          <input
            {...getInputProps('email')}
            type="email"
            placeholder="juan.perez@empresa.com"
            className={`w-full px-4 py-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 ${
              errors.email ? 'border-red-300 bg-red-50' : 'bg-white'
            }`}
          />
          {errors.email && (
            <p className="text-[13px] text-red-600">{errors.email}</p>
          )}
          <p className="text-[13px] text-gray-500">
            Correo para notificaciones del sistema
          </p>
        </div>
      </div>

      {fieldsFromDni && (
        <div className="border border-green-200 bg-green-50 rounded-lg overflow-hidden">
          <div className="bg-green-100 px-4 py-2 border-b border-green-200">
            <h5 className="text-[13px] font-bold text-green-800 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Datos Verificados
            </h5>
          </div>
          <div className="p-3">
            <p className="text-[13px] text-green-800 leading-relaxed">
              Los nombres y apellidos han sido obtenidos automáticamente desde RENIEC. 
              Puedes limpiar estos campos si necesitas modificarlos manualmente.
            </p>
            <button
              type="button"
              onClick={() => {
                setFieldsFromDni(false);
                setFieldValue('first_name', '');
                setFieldValue('last_name', '');
                toast.info('Campos liberados para edición manual');
              }}
              className="mt-2 px-3 py-1.5 text-[13px] font-medium text-green-700 bg-white border border-green-300 rounded hover:bg-green-50 transition-colors"
            >
              Limpiar y editar manualmente
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Renderizado de pestaña Acceso y Perfil
  const renderAccesoPerfil = () => (
    <div className="space-y-4">
      {/* Header de sección */}
      <div className="pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
            Configuración de Acceso
          </h4>
        </div>
      </div>

      {/* Contraseñas (para creación y edición) */}
      {isEditMode && (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg overflow-hidden mb-4">
          <div className="bg-yellow-100 px-4 py-2 border-b border-yellow-200">
            <h5 className="text-[13px] font-bold text-yellow-800 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Cambio de Contraseña
            </h5>
          </div>
          <div className="p-3">
            <p className="text-[13px] text-yellow-800 leading-relaxed">
              Complete estos campos solo si desea cambiar la contraseña del usuario. 
              Si deja los campos vacíos, la contraseña actual se mantendrá sin cambios.
            </p>
          </div>
        </div>
      )}
      
      {(isCreateMode || isEditMode) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Contraseña</h5>
            </div>
            <div className="p-3 space-y-2">
              <div className="relative">
                <input
                  {...getInputProps('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isCreateMode ? "Mínimo 6 caracteres" : "Nueva contraseña (opcional)"}
                  className={`w-full px-4 py-3 pr-10 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'bg-white'
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
                <p className="text-[13px] text-red-600">{errors.password}</p>
              )}
              <p className="text-[13px] text-gray-500">
                {isCreateMode 
                  ? "Debe tener al menos 6 caracteres" 
                  : "Dejar vacío para mantener la contraseña actual"
                }
              </p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Confirmar Contraseña</h5>
            </div>
            <div className="p-3 space-y-2">
              <input
                {...getInputProps('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder={isCreateMode ? "Repetir contraseña" : "Confirmar nueva contraseña"}
                className={`w-full px-4 py-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 ${
                  errors.confirmPassword ? 'border-red-300 bg-red-50' : 'bg-white'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-[13px] text-red-600">{errors.confirmPassword}</p>
              )}
              <p className="text-[13px] text-gray-500">
                {isCreateMode 
                  ? "Debe coincidir con la contraseña" 
                  : "Solo requerido si cambia la contraseña"
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Perfil/Rol */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Perfil del Usuario</h5>
        </div>
        <div className="p-3 space-y-3">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Grupo/Rol</label>
            <select
              name="groups"
              disabled={isViewMode || loadingGroups}
              value={
                // Mostrar el ID del grupo seleccionado en el UI
                Array.isArray(formData.groups) && formData.groups.length > 0 
                  ? (() => {
                      // Si formData.groups contiene nombres, buscar el ID correspondiente
                      const groupName = formData.groups[0];
                      const group = groupsDisponibles.find(g => g.name === groupName);
                      return group ? String(group.id) : '';
                    })()
                  : ''
              }
              onChange={(e) => {
                const groupId = e.target.value;
                if (groupId) {
                  // Buscar el nombre del grupo seleccionado
                  const selectedGroup = groupsDisponibles.find(g => g.id == groupId);
                  const groupName = selectedGroup ? selectedGroup.name : '';
                  // El backend espera el NOMBRE del grupo, no el ID
                  setFieldValue('groups', [groupName]); // Enviar como array de nombres
                } else {
                  setFieldValue('groups', []); // Array vacío si no hay selección
                }
              }}
              className={`w-full px-4 py-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 ${
                errors.groups ? 'border-red-300 bg-red-50' : 'bg-white'
              } ${(isViewMode || loadingGroups) ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {loadingGroups ? 'Cargando perfiles...' : 'Seleccionar perfil/rol'}
              </option>
              {groupsDisponibles.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {errors.groups && (
              <p className="text-[13px] text-red-600">{errors.groups}</p>
            )}
          </div>
          
                    {/* Descripción del tipo de usuario (solo cuando hay grupo seleccionado) */}
          {getTipoUsuarioFromGroup() !== 'Sin definir' && (
            <div className="mt-2 p-3 rounded-lg border bg-gray-50 border-gray-200">
              <div className="flex items-start gap-2">
                <span className={`w-2 h-2 rounded-full mt-1.5 ${
                  getTipoUsuarioFromGroup() === 'Administrativo' ? 'bg-blue-500' : 'bg-gray-500'
                }`}></span>
                <div>
                  <p className="text-[13px] font-medium text-gray-800">
                    Tipo: {getTipoUsuarioFromGroup()}
                  </p>
                  <p className="text-[12px] text-gray-600">
                    {getTipoUsuarioFromGroup() === 'Administrativo' ?
                      'Este usuario podrá acceder al panel administrativo' :
                      'Este usuario solo podrá usar la aplicación móvil'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estado del usuario */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Estado del Usuario</h5>
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[13px] font-medium text-gray-700">Usuario Activo</span>
              <p className="text-[13px] text-gray-500 mt-1">Determina si puede acceder al sistema</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                {...getCheckboxProps('is_active')}
                type="checkbox"
                disabled={isViewMode}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
              </div>
              <span className="ml-3 text-[13px] font-medium text-gray-700">
                {formData.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizado de pestaña Organización
  const renderOrganizacion = () => (
    <div className="space-y-4">
      {/* Header de sección */}
      <div className="pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
            Información Organizacional
          </h4>
        </div>
      </div>

      {/* Cargo - DINÁMICO DESDE ÁREAS */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Cargo</h5>
        </div>
        <div className="p-3 space-y-2">
          <select
            {...getSelectProps('cargo')}
            disabled={isViewMode}
            className={`w-full px-4 py-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 ${
              errors.cargo ? 'border-red-300 bg-red-50' : 'bg-white'
            } ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          >
            <option value="">Seleccionar cargo</option>
            {availableCargos.map(cargo => (
              <option key={cargo.id} value={cargo.id}>
                {cargo.nombre} - {cargo.area_nombre || 'Sin área'}
              </option>
            ))}
          </select>
          {errors.cargo && (
            <p className="text-[13px] text-red-600">{errors.cargo}</p>
          )}
          <p className="text-[13px] text-gray-500">
            Los cargos se obtienen dinámicamente de las áreas configuradas
          </p>
        </div>
      </div>

      {/* Información sobre cargos */}
      <div className="border border-blue-200 bg-blue-50 rounded-lg overflow-hidden">
        <div className="bg-blue-100 px-4 py-2 border-b border-blue-200">
          <h5 className="text-[13px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Información de Cargos
          </h5>
        </div>
        <div className="p-3">
          <p className="text-[13px] text-blue-800 leading-relaxed">
            Los cargos disponibles se cargan automáticamente desde las áreas organizacionales configuradas en el sistema.
            Cada cargo está asociado a un área específica, lo que permite una mejor organización y asignación de responsabilidades.
          </p>
          {availableCargos.length === 0 && (
            <p className="text-[13px] text-blue-700 mt-2">
              <strong>Nota:</strong> No hay cargos disponibles. Asegúrate de que existan áreas con cargos configurados.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[1000px] h-[700px] flex flex-col max-w-[95vw] max-h-[95vh]">
        {/* Header Profesional - siguiendo patrón de modales de detalles */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                {isCreateMode && 'Crear Nuevo Usuario'}
                {isEditMode && 'Editar Usuario'}
                {isViewMode && 'Detalles del Usuario'}
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {isCreateMode && 'Completa la información en las pestañas para registrar un nuevo usuario'}
                {isEditMode && 'Modifica la información del usuario en las pestañas correspondientes'}
                {isViewMode && 'Información completa del usuario organizada por categorías'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sistema de Pestañas Mejorado */}
        <div className="bg-gray-50/80 border-b border-gray-200 flex-shrink-0">
          <div className="px-6">
            <nav className="flex space-x-0" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                              disabled={isViewMode}
                  className={`
                    flex items-center px-5 py-3 text-[13px] font-medium border-b-2 transition-all duration-200
                    ${activeTab === tab.id 
                      ? 'border-blue-600 text-blue-700 bg-white shadow-sm' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white/60'
                    }
                    ${isViewMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {errors && Object.keys(errors).length > 0 && getTabErrors(tab.id).length > 0 && (
                    <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              ))}
            </nav>
                      </div>
                    </div>

        {/* Contenido de las pestañas */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{minHeight: '0'}}>
          <form onSubmit={handleFormSubmit}>
            {activeTab === 'datos' && renderDatosPersonales()}
            {activeTab === 'acceso' && renderAccesoPerfil()}
            {activeTab === 'organizacion' && renderOrganizacion()}
            </form>
        </div>

        {/* Footer - siguiendo patrón de modales de detalles */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Indicador de pestaña con estado */}
            <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
                <span className="text-[13px] text-gray-600 font-medium">
                Pestaña {tabs.findIndex(tab => tab.id === activeTab) + 1} de {tabs.length}
              </span>
                <span className="text-[13px] text-gray-500">
                ({tabs.find(tab => tab.id === activeTab)?.label})
              </span>
              </div>
              {/* Indicador de validación */}
              {!isValid && (
                <div className="flex items-center text-[13px] text-red-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Faltan campos obligatorios
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleClose}
                className="px-5 py-2.5 text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            >
                Cancelar
            </button>
            
            {!isViewMode && (
              <button
                type="submit"
                disabled={loading || !isValid}
                  onClick={handleFormSubmit}
                  className={`px-6 py-2.5 text-[13px] font-medium text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  loading || !isValid
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando...</span>
                  </div>
                ) : (
                    <>
                      {isCreateMode ? 'Crear Usuario' : 'Guardar Cambios'}
                    </>
                )}
              </button>
            )}
            </div>
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
  availableCargos: PropTypes.array,
  mode: PropTypes.oneOf(['create', 'edit', 'view'])
};

export default UserModal;
