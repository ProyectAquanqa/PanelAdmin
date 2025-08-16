/**
 * Configuración de filtros para el módulo de Cargos
 * Siguiendo el patrón del useSearch hook
 */

export const cargoFiltersConfig = {
  searchPlaceholder: "Buscar por nombre, descripción o área...",
  searchFields: ["nombre", "descripcion", "area_detail.nombre"],
  
  statusOptions: [
    { value: "", label: "Todos los estados" },
    { value: "active_area", label: "Área activa" },
    { value: "inactive_area", label: "Área inactiva" },
    { value: "with_users", label: "Con usuarios" },
    { value: "without_users", label: "Sin usuarios" }
  ],
  
  dateRangeOptions: [
    { value: null, label: "Cualquier fecha" },
    { value: "today", label: "Hoy" },
    { value: "week", label: "Esta semana" },
    { value: "month", label: "Este mes" },
    { value: "custom", label: "Rango personalizado" }
  ],
  
  // Función para aplicar filtros de estado personalizados
  applyStatusFilter: (data, statusValue) => {
    if (!statusValue) return data;
    
    switch (statusValue) {
      case "active_area":
        return data.filter(item => item.area_detail?.is_active === true);
      case "inactive_area":
        return data.filter(item => item.area_detail?.is_active === false);
      case "with_users":
        return data.filter(item => (item.total_usuarios || 0) > 0);
      case "without_users":
        return data.filter(item => (item.total_usuarios || 0) === 0);
      default:
        return data;
    }
  },
  
  // Función para aplicar filtros de fecha
  applyDateFilter: (data, dateRange) => {
    if (!dateRange) return data;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case "today":
        return data.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate >= today;
        });
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return data.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate >= weekAgo;
        });
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return data.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate >= monthAgo;
        });
      default:
        return data;
    }
  }
};

export default cargoFiltersConfig;
