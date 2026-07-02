import AppLayout from '../../components/layout/AppLayout';

const links = [
  { to: '/tutor', label: 'My Homeworks', end: true },
  { to: '/tutor/homeworks/new', label: '+ New Homework' },
];

export default function TutorLayout() {
  return <AppLayout links={links} roleLabel="Tutor" />;
}
