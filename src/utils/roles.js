const ROLE_PRIORITY = ['ADMIN', 'TUTOR', 'PARENT'];

export function getPrimaryRole(roles = []) {
  return ROLE_PRIORITY.find((r) => roles.includes(r)) || roles[0] || null;
}

export function homePathForRoles(roles = []) {
  const role = getPrimaryRole(roles);
  if (role === 'ADMIN') return '/admin';
  if (role === 'TUTOR') return '/tutor';
  if (role === 'PARENT') return '/parent';
  return '/login';
}
