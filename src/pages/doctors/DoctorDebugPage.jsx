import { useState } from 'react';
import { useGetDoctors } from '../../hooks/useDoctors';
import { useGetSpecialties } from '../../hooks/useSpecialties';
import DoctorFormModal from '../../components/doctors/DoctorFormModal';

function DoctorDebugPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Obtener doctores
  const { data: doctorsData, isLoading: loadingDoctors, error: doctorsError } = useGetDoctors();
  const doctors = doctorsData || [];
  
  // Obtener especialidades
  const { data: specialtiesData, isLoading: loadingSpecialties } = useGetSpecialties();
  const specialties = specialtiesData?.results || [];
  
  // Abrir modal para crear doctor
  const handleOpenCreateModal = () => {
    setSelectedDoctor(null);
    setIsModalOpen(true);
  };
  
  // Abrir modal para editar doctor
  const handleOpenEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };
  
  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedDoctor(null), 300); // Limpiar después de la animación
  };
  
  // Mostrar especialidades de un doctor
  const renderDoctorSpecialties = (doctor) => {
    if (!doctor.specialties || doctor.specialties.length === 0) {
      return <span className="text-gray-400">Sin especialidades</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {doctor.specialties.map((spec, index) => {
          // Determinar el ID de la especialidad según el formato
          let specialtyId;
          let specialtyName = '';
          
          if (typeof spec === 'object' && spec.specialty) {
            specialtyId = spec.specialty.id;
            specialtyName = spec.specialty.name;
          } else if (typeof spec === 'object' && spec.id) {
            specialtyId = spec.id;
            specialtyName = spec.name;
          } else if (typeof spec === 'number') {
            specialtyId = spec;
            // Buscar el nombre en la lista de especialidades
            const foundSpecialty = specialties.find(s => s.id === specialtyId);
            specialtyName = foundSpecialty ? foundSpecialty.name : `ID: ${specialtyId}`;
          }
          
          return (
            <span 
              key={`${doctor.id}-spec-${index}`} 
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {specialtyName || `ID: ${specialtyId}`}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Depuración de Doctores</h1>
        <p className="text-gray-600">Prueba del formulario de doctores y manejo de especialidades</p>
      </div>
      
      <div className="mb-6">
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-[#033662] text-white rounded-lg hover:bg-[#022a52]"
        >
          Crear Nuevo Doctor
        </button>
      </div>
      
      {/* Estado de especialidades */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Especialidades Disponibles</h2>
        {loadingSpecialties ? (
          <p>Cargando especialidades...</p>
        ) : specialties.length === 0 ? (
          <p className="text-red-500">No hay especialidades disponibles</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {specialties.map(specialty => (
              <div key={specialty.id} className="p-2 border rounded-lg bg-white">
                <div className="font-medium">{specialty.name}</div>
                <div className="text-xs text-gray-500">ID: {specialty.id}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Lista de doctores */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Doctores Registrados</h2>
        {loadingDoctors ? (
          <p>Cargando doctores...</p>
        ) : doctorsError ? (
          <p className="text-red-500">Error al cargar doctores: {doctorsError.message}</p>
        ) : doctors.length === 0 ? (
          <p>No hay doctores registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CMP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidades</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map(doctor => (
                  <tr key={doctor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doctor.first_name} {doctor.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doctor.user?.email || doctor.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doctor.cmp_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doctor.doctor_type === 'PRIMARY' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {doctor.doctor_type || 'SPECIALIST'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {renderDoctorSpecialties(doctor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(doctor)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">Estado de Doctores</h3>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify({
                isLoading: loadingDoctors,
                count: doctors.length,
                error: doctorsError?.message
              }, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-medium">Estado de Especialidades</h3>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify({
                isLoading: loadingSpecialties,
                count: specialties.length,
                specialties: specialties.map(s => ({ id: s.id, name: s.name }))
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
      
      {/* Modal de doctor */}
      <DoctorFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        doctor={selectedDoctor}
      />
    </div>
  );
}

export default DoctorDebugPage; 