import { useState } from 'react';
import { useGetPatients } from '../../hooks/usePatients';
import PatientFormModal from '../../components/patients/PatientFormModal';

function PatientDebugPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Obtener pacientes
  const { data: patientsData, isLoading: loadingPatients, error: patientsError } = useGetPatients();
  const patients = patientsData?.results || [];
  
  // Abrir modal para crear paciente
  const handleOpenCreateModal = () => {
    setSelectedPatient(null);
    setIsModalOpen(true);
  };
  
  // Abrir modal para editar paciente
  const handleOpenEditModal = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };
  
  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPatient(null), 300); // Limpiar después de la animación
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Depuración de Pacientes</h1>
        <p className="text-gray-600">Prueba del formulario de pacientes</p>
      </div>
      
      <div className="mb-6">
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-[#033662] text-white rounded-lg hover:bg-[#022a52]"
        >
          Crear Nuevo Paciente
        </button>
      </div>
      
      {/* Lista de pacientes */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Pacientes Registrados</h2>
        {loadingPatients ? (
          <p>Cargando pacientes...</p>
        ) : patientsError ? (
          <p className="text-red-500">Error al cargar pacientes: {patientsError.message}</p>
        ) : patients.length === 0 ? (
          <p>No hay pacientes registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Género</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map(patient => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.first_name} {patient.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.user?.email || patient.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.document_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        patient.gender === 'MALE' ? 'bg-blue-100 text-blue-800' : 
                        patient.gender === 'FEMALE' ? 'bg-pink-100 text-pink-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.gender === 'MALE' ? 'Masculino' : 
                         patient.gender === 'FEMALE' ? 'Femenino' : 'Otro'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(patient)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Debug info */}
      <div className="mt-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Información de Depuración</h2>
        <div>
          <h3 className="font-medium">Estado de Pacientes</h3>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify({
              isLoading: loadingPatients,
              count: patients.length,
              error: patientsError?.message,
              data: patientsData
            }, null, 2)}
          </pre>
        </div>
      </div>
      
      {/* Modal de paciente */}
      <PatientFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        patient={selectedPatient}
      />
    </div>
  );
}

export default PatientDebugPage; 