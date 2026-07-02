import AppLayout from '../../components/layout/AppLayout';

const links = [
  { to: '/parent', label: 'My Children', end: true },
  { to: '/parent/marketplace', label: 'Marketplace' },
];

export default function ParentLayout() {
  return <AppLayout links={links} roleLabel="Parent" />;
}
