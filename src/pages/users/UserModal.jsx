import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function PatientModal({ user, onClose, onSave }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isEditMode = !!user;
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document_type: 1, // Por defecto DNI
    document_number: '',
    gender: '',
    date_of_birth: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    allergies: '',
    chronic_conditions: '',
    blood_type: '',
    is_active: true
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Inicializar el formulario con los datos del paciente si estamos editando
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        document_type: user.document_type || 1,
        document_number: user.document_number || '',
        gender: user.gender || '',
        date_of_birth: user.date_of_birth ? user.date_of_birth.substring(0, 10) : '',
        address: user.address || '',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
        allergies: user.allergies || '',
        chronic_conditions: user.chronic_conditions || '',
        blood_type: user.blood_type || '',
        is_active: user.is_active !== undefined ? user.is_active : true
      });
    }
  }, [user]);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo que se está editando
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };
  
  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es obligatorio';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es obligatorio';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.document_number) {
      newErrors.document_number = 'El número de documento es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSave(formData, isEditMode ? user.id : null);
      onClose();
    } catch (error) {
      console.error('Error al guardar paciente:', error);
      
      // Manejar errores de validación del backend
      if (error.response && error.response.data) {
        setErrors(prevErrors => ({
          ...prevErrors,
          ...error.response.data,
          form: error.response.data.detail || 'Ocurrió un error al guardar. Intente de nuevo.'
        }));
      } else {
        setErrors(prevErrors => ({
          ...prevErrors,
          form: 'Ocurrió un error al conectar con el servidor. Intente de nuevo.'
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex justify-center items-center">
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        <motion.div 
          className={`relative w-full max-w-2xl p-6 rounded-lg shadow-xl ${isDark ? 'bg-neutral-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          {/* Cabecera del modal */}
          <div className="flex items-center justify-between pb-4 border-b dark:border-neutral-700">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              {isEditMode ? 'Editar Paciente' : 'Nuevo Paciente'}
            </h2>
            <button
              className={`p-1 rounded-full ${isDark ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6 text-neutral-500" />
            </button>
          </div>
          
          {/* Formulario */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Mensaje de error general */}
            {errors.form && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.form}
              </div>
            )}
            
            {/* Información personal */}
            <div className="border-b dark:border-neutral-700 pb-4">
              <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label htmlFor="first_name" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`mt-1 form-input block w-full ${errors.first_name ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                  )}
                </div>
                
                {/* Apellido */}
                <div>
                  <label htmlFor="last_name" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Apellido *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`mt-1 form-input block w-full ${errors.last_name ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                  )}
                </div>
                
                {/* Documento */}
                <div>
                  <label htmlFor="document_type" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Tipo de Documento
                  </label>
                  <select
                    id="document_type"
                    name="document_type"
                    value={formData.document_type}
                    onChange={handleChange}
                    className="mt-1 form-select block w-full"
                    disabled={isLoading}
                  >
                    <option value="1">DNI</option>
                    <option value="2">Pasaporte</option>
                    <option value="3">Carnet de Extranjería</option>
                    <option value="4">Otro</option>
                  </select>
                </div>
                
                {/* Número de documento */}
                <div>
                  <label htmlFor="document_number" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    id="document_number"
                    name="document_number"
                    value={formData.document_number}
                    onChange={handleChange}
                    className={`mt-1 form-input block w-full ${errors.document_number ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.document_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.document_number}</p>
                  )}
                </div>
                
                {/* Género */}
                <div>
                  <label htmlFor="gender" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Género
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="mt-1 form-select block w-full"
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
                
                {/* Fecha de nacimiento */}
                <div>
                  <label htmlFor="date_of_birth" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="mt-1 form-input block w-full"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
            
            {/* Información de contacto */}
            <div className="border-b dark:border-neutral-700 pb-4">
              <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                Información de Contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 form-input block w-full ${errors.email ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                {/* Teléfono */}
                <div>
                  <label htmlFor="phone" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 form-input block w-full"
                    disabled={isLoading}
                  />
                </div>
                
                {/* Dirección */}
                <div className="md:col-span-2">
                  <label htmlFor="address" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 form-input block w-full"
                    disabled={isLoading}
                  />
                </div>
                
                {/* Contacto de emergencia - Nombre */}
                <div>
                  <label htmlFor="emergency_contact_name" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Contacto de Emergencia (Nombre)
                  </label>
                  <input
                    type="text"
                    id="emergency_contact_name"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleChange}
                    className="mt-1 form-input block w-full"
                    disabled={isLoading}
                  />
                </div>
                
                {/* Contacto de emergencia - Teléfono */}
                <div>
                  <label htmlFor="emergency_contact_phone" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Contacto de Emergencia (Teléfono)
                  </label>
                  <input
                    type="tel"
                    id="emergency_contact_phone"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleChange}
                    className="mt-1 form-input block w-full"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
            
            {/* Información médica */}
            <div className="border-b dark:border-neutral-700 pb-4">
              <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                Información Médica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de sangre */}
                <div>
                  <label htmlFor="blood_type" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Tipo de Sangre
                  </label>
                  <select
                    id="blood_type"
                    name="blood_type"
                    value={formData.blood_type}
                    onChange={handleChange}
                    className="mt-1 form-select block w-full"
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                
                {/* Estado del paciente */}
                <div className="flex items-center h-full pt-5">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="form-checkbox h-4 w-4 text-primary-600"
                    disabled={isLoading}
                  />
                  <label htmlFor="is_active" className={`ml-2 block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Paciente activo
                  </label>
                </div>
                
                {/* Alergias */}
                <div className="md:col-span-2">
                  <label htmlFor="allergies" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Alergias
                  </label>
                  <textarea
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 form-textarea block w-full"
                    placeholder="Descripción de alergias (si aplica)"
                    disabled={isLoading}
                  ></textarea>
                </div>
                
                {/* Condiciones crónicas */}
                <div className="md:col-span-2">
                  <label htmlFor="chronic_conditions" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Condiciones Crónicas
                  </label>
                  <textarea
                    id="chronic_conditions"
                    name="chronic_conditions"
                    value={formData.chronic_conditions}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 form-textarea block w-full"
                    placeholder="Descripción de condiciones crónicas (si aplica)"
                    disabled={isLoading}
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 