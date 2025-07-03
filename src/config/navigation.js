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
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';
import { FiUsers, FiCalendar, FiList, FiUserPlus, FiMessageSquare } from 'react-icons/fi';

export const navigationLinks = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Usuarios', href: '/users', icon: UsersIcon },
  { name: 'Doctores', href: '/doctors', icon: UserIcon },
  { name: 'Pacientes', href: '/patients', icon: UserGroupIcon },
  { name: 'Citas', href: '/appointments', icon: CalendarIcon },
  { name: 'Historiales Médicos', href: '/medical', icon: RectangleStackIcon },
  { name: 'Pagos', href: '/payments', icon: CurrencyDollarIcon },
  { name: 'Especialidades', href: '/specialties', icon: TagIcon },
  { name: 'Chatbot', href: '/chatbot', icon: ChatBubbleLeftIcon },
  { name: 'Analítica', href: '/analytics', icon: ChartBarIcon },
  { name: 'Auditoría', href: '/audit', icon: ClipboardDocumentListIcon },
  { name: 'Configuración', href: '/settings', icon: CogIcon }
]; 