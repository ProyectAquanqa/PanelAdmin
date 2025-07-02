// ============================================================================
// 🏥 COMPONENTE: PatientForm - Formulario Reutilizable para Pacientes
// Componente de formulario para crear y editar pacientes
// ============================================================================

import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { UserIcon, CakeIcon, IdentificationIcon, AtSymbolIcon, PhoneIcon, HomeIcon, ShieldCheckIcon, HeartIcon, SunIcon, UsersIcon, BeakerIcon } from '@heroicons/react/24/outline';

const DetailField = ({ icon: Icon, label, value, isDark, fullWidth = false }) => (
  <div className={`flex items-start space-x-4 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
    <div className={`mt-1 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isDark ? 'bg-neutral-700' : 'bg-gray-100'}`}>
      <Icon className={`h-5 w-5 ${isDark ? 'text-neutral-300' : 'text-gray-500'}`} />
    </div>
    <div>
      <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value || 'No especificado'}</p>
    </div>
  </div>
);

const Section = ({ title, children, isDark }) => (
  <div className={`p-6 rounded-2xl ${isDark ? 'bg-neutral-800/50' : 'bg-white shadow-sm'}`}>
    <h3 className={`text-lg font-bold mb-6 border-b pb-3 ${isDark ? 'text-white border-neutral-700' : 'text-gray-800 border-gray-200'}`}>{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      {children}
    </div>
  </div>
);

const PatientForm = ({ patient }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const fullName = `${patient?.first_name || ''} ${patient?.last_name || ''} ${patient?.second_last_name || ''}`.trim();
  const fullEmergencyContact = `${patient?.emergency_contact_name || ''}`;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const age = new Date().getFullYear() - date.getFullYear();
    return `${date.toLocaleDateString()} (${age} años)`;
  };
  
  const getGenderDisplay = (gender) => {
    const genderMap = { 'MALE': 'Masculino', 'FEMALE': 'Femenino', 'OTHER': 'Otro' };
    return genderMap[gender] || gender;
  };

  const getBloodTypeDisplay = (bloodType) => {
    const bloodTypeMap = {
      'A_POSITIVE': 'A+', 'A_NEGATIVE': 'A-', 'B_POSITIVE': 'B+', 'B_NEGATIVE': 'B-',
      'AB_POSITIVE': 'AB+', 'AB_NEGATIVE': 'AB-', 'O_POSITIVE': 'O+', 'O_NEGATIVE': 'O-',
    };
    return bloodTypeMap[bloodType] || bloodType;
  };

  return (
    <div className="space-y-8 p-1">
      <Section title="Información Personal" isDark={isDark}>
        <DetailField icon={UserIcon} label="Nombre Completo" value={fullName} isDark={isDark} />
        <DetailField icon={IdentificationIcon} label="DNI" value={patient?.document_number} isDark={isDark} />
        <DetailField icon={CakeIcon} label="Fecha de Nacimiento y Edad" value={formatDate(patient?.birth_date)} isDark={isDark} />
        <DetailField icon={UsersIcon} label="Género" value={getGenderDisplay(patient?.gender)} isDark={isDark} />
      </Section>

      <Section title="Información de Contacto" isDark={isDark}>
        <DetailField icon={AtSymbolIcon} label="Correo Electrónico" value={patient?.user_email || patient?.email} isDark={isDark} />
        <DetailField icon={PhoneIcon} label="Teléfono" value={patient?.phone} isDark={isDark} />
        <DetailField icon={HomeIcon} label="Dirección" value={patient?.address} isDark={isDark} fullWidth={true} />
      </Section>

      {patient?.emergency_contact_name && (
        <Section title="Contacto de Emergencia" isDark={isDark}>
          <DetailField icon={UserIcon} label="Nombre del Contacto" value={fullEmergencyContact} isDark={isDark} />
          <DetailField icon={PhoneIcon} label="Teléfono de Emergencia" value={patient?.emergency_contact_phone} isDark={isDark} />
        </Section>
      )}

      <Section title="Información Adicional" isDark={isDark}>
        <DetailField icon={ShieldCheckIcon} label="Verificado por RENIEC" value={patient?.reniec_verified ? 'Sí' : 'No'} isDark={isDark} />
        <DetailField icon={BeakerIcon} label="Tipo de Sangre" value={getBloodTypeDisplay(patient?.blood_type)} isDark={isDark} />
        <DetailField icon={HeartIcon} label="Condiciones Médicas" value={patient?.medical_conditions} isDark={isDark} fullWidth={true} />
        <DetailField icon={SunIcon} label="Alergias" value={patient?.allergies} isDark={isDark} fullWidth={true} />
      </Section>
    </div>
  );
};

export default PatientForm;
