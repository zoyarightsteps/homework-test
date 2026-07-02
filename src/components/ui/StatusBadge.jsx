import Badge from './Badge';
import { STATUS_COLORS } from '../../constants/homework';

export default function StatusBadge({ status }) {
  return <Badge className={STATUS_COLORS[status]}>{status}</Badge>;
}
