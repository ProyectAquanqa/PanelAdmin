// Importar y reexportar todos los servicios de usuarios
import * as apiService from './userApiService';
import * as cacheService from './userCacheService';
import * as transformService from './userTransformService';

// Reexportar todas las funciones
export const {
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersStats,
  activateUser,
  deactivateUser,
  getPatients,
  getPatientById,
  updatePatient
} = apiService;

export const {
  getUsers,
  findUserInCache,
  clearUsersCache,
  applyClientSidePagination
} = cacheService;

export const {
  normalizeUsersResponse,
  normalizeUserData,
  prepareUserDataForSubmit
} = transformService; 