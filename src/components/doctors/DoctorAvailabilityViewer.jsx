import { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

const DAYS_OF_WEEK = [
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' },
  { id: 6, name: 'Sábado' },
  { id: 7, name: 'Domingo' },
];

const TIME_BLOCKS = [
  { id: 'MORNING', name: 'Mañana', hours: '8:00 - 12:00' },
  { id: 'AFTERNOON', name: 'Tarde', hours: '14:00 - 18:00' },
  { id: 'FULL_DAY', name: 'Día completo', hours: '8:00 - 18:00' },
];

export default function DoctorAvailabilityViewer({ availabilities = [], doctorName = '' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    // Procesar disponibilidades por día
    const processedSchedule = DAYS_OF_WEEK.map(day => {
      const dayAvailabilities = Array.isArray(availabilities) ? 
        availabilities.filter(a => a.day_of_week === day.id && a.is_available) : [];

      return {
        ...day,
        blocks: TIME_BLOCKS.map(block => {
          const availability = dayAvailabilities.find(a => a.time_block === block.id);
          return {
            ...block,
            isAvailable: !!availability,
            maxPatients: availability?.max_patients || 0
          };
        })
      };
    });

    setSchedule(processedSchedule);
  }, [availabilities]);

  if (!availabilities || !Array.isArray(availabilities) || availabilities.length === 0) {
    return (
      <div className={`rounded-lg border ${isDark ? 'border-neutral-700 bg-neutral-800' : 'border-gray-200 bg-white'} p-6`}>
        <div className="text-center">
          <CalendarIcon className={`mx-auto h-12 w-12 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} />
          <h3 className={`mt-2 text-sm font-medium ${isDark ? 'text-neutral-200' : 'text-gray-900'}`}>
            Sin horarios configurados
          </h3>
          <p className={`mt-1 text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
            {doctorName ? `${doctorName} no tiene horarios configurados.` : 'Este doctor no tiene horarios configurados.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border ${isDark ? 'border-neutral-700 bg-neutral-800' : 'border-gray-200 bg-white'}`}>
      <div className={`border-b ${isDark ? 'border-neutral-700' : 'border-gray-200'} p-4`}>
        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Horarios de Atención
        </h3>
        {doctorName && (
          <p className={`mt-1 text-sm ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
            Horarios disponibles de {doctorName}
          </p>
        )}
      </div>

      <div className="divide-y divide-gray-200 dark:divide-neutral-700">
        {schedule.map(day => {
          const availableBlocks = day.blocks.filter(block => block.isAvailable);
          if (availableBlocks.length === 0) return null;

          return (
            <div key={day.id} className="p-4">
              <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {day.name}
              </h4>
              <div className="mt-2 space-y-2">
                {availableBlocks.map(block => (
                  <div
                    key={block.id}
                    className={`flex items-center justify-between rounded-md p-2 ${
                      isDark ? 'bg-neutral-700/50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {block.name}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                          {block.hours}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="h-4 w-4 text-blue-500" />
                      <span className={`text-sm ${isDark ? 'text-neutral-300' : 'text-gray-600'}`}>
                        {block.maxPatients} pacientes máx.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 