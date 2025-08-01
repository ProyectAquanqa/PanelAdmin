/**
 * Utilidades para manejar archivos Excel (XLSX)
 * Funciones para generar plantillas y parsear archivos de usuarios
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Estructura de las columnas para la plantilla de usuarios
 */
export const USER_TEMPLATE_COLUMNS = [
  { key: 'username', label: 'DNI', description: 'Documento Nacional de Identidad (requerido)' },
  { key: 'first_name', label: 'Nombre', description: 'Nombre del usuario (requerido)' },
  { key: 'last_name', label: 'Apellido', description: 'Apellido del usuario (requerido)' },
  { key: 'email', label: 'Email', description: 'Correo electrónico (opcional)' },
  { key: 'is_active', label: 'Estado', description: 'Activo: 1, Inactivo: 0 (opcional, por defecto: 1)' },
  { key: 'is_staff', label: 'Staff', description: 'Staff: 1, Normal: 0 (opcional, por defecto: 0)' },
  { key: 'groups', label: 'Roles', description: 'Nombres de roles separados por comas (opcional)' }
];

/**
 * Datos de ejemplo para la plantilla
 */
const EXAMPLE_DATA = [
  {
    username: '12345678',
    first_name: 'Juan',
    last_name: 'Pérez',
    email: 'juan.perez@email.com',
    is_active: 1,
    is_staff: 0,
    groups: 'Admin,Staff'
  },
  {
    username: '87654321',
    first_name: 'María',
    last_name: 'García',
    email: 'maria.garcia@email.com',
    is_active: 1,
    is_staff: 1,
    groups: 'Staff'
  },
  {
    username: '11111111',
    first_name: 'Carlos',
    last_name: 'López',
    email: '',
    is_active: 1,
    is_staff: 0,
    groups: ''
  }
];

/**
 * Genera y descarga una plantilla Excel para importar usuarios
 */
