import React from 'react';
import PropTypes from 'prop-types';
import { CustomDropdown } from '../Common';

/**
 * Componente de acciones para notificaciones
 * Sigue el patrón de KnowledgeActions con adaptaciones para notificaciones
 */
const NotificationActions = ({
  searchTerm = '',
  onSearchChange,
  selectedTipo = '',
  onTipoChange,
  selectedDestinatario = '',
  onDestinatarioChange,
  usuarios = [],
  onCreateNew,
  onSendBroadcast,
  onSendBulk,
  totalItems = 0
}) => {
  const handleSearchChange = (value) => {
    onSearchChange?.(value);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 -mt-4 mb-6">
      <div className="space-y-4">
        {/* Búsqueda - Siempre en su propia línea */}
        <div className="w-full">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por título, mensaje o destinatario..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F]/30 transition-all bg-gray-50/30"
            />
          </div>
        </div>

        {/* Filtros y Acciones - Layout adaptativo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Columna 1: Filtro de Tipo */}
          <div className="flex flex-col">
            <div className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Tipo</div>
            <div className="flex-1 flex flex-col justify-end">
              <CustomDropdown
                value={selectedTipo}
                onChange={onTipoChange}
                options={[
                  { value: '', label: 'Todos los tipos' },
                  { value: 'individual', label: 'Individual' },
                  { value: 'broadcast', label: 'Broadcast' },
                  { value: 'evento', label: 'Evento' },
                  { value: 'general', label: 'General' }
                ]}
                placeholder="Seleccionar tipo..."
                className="h-[42px]"
                showIcon={true}
                iconComponent={
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12a1 1 0 011-2h3a1 1 0 011 2v12z" />
                  </svg>
                }
                optionTextSize="text-[13px]"
              />
            </div>
          </div>

          {/* Columna 2: Filtro de Destinatario */}
          <div className="flex flex-col">
            <div className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Destinatario</div>
            <div className="flex-1 flex flex-col justify-end">
              <CustomDropdown
                value={selectedDestinatario}
                onChange={onDestinatarioChange}
                options={[
                  { value: '', label: 'Todos los destinatarios' },
                  { value: 'broadcast', label: 'Broadcast (Todos)' },
                  ...usuarios.map(usuario => ({ 
                    value: usuario.id.toString(), 
                    label: `${usuario.first_name} ${usuario.last_name}`.trim() || usuario.username 
                  }))
                ]}
                placeholder="Seleccionar destinatario..."
                className="h-[42px]"
                showIcon={true}
                iconComponent={
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                optionTextSize="text-[13px]"
              />
            </div>
          </div>

          {/* Columna 3: Acciones */}
          <div className="flex flex-col">
            <div className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Acciones</div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="flex flex-wrap gap-2 h-[42px]">
                <button
                  onClick={onCreateNew}
                  className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#2D728F] text-white text-[13px] font-medium rounded-lg hover:bg-[#2D728F]/90 focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear
                </button>
                
                <button
                  onClick={onSendBroadcast}
                  className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-500 text-white text-[13px] font-medium rounded-lg hover:bg-blue-600 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Broadcast
                </button>

                <button
                  onClick={onSendBulk}
                  className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-purple-500 text-white text-[13px] font-medium rounded-lg hover:bg-purple-600 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  Masivo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Información de resultados y filtros */}
        <div className="flex flex-col gap-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-gray-600">
                <span className="font-bold">{totalItems}</span> {totalItems === 1 ? 'notificación' : 'notificaciones'}
              </span>
              
              {/* Filtros activos */}
              {(searchTerm || selectedTipo || selectedDestinatario) && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">Filtros:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/10 text-blue-800 text-[13px] font-medium rounded-md">
                      "{searchTerm.length > 15 ? `${searchTerm.substring(0, 15)}...` : searchTerm}"
                    </span>
                  )}
                  {selectedTipo && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#2D728F]/10 text-[#2D728F] text-[13px] font-medium rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2D728F]"></div>
                      {selectedTipo === 'individual' ? 'Individual' : 
                       selectedTipo === 'broadcast' ? 'Broadcast' :
                       selectedTipo === 'evento' ? 'Evento' : 'General'}
                    </span>
                  )}
                  {selectedDestinatario && selectedDestinatario !== 'broadcast' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-[13px] font-medium rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                      {usuarios.find(u => u.id.toString() === selectedDestinatario)?.username || 'Usuario'}
                    </span>
                  )}
                  {selectedDestinatario === 'broadcast' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 text-[13px] font-medium rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      Broadcast
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {(searchTerm || selectedTipo || selectedDestinatario) && (
              <button
                onClick={() => {
                  onSearchChange?.('');
                  onTipoChange?.('');
                  onDestinatarioChange?.('');
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-600 text-[13px] font-medium rounded-lg hover:bg-gray-200 cursor-pointer transition-all min-w-[120px]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

NotificationActions.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  selectedTipo: PropTypes.string,
  onTipoChange: PropTypes.func,
  selectedDestinatario: PropTypes.string,
  onDestinatarioChange: PropTypes.func,
  usuarios: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
      first_name: PropTypes.string,
      last_name: PropTypes.string
    })
  ),
  onCreateNew: PropTypes.func,
  onSendBroadcast: PropTypes.func,
  onSendBulk: PropTypes.func,
  totalItems: PropTypes.number
};

export default NotificationActions;
