/**
 * Componente para proteger contenido basado en permisos
 * Compatible con el nuevo sistema de permisos dinámicos
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useHasPermission, useCanPerform, useIsInGroup } from '../../hooks/usePermissions';

/**
 * Componente para mostrar contenido solo si el usuario tiene el permiso requerido
 */
export const PermissionGate = ({ 
  permission, 
  model, 
  action, 
  group, 
  condition,
  children, 
  fallback = null,
  require = 'any' // 'any' | 'all'
}) => {
  const hasSpecificPermission = permission ? useHasPermission(permission) : false;
  const canPerformAction = model && action ? useCanPerform(model, action) : false;
  const isInRequiredGroup = group ? useIsInGroup(group) : false;
  const hasCustomCondition = typeof condition === 'function' ? useHasPermission(condition) : false;

  // Recopilar todas las condiciones
  const conditions = [];
  
  if (permission) conditions.push(hasSpecificPermission);
  if (model && action) conditions.push(canPerformAction);
  if (group) conditions.push(isInRequiredGroup);
  if (condition) conditions.push(hasCustomCondition);

  // Si no hay condiciones, mostrar contenido por defecto
  if (conditions.length === 0) {
    return children;
  }

  // Evaluar según el tipo de requerimiento
  const hasAccess = require === 'all' 
    ? conditions.every(Boolean)
    : conditions.some(Boolean);

  return hasAccess ? children : fallback;
};

PermissionGate.propTypes = {
  permission: PropTypes.string,
  model: PropTypes.string,
  action: PropTypes.string,
  group: PropTypes.string,
  condition: PropTypes.func,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  require: PropTypes.oneOf(['any', 'all'])
};

/**
 * Componente para mostrar contenido solo a administradores
 */
export const AdminOnly = ({ children, fallback = null }) => {
  return (
    <PermissionGate condition={() => {
      const { isAdmin } = require('../../services/permissionService');
      return isAdmin();
    }}>
      {children}
    </PermissionGate>
  );
};

AdminOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node
};

/**
 * Componente para mostrar contenido solo a gestores de contenido
 */
export const ContentManagerOnly = ({ children, fallback = null }) => {
  return (
    <PermissionGate condition={() => {
      const { isContentManager } = require('../../services/permissionService');
      return isContentManager();
    }}>
      {children}
    </PermissionGate>
  );
};

ContentManagerOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node
};

/**
 * Componente para mostrar contenido solo a gestores de chatbot
 */
export const ChatbotManagerOnly = ({ children, fallback = null }) => {
  return (
    <PermissionGate condition={() => {
      const { isChatbotManager } = require('../../services/permissionService');
      return isChatbotManager();
    }}>
      {children}
    </PermissionGate>
  );
};

ChatbotManagerOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node
};

/**
 * Componente para mostrar mensaje de acceso denegado
 */
export const AccessDenied = ({ 
  title = "Acceso Denegado",
  message = "No tienes permisos para acceder a esta sección.",
  showContactInfo = false 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-gray-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {showContactInfo && (
        <p className="text-sm text-gray-500">
          Si necesitas acceso, contacta con tu administrador.
        </p>
      )}
    </div>
  );
};

AccessDenied.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  showContactInfo: PropTypes.bool
};

export default PermissionGate;