export const downloadUserTemplate = () => {
  try {
    // Crear nuevo workbook
    const workbook = XLSX.utils.book_new();
    
    // Crear hoja de instrucciones
    const instructionsData = [
      ['INSTRUCCIONES PARA IMPORTAR USUARIOS'],
      [''],
      ['1. Complete la hoja "Usuarios" con los datos requeridos'],
      ['2. Los campos DNI, Nombre y Apellido son obligatorios'],
      ['3. El Estado debe ser 1 (Activo) o 0 (Inactivo)'],
      ['4. Staff debe ser 1 (Sí) o 0 (No)'],
      ['5. Los Roles deben separarse por comas si hay varios'],
      ['6. Guarde el archivo y súbalo en el sistema'],
      [''],
      ['IMPORTANTE:'],
      ['- No modifique los nombres de las columnas'],
      ['- No deje filas vacías entre datos'],
      ['- Asegúrese de que los DNI sean únicos']
    ];
    
    const instructionsWS = XLSX.utils.aoa_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(workbook, instructionsWS, 'Instrucciones');
    
    // Crear hoja de usuarios con cabeceras y ejemplos
    const headers = USER_TEMPLATE_COLUMNS.map(col => col.label);
    const descriptions = USER_TEMPLATE_COLUMNS.map(col => col.description);
    
    // Preparar datos para la hoja de usuarios
    const usersData = [
      headers,
      descriptions,
      [], // Fila vacía
      ...EXAMPLE_DATA.map(user => USER_TEMPLATE_COLUMNS.map(col => user[col.key] || ''))
    ];
    
    const usersWS = XLSX.utils.aoa_to_sheet(usersData);
    
    // Configurar estilos y anchos de columna
    const columnWidths = USER_TEMPLATE_COLUMNS.map(() => ({ wch: 20 }));
    usersWS['!cols'] = columnWidths;
    
    // Agregar la hoja al workbook
    XLSX.utils.book_append_sheet(workbook, usersWS, 'Usuarios');
    
    // Generar archivo y descargarlo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const fileName = `plantilla_usuarios_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(data, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error al generar plantilla Excel:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Parsea un archivo Excel y extrae los datos de usuarios
 * @param {File} file - Archivo Excel a parsear
 * @returns {Promise} Promesa que resuelve con los datos parseados
 */
export const parseUserExcel = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Buscar la hoja de usuarios
          let sheetName = 'Usuarios';
          if (!workbook.SheetNames.includes(sheetName)) {
            // Si no existe, usar la primera hoja
            sheetName = workbook.SheetNames[0];
          }
          
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            throw new Error('El archivo Excel debe contener al menos una fila de cabeceras y una fila de datos');
          }
          
          // Encontrar la fila de cabeceras (buscar fila que contenga "DNI")
          let headerRowIndex = -1;
          for (let i = 0; i < Math.min(jsonData.length, 5); i++) {
            if (jsonData[i] && jsonData[i].some(cell => 
              typeof cell === 'string' && cell.toLowerCase().includes('dni')
            )) {
              headerRowIndex = i;
              break;
            }
          }
          
          if (headerRowIndex === -1) {
            throw new Error('No se encontró una fila de cabeceras válida. Asegúrese de que exista una columna "DNI"');
          }
          
          const headers = jsonData[headerRowIndex];
          const dataRows = jsonData.slice(headerRowIndex + 1);
          
          // Mapear cabeceras a nuestras claves
          const headerMapping = {};
          headers.forEach((header, index) => {
            if (!header) return;
            
            const headerLower = header.toString().toLowerCase();
            if (headerLower.includes('dni')) headerMapping.username = index;
            else if (headerLower.includes('nombre')) headerMapping.first_name = index;
            else if (headerLower.includes('apellido')) headerMapping.last_name = index;
            else if (headerLower.includes('email') || headerLower.includes('correo')) headerMapping.email = index;
            else if (headerLower.includes('estado')) headerMapping.is_active = index;
            else if (headerLower.includes('staff')) headerMapping.is_staff = index;
            else if (headerLower.includes('rol') || headerLower.includes('grupo')) headerMapping.groups = index;
          });
          
          // Validar campos requeridos
          if (!headerMapping.hasOwnProperty('username')) {
            throw new Error('Columna "DNI" no encontrada');
          }
          if (!headerMapping.hasOwnProperty('first_name')) {
            throw new Error('Columna "Nombre" no encontrada');
          }
          if (!headerMapping.hasOwnProperty('last_name')) {
            throw new Error('Columna "Apellido" no encontrada');
          }
          
          // Procesar datos
          const processedData = [];
          const errors = [];
          
          dataRows.forEach((row, index) => {
            // Saltar filas vacías
            if (!row || row.every(cell => !cell)) return;
            
            const rowIndex = headerRowIndex + index + 2; // +2 porque Excel empieza en 1 y saltamos header
            
            try {
              const userData = {
                username: row[headerMapping.username]?.toString().trim() || '',
                first_name: row[headerMapping.first_name]?.toString().trim() || '',
                last_name: row[headerMapping.last_name]?.toString().trim() || '',
                email: row[headerMapping.email]?.toString().trim() || '',
                is_active: headerMapping.is_active !== undefined ? 
                  (row[headerMapping.is_active] == 1 || row[headerMapping.is_active]?.toString().toLowerCase() === 'true') : true,
                is_staff: headerMapping.is_staff !== undefined ? 
                  (row[headerMapping.is_staff] == 1 || row[headerMapping.is_staff]?.toString().toLowerCase() === 'true') : false,
                groups: headerMapping.groups !== undefined ? 
                  row[headerMapping.groups]?.toString().trim() || '' : ''
              };
              
              // Validaciones básicas
              if (!userData.username) {
                throw new Error('DNI es requerido');
              }
              if (!userData.first_name) {
                throw new Error('Nombre es requerido');
              }
              if (!userData.last_name) {
                throw new Error('Apellido es requerido');
              }
              
              // Validar formato de email si se proporciona
              if (userData.email && !isValidEmail(userData.email)) {
                throw new Error('Formato de email inválido');
              }
              
              // Procesar grupos/roles
              if (userData.groups) {
                userData.groups = userData.groups.split(',').map(g => g.trim()).filter(g => g);
              } else {
                userData.groups = [];
              }
              
              processedData.push({
                ...userData,
                _rowIndex: rowIndex,
                _isValid: true
              });
              
            } catch (error) {
              errors.push({
                row: rowIndex,
                error: error.message,
                data: row
              });
            }
          });
          
          resolve({
            success: true,
            data: processedData,
            errors: errors,
            totalRows: dataRows.length,
            validRows: processedData.length,
            headers: headers,
            fileName: file.name
          });
          
        } catch (error) {
          reject({
            success: false,
            error: error.message
          });
        }
      };
      
      reader.onerror = () => {
        reject({
          success: false,
          error: 'Error al leer el archivo'
        });
      };
      
      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      reject({
        success: false,
        error: error.message
      });
    }
  });
};

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Formatea los datos parseados para mostrar en tabla
 * @param {Array} data - Datos parseados del Excel
 * @returns {Array} Datos formateados para la tabla
 */
export const formatDataForTable = (data) => {
  return data.map((user, index) => ({
    id: index + 1, // ID temporal para la tabla
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    full_name: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email || 'Sin email registrado',
    is_active: user.is_active,
    is_staff: user.is_staff,
    groups: Array.isArray(user.groups) ? user.groups : [],
    _rowIndex: user._rowIndex,
    _isValid: user._isValid
  }));
};

export default {
  downloadUserTemplate,
  parseUserExcel,
  formatDataForTable,
  USER_TEMPLATE_COLUMNS
};