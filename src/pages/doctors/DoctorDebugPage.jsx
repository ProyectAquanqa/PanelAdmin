import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import adminApiClient from '../../api/adminApiClient';
import { toast } from 'react-hot-toast';

const DoctorDebugPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [doctorSpecialties, setDoctorSpecialties] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Cargar doctores
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await adminApiClient.get('/api/doctors/doctors/');
        console.log('Respuesta de doctores:', response.data);
        
        let doctorsData = [];
        if (Array.isArray(response.data)) {
          doctorsData = response.data;
        } else if (response.data && response.data.results) {
          doctorsData = response.data.results;
        }
        
        setDoctors(doctorsData);
      } catch (err) {
        console.error('Error al cargar doctores:', err);
        setError('Error al cargar doctores: ' + err.message);
        toast.error('Error al cargar doctores');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);
  
  // Cargar especialidades
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await adminApiClient.get('/api/doctors/specialties/');
        console.log('Respuesta de especialidades:', response.data);
        
        let specialtiesData = [];
        if (Array.isArray(response.data)) {
          specialtiesData = response.data;
        } else if (response.data && response.data.results) {
          specialtiesData = response.data.results;
        }
        
        setSpecialties(specialtiesData);
      } catch (err) {
        console.error('Error al cargar especialidades:', err);
        toast.error('Error al cargar especialidades');
      }
    };
    
    fetchSpecialties();
  }, []);
  
  // Cargar especialidades de un doctor específico
  const loadDoctorSpecialties = async (doctorId) => {
    try {
      setSelectedDoctor(doctorId);
      
      // Si ya tenemos las especialidades de este doctor, no volver a cargarlas
      if (doctorSpecialties[doctorId]) {
        return;
      }
      
      const response = await adminApiClient.get(`/api/doctors/specialties/by_doctor/?doctor_id=${doctorId}`);
      console.log(`Especialidades del doctor ${doctorId}:`, response.data);
      
      let specialtiesData = [];
      if (Array.isArray(response.data)) {
        specialtiesData = response.data;
      } else if (response.data && response.data.results) {
        specialtiesData = response.data.results;
      }
      
      setDoctorSpecialties(prev => ({
        ...prev,
        [doctorId]: specialtiesData
      }));
    } catch (err) {
      console.error(`Error al cargar especialidades del doctor ${doctorId}:`, err);
      toast.error(`Error al cargar especialidades del doctor ${doctorId}`);
    }
  };
  
  // Renderizar especialidades de un doctor
  const renderDoctorSpecialties = (doctorId) => {
    const specs = doctorSpecialties[doctorId];
    
    if (!specs) {
      return <p className="text-gray-400 text-sm">Cargando especialidades...</p>;
    }
    
    if (specs.length === 0) {
      return <p className="text-red-400 text-sm">Sin especialidades asignadas</p>;
    }
    
    return (
      <div className="space-y-1">
        {specs.map((spec, index) => (
          <div 
            key={index} 
            className={`px-2 py-1 rounded text-sm ${
              isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {spec.name || spec.specialty_name || `Especialidad ${spec.id || spec.specialty_id || index}`}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Depuración de Doctores y Especialidades
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel de doctores */}
        <div className={`p-4 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Doctores ({doctors.length})
          </h2>
          
          {loading ? (
            <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Cargando doctores...
            </p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {doctors.map(doctor => (
                <div 
                  key={doctor.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedDoctor === doctor.id
                      ? isDark ? 'bg-indigo-900 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200'
                      : isDark ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => loadDoctorSpecialties(doctor.id)}
                >
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {doctor.first_name} {doctor.last_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {doctor.id} | CMP: {doctor.cmp_number}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {doctor.specialties && Array.isArray(doctor.specialties) ? (
                      doctor.specialties.length > 0 ? (
                        <span>
                          {doctor.specialties.length} especialidad(es) en respuesta original
                        </span>
                      ) : (
                        <span className="text-yellow-500">
                          Sin especialidades en respuesta original
                        </span>
                      )
                    ) : (
                      <span className="text-red-500">
                        Formato de especialidades inválido
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Panel de especialidades */}
        <div className={`p-4 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Especialidades ({specialties.length})
          </h2>
          
          <div className="mb-6">
            <h3 className={`text-md font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Catálogo de Especialidades
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
              {specialties.map(specialty => (
                <div 
                  key={specialty.id}
                  className={`p-2 rounded text-sm ${
                    isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {specialty.name || specialty.specialty_name || `ID: ${specialty.id}`}
                </div>
              ))}
              
              {specialties.length === 0 && (
                <p className="text-gray-400 text-sm col-span-2 text-center py-4">
                  No hay especialidades disponibles
                </p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className={`text-md font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {selectedDoctor 
                ? `Especialidades del doctor ID: ${selectedDoctor}`
                : 'Seleccione un doctor para ver sus especialidades'}
            </h3>
            
            {selectedDoctor ? (
              renderDoctorSpecialties(selectedDoctor)
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">
                Haga clic en un doctor para ver sus especialidades
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Información de Endpoints
        </h2>
        
        <div className={`p-4 rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-mono bg-gray-100 text-gray-800 px-1 rounded">GET /api/doctors/doctors/</span>
              <span className="ml-2">Lista todos los doctores</span>
            </li>
            <li>
              <span className="font-mono bg-gray-100 text-gray-800 px-1 rounded">GET /api/doctors/specialties/</span>
              <span className="ml-2">Lista todas las especialidades</span>
            </li>
            <li>
              <span className="font-mono bg-gray-100 text-gray-800 px-1 rounded">GET /api/doctors/specialties/by_doctor/?doctor_id=X</span>
              <span className="ml-2">Lista las especialidades de un doctor específico</span>
            </li>
            <li>
              <span className="font-mono bg-gray-100 text-gray-800 px-1 rounded">GET /api/doctors/doctors/by_specialty/?specialty=X</span>
              <span className="ml-2">Lista los doctores de una especialidad específica</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DoctorDebugPage; 