/**
 * Modal para crear/editar usuarios del sistema - DISEÑO MEJORADO
 * Siguiendo el patrón de los modales de "ver detalles" con sistema de pestañas limpio
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  
  // Estados para búsqueda de cargos (movido aquí para evitar temporal dead zone)
  const [cargoSearch, setCargoSearch] = useState('');
  const [showCargoDropdown, setShowCargoDropdown] = useState(false);
  const cargoDropdownRef = useRef(null);
  
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
      datos: ['username', 'first_name', 'last_name', 'email'], // Removí foto_perfil y firma de obligatorios
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
    setCargoSearch('');
    setShowCargoDropdown(false);
  }, [editingUser, mode]);

  // Sincronizar búsqueda de cargo con valor seleccionado - Solo cuando se selecciona un cargo
  useEffect(() => {
    if (formData.cargo && availableCargos.length > 0) {
      const selectedCargo = availableCargos.find(c => c.id == formData.cargo);
      if (selectedCargo && cargoSearch !== selectedCargo.nombre) {
        setCargoSearch(selectedCargo.nombre);
      }
    }
    // Removido: NO borrar cargoSearch cuando no hay cargo seleccionado
    // Esto permitía que el usuario escriba libremente para buscar
  }, [formData.cargo, availableCargos]); // Removido cargoSearch de las dependencias

  // Manejar cierre del modal
  const handleClose = useCallback(() => {
    setFieldsFromDni(false);
    setLoadingDni(false);
    setActiveTab('datos');
    setCargoSearch('');
    setShowCargoDropdown(false);
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
      const result = await handleSubmit(onSubmit);
      
      if (result.success) {
        // Solo cerrar el modal en caso de éxito
        handleClose();
      } else {
        // NO cerrar el modal, solo mostrar errores
        if (result.error) {
          // Parsear errores específicos del servidor
          const errorMessage = result.error.message || 'Error desconocido';
          
          if (errorMessage.includes('Ya existe un usuario con este nombre')) {
            toast.error('Este documento de identidad ya está registrado. Por favor, usa otro documento.');
            // Enfocar el campo de username para facilitar la corrección
            setTimeout(() => {
              const usernameField = document.querySelector('input[name="username"]');
              if (usernameField) usernameField.focus();
            }, 100);
          } else if (errorMessage.includes('foto_perfil') || errorMessage.includes('firma')) {
            toast.error('Error al subir archivos. Verifica que sean imágenes válidas (JPG, PNG).');
          } else if (errorMessage.includes('sesión ha expirado') || errorMessage.includes('autenticación no se proveyeron')) {
            toast.error('Tu sesión ha expirado. La página se recargará para que puedas iniciar sesión nuevamente.');
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          } else {
            toast.error(`Error: ${errorMessage}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error capturado en handleFormSubmit:', error);
      // NO cerrar el modal en caso de error
      if (error.message.includes('Ya existe un usuario con este nombre')) {
        toast.error('Este documento de identidad ya está registrado. Por favor, usa otro documento.');
        setTimeout(() => {
          const usernameField = document.querySelector('input[name="username"]');
          if (usernameField) usernameField.focus();
        }, 100);
      } else if (error.message.includes('foto_perfil') || error.message.includes('firma')) {
        toast.error('Error al subir archivos. Verifica que sean imágenes válidas (JPG, PNG).');
      } else if (error.message.includes('sesión ha expirado') || error.message.includes('autenticación no se proveyeron')) {
        toast.error('Tu sesión ha expirado. La página se recargará para que puedas iniciar sesión nuevamente.');
        // Recargar la página después de 3 segundos para forzar el relogin
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  }, [mode, handleSubmit, onSubmit, handleClose, formData]);

  // Consultar DNI (solo para DNIs peruanos de 8 dígitos)
  const handleConsultarDocumento = useCallback(async (documento) => {
    // Solo consultar API si es DNI peruano (8 dígitos numéricos)
    if (!documento || documento.length !== 8 || !documento.match(/^\d+$/)) {
      setFieldsFromDni(false);
      return;
    }
    
    setLoadingDni(true);
    try {
      const response = await userService.utils.consultarDni(documento);
      
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

  // Manejar tecla ENTER en campo de documento
  const handleDocumentoKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConsultarDocumento(e.target.value);
    }
  }, [handleConsultarDocumento]);

  // Renderizado de pestaña Datos Personales
  const renderDatosPersonales = () => (
    <div className="h-full">
      {/* Layout de 2 columnas optimizado */}
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Columna Izquierda - Foto de Perfil */}
        <div className="col-span-4 flex flex-col justify-center pt-4">
          <div className="space-y-4">
            {/* Foto de Perfil - Clickeable */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Foto de Perfil
              </label>
              
              <div className="relative">
                <input
                  id="foto_perfil_input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFieldValue('foto_perfil', file);
                  }}
                  disabled={isViewMode}
                  className="hidden"
                />
                <label 
                  htmlFor="foto_perfil_input"
                  className={`block w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer ${
                    isViewMode ? 'cursor-not-allowed opacity-50' : ''
                  } ${formData.foto_perfil ? 'border-green-400 bg-green-50' : ''}`}
                >
                  <div className="flex flex-col items-center justify-center h-full p-3">
                    {formData.foto_perfil ? (
                      typeof formData.foto_perfil === 'string' ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={formData.foto_perfil} 
                            alt="Foto de perfil" 
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                            <span className="text-white text-xs opacity-0 hover:opacity-100 transition-opacity">
                              Cambiar foto
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full h-full">
                          <img 
                            src={URL.createObjectURL(formData.foto_perfil)} 
                            alt="Preview foto de perfil" 
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                            <span className="text-white text-xs opacity-0 hover:opacity-100 transition-opacity">
                              Cambiar foto
                            </span>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="text-center">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-xs text-gray-600 font-medium mb-1">Subir foto de perfil</p>
                        <p className="text-xs text-gray-500">JPG, PNG - Click para seleccionar</p>
                      </div>
                    )}
                  </div>
                </label>
                
                {errors.foto_perfil && (
                  <p className="text-xs text-red-600 mt-1">{errors.foto_perfil}</p>
                )}
              </div>
            </div>
            
            {/* Firma Digital - Clickeable */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Firma Digital
              </label>
              
              <div className="relative">
                <input
                  id="firma_input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFieldValue('firma', file);
                  }}
                  disabled={isViewMode}
                  className="hidden"
                />
                <label 
                  htmlFor="firma_input"
                  className={`block w-full h-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer ${
                    isViewMode ? 'cursor-not-allowed opacity-50' : ''
                  } ${formData.firma ? 'border-green-400 bg-green-50' : ''}`}
                >
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    {formData.firma ? (
                      typeof formData.firma === 'string' ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={formData.firma} 
                            alt="Firma digital" 
                            className="w-full h-full object-contain rounded"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                            <span className="text-white text-xs opacity-0 hover:opacity-100 transition-opacity">
                              Cambiar firma
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full h-full">
                          <img 
                            src={URL.createObjectURL(formData.firma)} 
                            alt="Preview firma digital" 
                            className="w-full h-full object-contain rounded"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                            <span className="text-white text-xs opacity-0 hover:opacity-100 transition-opacity">
                              Cambiar firma
                            </span>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="text-center">
                        <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <p className="text-xs text-gray-600 font-medium mb-1">Subir firma</p>
                        <p className="text-xs text-gray-500">JPG, PNG - Click aquí</p>
                      </div>
                    )}
                  </div>
                </label>
                
                {errors.firma && (
                  <p className="text-xs text-red-600 mt-1">{errors.firma}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Datos del Usuario */}
        <div className="col-span-8 flex flex-col justify-start pt-4">
          <div className="space-y-4">
            {/* DNI */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Documento de Identidad
              </label>
              <div className="relative">
                <input
                  {...getInputProps('username')}
                  type="text"
                  placeholder="12345678, CE12345678, etc."
                  onKeyDown={handleDocumentoKeyDown}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.username ? 'border-red-500 bg-red-50 pr-10' : 'border-gray-300 bg-white'
                  } ${loadingDni ? 'pr-10' : ''}`}
                />
                {errors.username && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 group">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute right-0 top-full mt-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {errors.username}
                      <div className="absolute right-1 bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-red-500"></div>
                    </div>
                  </div>
                )}
                {loadingDni && (
                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                DNI, Carnet de Extranjería, etc. Presiona ENTER para consultar datos
              </p>
            </div>

            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombres
                </label>
                <div className="relative">
                  <input
                    {...getInputProps('first_name')}
                    type="text"
                    placeholder="Juan Carlos"
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.first_name ? 'border-red-500 bg-red-50 pr-10' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {errors.first_name && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 group">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="absolute right-0 top-full mt-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {errors.first_name}
                        <div className="absolute right-1 bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-red-500"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Apellidos
                </label>
                <div className="relative">
                  <input
                    {...getInputProps('last_name')}
                    type="text"
                    placeholder="Pérez García"
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.last_name ? 'border-red-500 bg-red-50 pr-10' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {errors.last_name && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 group">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="absolute right-0 top-full mt-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {errors.last_name}
                        <div className="absolute right-1 bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-red-500"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  {...getInputProps('email')}
                  type="email"
                  placeholder="juan.perez@empresa.com"
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email ? 'border-red-500 bg-red-50 pr-10' : 'border-gray-300 bg-white'
                  }`}
                />
                {errors.email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 group">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute right-0 top-full mt-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {errors.email}
                      <div className="absolute right-1 bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-red-500"></div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Correo electrónico corporativo
              </p>
            </div>


          </div>
        </div>
      </div>
    </div>
  );

  // Renderizado de pestaña Acceso y Perfil
  const renderAccesoPerfil = () => (
    <div className="space-y-4">
      {/* Advertencia para edición */}
      {isEditMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-yellow-700">
              Solo completa si deseas cambiar la contraseña
            </p>
          </div>
        </div>
      )}

      {/* Contraseñas - UNA COLUMNA VERTICAL */}
      {(isCreateMode || isEditMode) && (
        <>
          {/* Contraseña */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                {...getInputProps('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder={isCreateMode ? "Mínimo 6 caracteres" : "Nueva contraseña (opcional)"}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.password ? 'border-red-500 bg-red-50 pr-16' : 'bg-white pr-10'
                }`}
              />
              {errors.password && (
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2 group">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute right-0 top-full mt-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {errors.password}
                    <div className="absolute right-1 bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-red-500"></div>
                  </div>
                </div>
              )}
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
            <p className="text-xs text-gray-500">
              {isCreateMode 
                ? "Debe tener al menos 6 caracteres" 
                : "Dejar vacío para mantener actual"
              }
            </p>
          </div>

          {/* Confirmar Contraseña */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                {...getInputProps('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder={isCreateMode ? "Repetir contraseña" : "Confirmar nueva contraseña"}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.confirmPassword ? 'border-red-500 bg-red-50 pr-10' : 'bg-white'
                }`}
              />
              {errors.confirmPassword && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 group">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute right-0 top-full mt-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {errors.confirmPassword}
                    <div className="absolute right-1 bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-red-500"></div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {isCreateMode 
                ? "Debe coincidir con la contraseña" 
                : "Solo si cambia la contraseña"
              }
            </p>
          </div>
        </>
      )}

      {/* Perfil/Rol - UNA COLUMNA VERTICAL */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Perfil/Rol
        </label>
        <div className="relative">
          <select
            name="groups"
            disabled={isViewMode || loadingGroups}
            value={
              Array.isArray(formData.groups) && formData.groups.length > 0 
                ? (() => {
                    const groupName = formData.groups[0];
                    const group = groupsDisponibles.find(g => g.name === groupName);
                    return group ? String(group.id) : '';
                  })()
                : ''
            }
            onChange={(e) => {
              const groupId = e.target.value;
              if (groupId) {
                const selectedGroup = groupsDisponibles.find(g => g.id == groupId);
                const groupName = selectedGroup ? selectedGroup.name : '';
                setFieldValue('groups', [groupName]);
              } else {
                setFieldValue('groups', []);
              }
            }}
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.groups ? 'border-red-500 bg-red-50 pr-10' : 'bg-white'
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
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 group">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="absolute right-0 top-full mt-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {errors.groups}
                <div className="absolute right-1 bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-red-500"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estado del usuario - UNA COLUMNA VERTICAL */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Estado
        </label>
        <div className="flex items-center space-x-3">
          <input
            {...getCheckboxProps('is_active')}
            type="checkbox"
            disabled={isViewMode}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all"
          />
          <label className="text-sm text-gray-700">
            Usuario activo en el sistema
          </label>
        </div>
        {!formData.is_active && (
          <div className="p-2 rounded-md text-xs bg-gray-100 text-gray-600">
            No podrá iniciar sesión
          </div>
        )}
      </div>


    </div>
  );



  // Filtrar cargos basado en búsqueda
  const filteredCargos = useMemo(() => {
    if (!cargoSearch || cargoSearch.trim() === '') {
      return [];
    }
    
    const searchTerm = cargoSearch.toLowerCase().trim();
    
    return availableCargos.filter(cargo => {
      const nombre = (cargo.nombre || '').toLowerCase();
      const areaNombre = (cargo.area_nombre || cargo.area_detail?.nombre || cargo.area?.nombre || '').toLowerCase();
      
      return nombre.includes(searchTerm) || areaNombre.includes(searchTerm);
    });
  }, [availableCargos, cargoSearch]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cargoDropdownRef.current && !cargoDropdownRef.current.contains(event.target)) {
        setShowCargoDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Renderizado de pestaña Organización
  const renderOrganizacion = () => (
    <div className="space-y-4">
      {/* Empresa - UNA COLUMNA VERTICAL */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Empresa
        </label>
        <div className="relative">
          <select
            {...getSelectProps('empresa')}
            disabled={isViewMode}
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.empresa ? 'border-red-500 bg-red-50 pr-10' : 'bg-white'
            } ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          >
            <option value="">Seleccionar empresa</option>
            <option value="AQUANQA_1">AQUANQA 1</option>
            <option value="AQUANQA_2">AQUANQA 2</option>
          </select>
          {errors.empresa && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 group">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="absolute right-0 top-full mt-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {errors.empresa}
                <div className="absolute right-1 bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-red-500"></div>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Empresa del grupo AQUANQA
        </p>
      </div>

      {/* Cargo - UNA COLUMNA VERTICAL */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Cargo
        </label>
        <div className="relative" ref={cargoDropdownRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar cargo por nombre o área..."
              value={cargoSearch}
              onChange={(e) => {
                const newValue = e.target.value;
                setCargoSearch(newValue);
                
                // Si hay un cargo seleccionado y el usuario empieza a escribir algo diferente,
                // limpiar la selección para permitir nueva búsqueda
                if (formData.cargo && availableCargos.length > 0) {
                  const selectedCargo = availableCargos.find(c => c.id == formData.cargo);
                  if (selectedCargo && newValue !== selectedCargo.nombre) {
                    setFieldValue('cargo', '');
                  }
                }
                
                if (!showCargoDropdown) {
                  setShowCargoDropdown(true);
                }
              }}
              onFocus={() => setShowCargoDropdown(true)}
              disabled={isViewMode}
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.cargo ? 'border-red-500 bg-red-50 pr-16' : 'bg-white pr-10'
              } ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            {errors.cargo && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2 group">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="absolute right-0 top-full mt-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {errors.cargo}
                  <div className="absolute right-1 bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-red-500"></div>
                </div>
              </div>
            )}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Mostrar mensaje cuando no hay resultados de búsqueda */}
          {(showCargoDropdown && cargoSearch && filteredCargos.length === 0 && availableCargos.length > 0) && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
              <p className="text-sm text-gray-500 text-center">
                No se encontraron cargos que coincidan con "{cargoSearch}"
              </p>
            </div>
          )}



          {/* Lista desplegable con búsqueda */}
          {(showCargoDropdown && cargoSearch && filteredCargos.length > 0) && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredCargos.map((cargo, index) => (
                <button
                  key={cargo.id}
                  type="button"
                  onClick={() => {
                    setFieldValue('cargo', cargo.id);
                    setCargoSearch(cargo.nombre);
                    setShowCargoDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 focus:outline-none focus:bg-blue-50 transition-colors ${
                    index !== filteredCargos.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{cargo.nombre}</div>
                  <div className="text-xs text-gray-500">{cargo.area_nombre || 'Sin área'}</div>
                </button>
              ))}
            </div>
          )}
          
          {/* Mostrar mensaje cuando no hay cargos disponibles */}
          {(showCargoDropdown && !cargoSearch && availableCargos.length === 0) && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
              <p className="text-sm text-gray-500 text-center">
                No hay cargos disponibles
              </p>
            </div>
          )}

          {/* Lista completa cuando no hay búsqueda - mostrar los primeros 10 cargos */}
          {(showCargoDropdown && !cargoSearch && availableCargos.length > 0) && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
              <div className="px-3 py-2 bg-gray-50 text-xs text-gray-600 font-medium border-b">
                {availableCargos.length} cargos disponibles - Escribe para buscar
              </div>
              {availableCargos.slice(0, 10).map((cargo, index) => (
                <button
                  key={cargo.id}
                  type="button"
                  onClick={() => {
                    setFieldValue('cargo', cargo.id);
                    setCargoSearch(cargo.nombre);
                    setShowCargoDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 focus:outline-none focus:bg-blue-50 transition-colors ${
                    index !== Math.min(availableCargos.length, 10) - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{cargo.nombre}</div>
                  <div className="text-xs text-gray-500">{cargo.area_nombre || cargo.area_detail?.nombre || cargo.area?.nombre || 'Sin área'}</div>
                </button>
              ))}
              {availableCargos.length > 10 && (
                <div className="px-3 py-2 text-xs text-gray-500 text-center border-t border-gray-100">
                  Y {availableCargos.length - 10} cargos más...
                </div>
              )}
            </div>
          )}
          
          {/* Campo hidden */}
          <input
            type="hidden"
            {...getSelectProps('cargo')}
          />
        </div>
        <p className="text-xs text-gray-500">
          Escriba para buscar por nombre de cargo o área. Haga clic para ver sugerencias.
        </p>
      </div>

      {/* Información del cargo seleccionado */}
      {formData.cargo && (
        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Cargo Seleccionado</h4>
              <div className="text-sm text-blue-700">
                {(() => {
                  const selectedCargo = availableCargos.find(c => c.id == formData.cargo);
                  return selectedCargo ? (
                    <div>
                      <p className="font-medium">{selectedCargo.nombre}</p>
                      <p className="text-xs">Área: {selectedCargo.area_nombre || selectedCargo.area_detail?.nombre || 'Sin área definida'}</p>
                    </div>
                  ) : 'Cargo no encontrado';
                })()}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFieldValue('cargo', '');
                setCargoSearch('');
                setShowCargoDropdown(false);
              }}
              className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
              title="Limpiar selección"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}




    </div>
  );

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-[900px] h-[550px] flex flex-col max-w-[95vw] max-h-[95vh]">
        {/* Header minimalista */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg flex-shrink-0">
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

        {/* Sistema de Pestañas minimalista */}
        <div className="bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="px-6">
            <nav className="flex space-x-0" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={isViewMode}
                  className={`
                    flex items-center px-4 py-3 text-[13px] font-medium border-b-2 transition-all duration-200
                    ${activeTab === tab.id 
                      ? 'border-blue-500 text-blue-600 bg-white' 
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                    }
                    ${isViewMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {errors && Object.keys(errors).length > 0 && getTabErrors(tab.id).length > 0 && (
                    <span className="ml-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
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
