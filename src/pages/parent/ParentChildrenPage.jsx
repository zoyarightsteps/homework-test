import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMe } from '../../services/auth.service';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function ParentChildrenPage() {
  const [children, setChildren] = useState(null);
  const toast = useToast();

  useEffect(() => {
    getMe()
      .then((data) => setChildren(data.parentProfile?.children || []))
      .catch((err) => toast.error(getErrorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (children === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-slate-400">
        <Spinner /> Loading children…
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold text-slate-900">My Children</h1>
      <p className="mb-5 text-sm text-slate-500">Select a child to view their homework.</p>

      {children.length === 0 ? (
        <EmptyState title="No children on this account" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Link key={child.id} to={`/parent/children/${child.id}`}>
              <Card className="p-4 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                  {child.imageUrl ? (
                    <img src={child.imageUrl} alt={child.name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      {child.firstName?.[0] || child.name?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{child.name}</div>
                    <div className="text-xs text-slate-400">{child.yearGroup?.name || 'No year group'}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge className="bg-blue-50 text-blue-700">{child.enrollmentStatus || 'PENDING'}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
