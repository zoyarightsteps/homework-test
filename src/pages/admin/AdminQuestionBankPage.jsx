import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listBankQuestions,
  publishBankQuestion,
  unpublishBankQuestion,
  deactivateBankQuestion,
} from '../../services/admin.service';
import { QUESTION_TYPES } from '../../constants/homework';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Input, Select } from '../../components/ui/Field';
import { Table, THead, TBody, Tr, Th, Td } from '../../components/ui/Table';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';

export default function AdminQuestionBankPage() {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, hasNextPage: false, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [isPublished, setIsPublished] = useState('');
  const [page, setPage] = useState(1);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (type) params.type = type;
    if (isPublished) params.isPublished = isPublished;
    listBankQuestions(params)
      .then((data) => {
        setQuestions(data.questions || []);
        setPagination(data.pagination || {});
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, type, isPublished]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (fn, id, successMsg) => {
    try {
      await fn(id);
      toast.success(successMsg);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Question Bank</h1>
          <p className="text-sm text-slate-500">Create, publish and manage bank questions used by tutors.</p>
        </div>
        <Link to="/admin/questions/new">
          <Button>+ New Question</Button>
        </Link>
      </div>

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            label="Search"
            placeholder="Search question text…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <Select
            label="Type"
            value={type}
            onChange={(e) => {
              setPage(1);
              setType(e.target.value);
            }}
          >
            <option value="">All types</option>
            {QUESTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Select
            label="Published"
            value={isPublished}
            onChange={(e) => {
              setPage(1);
              setIsPublished(e.target.value);
            }}
          >
            <option value="">All</option>
            <option value="true">Published</option>
            <option value="false">Unpublished</option>
          </Select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Spinner /> Loading…
          </div>
        ) : questions.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No bank questions found" subtitle="Try adjusting filters or create a new question." />
          </div>
        ) : (
          <>
            <Table>
              <THead>
                <Tr>
                  <Th>Question</Th>
                  <Th>Type</Th>
                  <Th>Difficulty</Th>
                  <Th>Price</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </THead>
              <TBody>
                {questions.map((q) => (
                  <Tr key={q.id}>
                    <Td className="max-w-xs truncate">{q.questionText}</Td>
                    <Td>{q.type}</Td>
                    <Td>{q.difficulty || '—'}</Td>
                    <Td>{q.price != null ? `£${(q.price / 100).toFixed(2)}` : '—'}</Td>
                    <Td>
                      <Badge className={q.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                        {q.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/questions/${q.id}/edit`} state={{ question: q }}>
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                        </Link>
                        {q.isPublished ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => runAction(unpublishBankQuestion, q.id, 'Question unpublished')}
                          >
                            Unpublish
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => runAction(publishBankQuestion, q.id, 'Question published')}>
                            Publish
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => runAction(deactivateBankQuestion, q.id, 'Question deactivated')}
                        >
                          Deactivate
                        </Button>
                      </div>
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
