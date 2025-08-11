/**
 * Componente para seleccionar y gestionar grupos de usuarios
 * Compatible con el nuevo sistema de permisos dinámicos de AquanQ
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import userService from '../../services/userService';
import { usePermissions } from '../../hooks/usePermissions';
import toast from 'react-hot-toast';

const GroupSelector = ({
  userId,
  currentGroups = [],
  onGroupsChanged,
  disabled = false,
  mode = 'edit' // 'edit' | 'create' | 'view'
}) => {
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState(currentGroups);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { users: userPermissions } = usePermissions();

  // Cargar grupos disponibles al montar
  useEffect(() => {
    loadAvailableGroups();
  }, []);

  // Sincronizar grupos actuales cuando cambian
  useEffect(() => {
    setSelectedGroups(currentGroups);
  }, [currentGroups]);

  const loadAvailableGroups = async () => {
    try {
      setLoading(true);
      const response = await userService.groups.getAvailable();
      
      // Manejar respuesta del nuevo sistema dinámico
      const groups = response.status === 'success' ? response.data : response;
      setAvailableGroups(Array.isArray(groups) ? groups : []);
      
    } catch (error) {
      console.error('Error cargando grupos:', error);
      toast.error('Error al cargar grupos disponibles');
      setAvailableGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupToggle = async (groupId, isSelected) => {
    if (disabled || mode === 'view') return;

    try {
      setSaving(true);
      
      if (mode === 'edit' && userId) {
        // Modo edición: aplicar cambios inmediatamente
        if (isSelected) {
          await userService.groups.assignUserToGroup(userId, groupId);
          toast.success('Grupo asignado correctamente');
        } else {
          await userService.groups.removeUserFromGroup(userId, groupId);
          toast.success('Grupo removido correctamente');
        }
      }
      
      // Actualizar estado local
      const newGroups = isSelected
        ? [...selectedGroups, { id: groupId }]
        : selectedGroups.filter(g => g.id !== groupId);
      
      setSelectedGroups(newGroups);
      
      // Notificar cambio al componente padre
      if (onGroupsChanged) {
        onGroupsChanged(newGroups);
      }
      
    } catch (error) {
      console.error('Error actualizando grupo:', error);
      toast.error(error.message || 'Error al actualizar grupo');
    } finally {
      setSaving(false);
    }
  };

  const isGroupSelected = (groupId) => {
    return selectedGroups.some(g => g.id === groupId || g === groupId);
  };

  const getGroupDescription = (group) => {
    const descriptions = {
      'Trabajador': 'Usuario básico con acceso móvil sin permisos específicos',
      'Editor de Contenido': 'Puede gestionar eventos y contenido del sistema',
      'Administrador de Contenido': 'Control completo sobre contenido y usuarios',
      'Gestor de Chatbot': 'Gestiona la base de conocimiento del chatbot'
    };
    
    return descriptions[group.name] || group.description || 'Grupo personalizado';
  };

  const getGroupColor = (groupName) => {
    const colors = {
      'Trabajador': 'bg-gray-100 text-gray-700 border-gray-300',
      'Editor de Contenido': 'bg-blue-100 text-blue-700 border-blue-300',
      'Administrador de Contenido': 'bg-purple-100 text-purple-700 border-purple-300',
      'Gestor de Chatbot': 'bg-green-100 text-green-700 border-green-300'
    };
    
    return colors[groupName] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const canManageGroups = userPermissions.canManage || userPermissions.canEdit;

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          Cargando grupos disponibles...
        </div>
      </div>
    );
  }

  if (!canManageGroups && mode !== 'view') {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          No tienes permisos para gestionar grupos de usuarios.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">
          Grupos y Perfiles
        </h4>
        {saving && (
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full"></div>
            Guardando...
          </div>
        )}
      </div>

      {availableGroups.length === 0 ? (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-sm text-gray-500">No hay grupos disponibles</p>
        </div>
      ) : (
        <div className="space-y-3">
          {availableGroups.map((group) => {
            const isSelected = isGroupSelected(group.id);
            const groupColor = getGroupColor(group.name);
            
            return (
              <div
                key={group.id}
                className={`p-3 border rounded-lg transition-all ${
                  isSelected 
                    ? `${groupColor} border-2` 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                } ${disabled || mode === 'view' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                onClick={() => !disabled && mode !== 'view' && handleGroupToggle(group.id, !isSelected)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleGroupToggle(group.id, e.target.checked)}
                        disabled={disabled || mode === 'view' || saving}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {group.name}
                      </span>
                      {isSelected && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Asignado
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-1 ml-6">
                      {getGroupDescription(group)}
                    </p>
                    
                    {group.permissions && group.permissions.length > 0 && (
                      <div className="mt-2 ml-6">
                        <p className="text-xs text-gray-500">
                          {group.permissions.length} permisos incluidos
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mode === 'create' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> Los grupos seleccionados se aplicarán cuando se cree el usuario.
          </p>
        </div>
      )}

      {selectedGroups.length === 0 && mode !== 'create' && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-700">
            ⚠️ <strong>Atención:</strong> Este usuario no tiene grupos asignados. 
            Asigna al menos el grupo "Trabajador" para acceso básico.
          </p>
        </div>
      )}
    </div>
  );
};

GroupSelector.propTypes = {
  userId: PropTypes.number,
  currentGroups: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string
      })
    ])
  ),
  onGroupsChanged: PropTypes.func,
  disabled: PropTypes.bool,
  mode: PropTypes.oneOf(['edit', 'create', 'view'])
};

export default GroupSelector;
