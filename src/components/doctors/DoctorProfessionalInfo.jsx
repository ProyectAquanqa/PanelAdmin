import React from 'react';
import FormToggle from '../common/FormToggle';

/**
 * Componente para la sección de información profesional del doctor
 */
const DoctorProfessionalInfo = ({ register, errors, control, isDark }) => {
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
    <div className="mt-6">
      <h3 className={`text-lg font-medium leading-6 ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
        Información Profesional
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Número de CMP */}
        <div className="md:col-span-1">
          <label htmlFor="cmp_number" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
            Número de CMP <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="cmp_number"
            {...register('cmp_number')}
            className={`${inputClasses} ${errors.cmp_number ? errorClasses : ''}`}
          />
          {errors.cmp_number && (
            <p className="mt-1 text-sm text-red-600">{errors.cmp_number.message}</p>
          )}
        </div>
        
        {/* Tipo de Doctor */}
        <div className="md:col-span-1">
          <label htmlFor="doctor_type" className={`block text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
            Tipo de Doctor <span className="text-red-500">*</span>
          </label>
          <select
            id="doctor_type"
            {...register('doctor_type')}
            className={`${inputClasses} ${errors.doctor_type ? errorClasses : ''}`}
          >
            <option value="SPECIALIST">Médico Especialista</option>
            <option value="PRIMARY">Médico Principal</option>
          </select>
          {errors.doctor_type && (
            <p className="mt-1 text-sm text-red-600">{errors.doctor_type.message}</p>
          )}
        </div>
        
        {/* Toggles en una sola línea */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 pt-2">
          <FormToggle name="is_active" label="Activo" control={control} isDark={isDark} />
          <FormToggle name="can_refer" label="Puede referir" control={control} isDark={isDark} />
          <FormToggle name="is_external" label="Es externo" control={control} isDark={isDark} />
        </div>
      </div>
    </div>
  );
};

export default DoctorProfessionalInfo; 