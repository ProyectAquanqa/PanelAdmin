import React from 'react';

/**
 * Componente para la sección de información personal del doctor
 */
const DoctorPersonalInfo = ({ register, errors, isDark }) => {
  const inputClasses = `
    mt-1 block w-full rounded-md shadow-sm sm:text-sm px-3 py-2
    ${isDark 
      ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:ring-primary-500 focus:border-primary-500 focus:ring-offset-neutral-900' 
      : 'border-gray-300 placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500'
    }
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const errorClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500';

  return (
    <div>
      <h3 className={`text-lg font-medium leading-6 ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
        Información Personal
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Nombre */}
        <div className="md:col-span-1">
          <label htmlFor="first_name" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
            Nombres <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="first_name"
            {...register('first_name')}
            className={`${inputClasses} ${errors.first_name ? errorClasses : ''}`}
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
          )}
        </div>
        
        {/* Apellido */}
        <div className="md:col-span-1">
          <label htmlFor="last_name" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
            Apellidos <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="last_name"
            {...register('last_name')}
            className={`${inputClasses} ${errors.last_name ? errorClasses : ''}`}
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
          )}
        </div>
        
        {/* Email */}
        <div className="md:col-span-1">
          <label htmlFor="email" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
            Correo Electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className={`${inputClasses} ${errors.email ? errorClasses : ''}`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        {/* Contraseña */}
        <div className="md:col-span-1">
          <label htmlFor="password" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
            Contraseña <span className="text-gray-400">(si se deja en blanco, no se actualiza)</span>
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className={`${inputClasses} ${errors.password ? errorClasses : ''}`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        
        {/* Teléfono */}
        <div className="md:col-span-1">
          <label htmlFor="phone" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
            Teléfono
          </label>
          <input
            type="text"
            id="phone"
            {...register('phone')}
            className={`${inputClasses} ${errors.phone ? errorClasses : ''}`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
        
        {/* Teléfono de contacto */}
        <div className="md:col-span-1">
          <label htmlFor="contact_phone" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
            Teléfono de Contacto
          </label>
          <input
            type="text"
            id="contact_phone"
            {...register('contact_phone')}
            className={`${inputClasses} ${errors.contact_phone ? errorClasses : ''}`}
          />
          {errors.contact_phone && (
            <p className="mt-1 text-sm text-red-600">{errors.contact_phone.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPersonalInfo; 