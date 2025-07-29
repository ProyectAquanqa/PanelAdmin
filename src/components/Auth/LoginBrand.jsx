import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar el logo y la información de la aplicación en la pantalla de login
 */
const LoginBrand = ({ appName, appDescription }) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-block mb-4">
        {/* Logo con A circular */}
        <div className="w-16 h-16 mx-auto rounded-full bg-[#2D728F] flex items-center justify-center">
          <span className="text-white font-bold text-3xl">A</span>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
        {appName}
      </h1>
      
      {appDescription && (
        <p className="mt-2 text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
          {appDescription}
        </p>
      )}
    </div>
  );
};

LoginBrand.propTypes = {
  appName: PropTypes.string.isRequired,
  appDescription: PropTypes.string
};

LoginBrand.defaultProps = {
  appName: 'Panel AquanQ',
  appDescription: 'Sistema de administración para la plataforma AquanQ'
};

export default LoginBrand; 