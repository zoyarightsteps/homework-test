import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listChildHomework } from '../../services/parent.service';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';

export default function ParentChildHomeworkListPage() {
  const { childId } = useParams();
  const [homeworks, setHomeworks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    listChildHomework(childId, { page, limit: 10 })
      .then((data) => {
        setHomeworks(data.homeworks || []);
        setPagination(data.pagination || {});
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold text-slate-900">Homework</h1>
      <p className="mb-5 text-sm text-slate-500">Homework assigned by tutors for this child.</p>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Spinner /> Loading…
          </div>
        ) : homeworks.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No homework assigned yet" />
          </div>
        ) : (
          <>
            <Table>
              <THead>
                <Tr>
                  <Th>Subject</Th>
                  <Th>Status</Th>
                  <Th>Deadline</Th>
                  <Th>Score</Th>
                  <Th></Th>
                </Tr>
              </THead>
              <TBody>
                {homeworks.map((hw) => (
                  <Tr key={hw.id}>
                    <Td className="font-medium text-slate-900">{hw.subject?.name || '—'}</Td>
                    <Td>
                      <StatusBadge status={hw.status} />
                    </Td>
                    <Td>{hw.deadline ? new Date(hw.deadline).toLocaleString() : '—'}</Td>
                    <Td>{hw.score != null ? `${hw.score}/${hw.scoreOutOf}` : '—'}</Td>
                    <Td>
                      <Link to={`/parent/children/${childId}/homeworks/${hw.id}`}>
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
