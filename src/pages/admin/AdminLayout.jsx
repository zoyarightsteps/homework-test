import AppLayout from '../../components/layout/AppLayout';

const links = [
  { to: '/admin', label: 'Question Bank', end: true },
  { to: '/admin/questions/new', label: '+ New Question' },
];

export default function AdminLayout() {
  return <AppLayout links={links} roleLabel="Admin" />;
}
