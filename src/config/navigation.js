import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserIcon,
  TagIcon,
  UserGroupIcon,
  CalendarIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { FiUsers, FiCalendar, FiList, FiUserPlus, FiMessageSquare } from 'react-icons/fi';

export const navigationLinks = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Usuarios', href: '/users', icon: UsersIcon },
  { name: 'Doctores', href: '/doctors', icon: UserIcon },
  { name: 'Pacientes', href: '/patients', icon: UserGroupIcon },
  { name: 'Citas', href: '/appointments', icon: CalendarIcon },
  { name: 'Especialidades', href: '/specialties', icon: TagIcon },
  { name: 'Chatbot', href: '/chatbot', icon: ChatBubbleLeftIcon },
  { name: 'Reportes', href: '/reports', icon: ChartBarIcon },
  { name: 'Auditoría', href: '/audit', icon: ShieldCheckIcon },
  { name: 'Catálogos', href: '/catalogs', icon: DocumentTextIcon },
  { name: 'Configuración', href: '/settings', icon: CogIcon }
]; 