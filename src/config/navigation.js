import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export const navigationLinks = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Usuarios', href: '/users', icon: UsersIcon },
  { name: 'Doctores', href: '/doctors', icon: UsersIcon }, // Placeholder, can be a different icon
  { name: 'Reportes', href: '/reports', icon: ChartBarIcon },
  { name: 'Auditoría', href: '/audit', icon: ShieldCheckIcon },
  { name: 'Catálogos', href: '/catalogs', icon: DocumentTextIcon },
  { name: 'Configuración', href: '/settings', icon: CogIcon },
]; 