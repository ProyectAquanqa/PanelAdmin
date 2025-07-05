import React from 'react';
import Modal from '../common/Modal';
import { 
  XMarkIcon, UserCircleIcon, CalendarIcon, HashtagIcon, InformationCircleIcon,
  HeartIcon, ScaleIcon, FireIcon, ArrowTrendingUpIcon, LifebuoyIcon, DocumentTextIcon, LinkIcon, BeakerIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const DetailItem = ({ icon: Icon, label, value, theme, fullWidth = false }) => (
  <div className={fullWidth ? 'col-span-1 md:col-span-2' : ''}>
    <div className="flex items-start space-x-3">
      <Icon className={`h-5 w-5 mt-1 flex-shrink-0 ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`} />
      <div>
        <p className={`text-xs font-medium ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-base break-words ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value || 'No especificado'}</p>
      </div>
    </div>
  </div>
);

const Section = ({ title, children, theme }) => (
  <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-neutral-800/50' : 'bg-gray-50'}`}>
    <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-primary-400' : 'text-primary-600'}`}>{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
      {children}
    </div>
  </div>
);

const MedicalRecordDetailsModal = ({ isOpen, onClose, record, theme }) => {
  if (!record) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), "d 'de' MMMM 'de' yyyy, h:mm a", { locale: es });
    } catch {
      return dateString;
    }
  };
  
  const formatBoolean = (value) => (value === null || typeof value === 'undefined') ? 'No especificado' : value ? 'Sí' : 'No';
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <div className={`${theme === 'dark' ? 'bg-neutral-900 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-2xl flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-neutral-700' : 'border-gray-200'} flex-shrink-0`}>
          <h2 className="text-2xl font-bold flex items-center">
            <DocumentTextIcon className="h-7 w-7 mr-3 text-primary-500" />
            Resumen del Historial Clínico
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <Section title="Información General" theme={theme}>
            <DetailItem icon={HashtagIcon} label="ID de Historial" value={record.id} theme={theme} />
            <DetailItem icon={LinkIcon} label="ID de Cita Asociada" value={record.appointment} theme={theme} />
            <DetailItem icon={UserCircleIcon} label="Paciente" value={record.patient?.user?.full_name} theme={theme} />
            <DetailItem icon={UserCircleIcon} label="Doctor" value={record.doctor?.user?.full_name} theme={theme} />
            <DetailItem icon={CalendarIcon} label="Fecha de Registro" value={formatDate(record.record_date)} theme={theme} fullWidth />
          </Section>

          <Section title="Signos Vitales y Alergias" theme={theme}>
             <DetailItem icon={ScaleIcon} label="Altura / Peso" value={`${record.height_cm || 'N/A'} cm / ${record.weight_kg || 'N/A'} kg`} theme={theme} />
             <DetailItem icon={ArrowTrendingUpIcon} label="IMC / Categoría" value={`${record.bmi || 'N/A'} / ${record.bmi_category || 'N/A'}`} theme={theme} />
             <DetailItem icon={HeartIcon} label="Presión Arterial" value={record.blood_pressure} theme={theme} />
             <DetailItem icon={FireIcon} label="Temperatura" value={`${record.temperature || 'N/A'} °C`} theme={theme} />
             <DetailItem icon={LifebuoyIcon} label="Frecuencia Cardíaca / Respiratoria" value={`${record.heart_rate || 'N/A'} bpm / ${record.respiratory_rate || 'N/A'} rpm`} theme={theme} />
             <DetailItem icon={BeakerIcon} label="Saturación O₂" value={`${record.oxygen_saturation || 'N/A'} %`} theme={theme} />
             <DetailItem icon={InformationCircleIcon} label="Alergias" value={record.allergies} theme={theme} fullWidth />
          </Section>

          <Section title="Detalles Clínicos" theme={theme}>
            <DetailItem icon={InformationCircleIcon} label="Motivo de la Consulta" value={record.chief_complaint} theme={theme} fullWidth />
            <DetailItem icon={InformationCircleIcon} label="Síntomas" value={record.symptoms} theme={theme} fullWidth />
            <DetailItem icon={InformationCircleIcon} label="Diagnóstico" value={record.diagnosis} theme={theme} fullWidth />
            <DetailItem icon={InformationCircleIcon} label="Plan de Tratamiento" value={record.treatment_plan} theme={theme} fullWidth />
            <DetailItem icon={InformationCircleIcon} label="Notas Médicas Adicionales" value={record.notes} theme={theme} fullWidth />
          </Section>

          <Section title="Seguimiento y Referidos" theme={theme}>
             <DetailItem icon={CalendarIcon} label="Requiere Seguimiento" value={formatBoolean(record.followup_required)} theme={theme} />
             <DetailItem icon={CalendarIcon} label="Fecha de Seguimiento" value={formatDate(record.followup_date)} theme={theme} />
             <DetailItem icon={LinkIcon} label="Es un Referido" value={formatBoolean(record.is_referral_record)} theme={theme} />
             <DetailItem icon={InformationCircleIcon} label="Notas de Referido" value={record.referral_notes} theme={theme} fullWidth />
          </Section>
        </div>

        {/* Footer */}
        <div className={`flex justify-end p-4 border-t ${theme === 'dark' ? 'border-neutral-700' : 'border-gray-200'} flex-shrink-0`}>
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MedicalRecordDetailsModal; 