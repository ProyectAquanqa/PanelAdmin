import React, { useState } from 'react';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import FormToggle from '../common/FormToggle';

const FormInput = ({ id, name, label, register, error, type = 'text', icon: Icon, isDark, children, ...props }) => {
  const inputClasses = `
    w-full rounded-md shadow-sm sm:text-sm px-3 py-2 pl-10
    ${isDark 
      ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400 focus:ring-primary-500 focus:border-primary-500' 
      : 'border-gray-300 placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500'
    }
    focus:outline-none focus:ring-2
  `;
  const errorClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500';

  return (
    <div>
      <label htmlFor={id} className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <div className="relative mt-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className={`h-5 w-5 ${isDark ? 'text-neutral-400' : 'text-gray-400'}`} aria-hidden="true" />
        </div>
        <input
          type={type}
          id={id}
          {...register(name)}
          className={`${inputClasses} ${error ? errorClasses : ''}`}
          {...props}
        />
        {children}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

const UserAuthInfoSection = ({ register, errors, control, isDark, isEditing }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
      <h3 className={`text-lg font-medium leading-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Información de Acceso
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <FormInput id="email" name="email" label="Correo Electrónico" type="email" register={register} error={errors.email} icon={EnvelopeIcon} isDark={isDark} />
        <FormInput id="dni" name="dni" label="DNI" type="text" register={register} error={errors.dni} icon={IdentificationIcon} isDark={isDark} maxLength="8" />
        <FormInput 
          id="password" 
          name="password" 
          label={isEditing ? 'Nueva Contraseña' : 'Contraseña'}
          type={showPassword ? 'text' : 'password'}
          register={register} 
          error={errors.password} 
          icon={LockClosedIcon} 
          isDark={isDark}
        >
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showPassword ? (
              <EyeSlashIcon className={`h-5 w-5 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`} />
            ) : (
              <EyeIcon className={`h-5 w-5 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`} />
            )}
          </button>
        </FormInput>
        <div className="flex items-center pt-5">
            <FormToggle name="is_active" label="Usuario Activo" control={control} isDark={isDark} />
        </div>
      </div>
    </div>
  );
};

export default UserAuthInfoSection; 