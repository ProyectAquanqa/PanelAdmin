/**
 * Componente de debug temporal para verificar estructura de permisos
 * Solo para desarrollo - mostrar qué datos están llegando del backend
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PermissionsDebugger = ({ availablePermissions, formPermissions = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');

  if (!availablePermissions || Object.keys(availablePermissions).length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">🐛 Debug: Sin datos de permisos</h3>
        <p className="text-xs text-yellow-700">No se han cargado permisos desde el backend</p>
      </div>
    );
  }

  const moduleKeys = Object.keys(availablePermissions);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-blue-800">🐛 Debug: Estructura de Permisos</h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? 'Contraer' : 'Expandir'}
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-blue-700">Módulos detectados:</span>
            <span className="ml-2 text-blue-600">{moduleKeys.length}</span>
          </div>
          <div>
            <span className="font-medium text-blue-700">Permisos seleccionados:</span>
            <span className="ml-2 text-blue-600">{formPermissions.length}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1">
                Inspeccionar módulo:
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
              >
                <option value="">Seleccionar módulo...</option>
                {moduleKeys.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>

            {selectedModule && availablePermissions[selectedModule] && (
              <div className="bg-white rounded border border-blue-200 p-3">
                <h4 className="font-medium text-blue-800 mb-2">
                  Módulo: {selectedModule}
                </h4>
                
                {availablePermissions[selectedModule].submodules ? (
                  <div className="space-y-2">
                    <div className="text-xs text-blue-600">
                      Submódulos: {availablePermissions[selectedModule].submodules.length}
                    </div>
                    
                    {availablePermissions[selectedModule].submodules.map((submodule, idx) => (
                      <div key={idx} className="bg-gray-50 rounded p-2">
                        <div className="font-medium text-gray-800">
                          {submodule.name} ({submodule.id})
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Permisos: {submodule.permissions ? submodule.permissions.length : 0}
                        </div>
                        
                        {submodule.permissions && submodule.permissions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {submodule.permissions.slice(0, 3).map((perm, permIdx) => (
                              <div key={permIdx} className="text-xs bg-white rounded px-2 py-1">
                                <span className="font-mono text-purple-600">{perm.codename}</span>
                                <span className="mx-2">→</span>
                                <span className="text-gray-700">{perm.translatedName}</span>
                              </div>
                            ))}
                            {submodule.permissions.length > 3 && (
                              <div className="text-xs text-gray-500">
                                ... y {submodule.permissions.length - 3} más
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-red-600">
                    ⚠️ Estructura de submódulos no encontrada
                  </div>
                )}
              </div>
            )}

            <details className="bg-white rounded border border-blue-200 p-3">
              <summary className="cursor-pointer text-xs font-medium text-blue-700">
                Ver estructura completa (JSON)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(availablePermissions, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

PermissionsDebugger.propTypes = {
  availablePermissions: PropTypes.object,
  formPermissions: PropTypes.array
};

export default PermissionsDebugger;
