import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listTutorHomeworks } from '../../services/tutor.service';
import { HOMEWORK_STATUSES } from '../../constants/homework';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Field';
import StatusBadge from '../../components/ui/StatusBadge';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';

export default function TutorHomeworkListPage() {
  const [homeworks, setHomeworks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (status) params.status = status;
    listTutorHomeworks(params)
      .then((data) => {
        setHomeworks(data.homeworks || []);
        setPagination(data.pagination || {});
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">My Homeworks</h1>
          <p className="text-sm text-slate-500">Drafts you've created and homeworks assigned to children.</p>
        </div>
        <Link to="/tutor/homeworks/new">
          <Button>+ New Homework</Button>
        </Link>
      </div>

      <Card className="mb-4 p-4">
        <div className="max-w-xs">
          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            {HOMEWORK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Spinner /> Loading…
          </div>
        ) : homeworks.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No homeworks yet" subtitle="Create one to get started." />
          </div>
        ) : (
          <>
            <Table>
              <THead>
                <Tr>
                  <Th>Subject</Th>
                  <Th>Child</Th>
                  <Th>Status</Th>
                  <Th>Questions</Th>
                  <Th>Deadline</Th>
                  <Th></Th>
                </Tr>
              </THead>
              <TBody>
                {homeworks.map((hw) => (
                  <Tr key={hw.id}>
                    <Td className="font-medium text-slate-900">{hw.subject?.name || '—'}</Td>
                    <Td>{hw.child?.name || '—'}</Td>
                    <Td>
                      <StatusBadge status={hw.status} />
                    </Td>
                    <Td>{hw._count?.questions ?? 0}</Td>
                    <Td>{hw.deadline ? new Date(hw.deadline).toLocaleString() : '—'}</Td>
                    <Td>
                      <Link to={`/tutor/homeworks/${hw.id}`}>
                        <Button variant="secondary" size="sm">
                          Open
                        </Button>
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
            <Pagination page={pagination.page || page} hasNextPage={pagination.hasNextPage} total={pagination.total} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
