import React from 'react';
import { useController } from 'react-hook-form';
import { UserGroupIcon, UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

const ALLOWED_ROLES = [
  { 
    id: 'ADMIN', 
    name: 'Administrador', 
    description: 'Acceso total para gestionar el sistema.',
    icon: UserGroupIcon,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    selectedColor: 'border-purple-500 bg-purple-50',
    darkColor: 'dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/50',
    darkSelectedColor: 'dark:border-purple-500 dark:bg-purple-900/50',
  },
  { 
    id: 'RECEPTIONIST', 
    name: 'Recepción', 
    description: 'Manejo de citas, pacientes y pagos.',
    icon: UserIcon,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    selectedColor: 'border-amber-500 bg-amber-50',
    darkColor: 'dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50',
    darkSelectedColor: 'dark:border-amber-500 dark:bg-amber-900/50',
  }
];

const UserRoleSelector = ({ control }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const { field } = useController({
    name: 'role',
    control,
    defaultValue: 'RECEPTIONIST',
  });

  return (
    <div>
      <h3 className={`text-lg font-medium leading-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Rol del Usuario
      </h3>
      <fieldset className="mt-4">
        <legend className="sr-only">Selección de rol</legend>
        <div className="space-y-4">
          {ALLOWED_ROLES.map((roleOption) => {
            const isSelected = field.value === roleOption.id;
            const IconComponent = roleOption.icon;
            
            return (
              <label
                key={roleOption.id}
                htmlFor={`role-${roleOption.id}`}
                className={`
                  relative flex border rounded-lg p-4 cursor-pointer focus:outline-none transition-all duration-200
                  ${isSelected
                    ? (isDark ? roleOption.darkSelectedColor : roleOption.selectedColor)
                    : (isDark ? `border-neutral-700 hover:${roleOption.darkSelectedColor}` : 'border-gray-200 hover:border-gray-300')
                  }
                `}
              >
                <input
                  type="radio"
                  id={`role-${roleOption.id}`}
                  value={roleOption.id}
                  className="sr-only"
                  onChange={field.onChange}
                  checked={isSelected}
                  name="role"
                />
                <div className="flex items-center w-full">
                  <div className={`
                    flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg mr-4 
                    ${isDark ? roleOption.darkColor : roleOption.color}
                  `}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {roleOption.name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                      {roleOption.description}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircleIcon className={`h-6 w-6 absolute top-4 right-4 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                )}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
};

export default UserRoleSelector; 