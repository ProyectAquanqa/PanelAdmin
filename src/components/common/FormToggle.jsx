import React from 'react';
import { Switch } from '@headlessui/react';
import { useController } from 'react-hook-form';

const FormToggle = ({ control, name, label, isDark }) => {
  const { field } = useController({
    name,
    control,
    defaultValue: false,
  });

  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm font-medium ${isDark ? 'text-neutral-300' : 'text-gray-700'}`}>
        {label}
      </span>
      <Switch
        checked={field.value}
        onChange={field.onChange}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${isDark ? 'focus:ring-offset-neutral-900' : 'focus:ring-offset-white'}
          ${field.value ? 'bg-primary-600' : (isDark ? 'bg-neutral-700' : 'bg-gray-200')}
        `}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${field.value ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </Switch>
    </div>
  );
};

export default FormToggle; 