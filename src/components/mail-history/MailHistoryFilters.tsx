import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DECISION_FILTER_OPTIONS, FILTER_ALL } from '@/config/mailHistory';
import type { MailHistoryAccountOption, MailHistoryFilters as Filters } from '@/types/mailHistory';

type MailHistoryFiltersProps = {
  filters: Filters;
  accountOptions: MailHistoryAccountOption[];
  onChange: (filters: Filters) => void;
};

export function MailHistoryFilters({ filters, accountOptions, onChange }: MailHistoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filters.accountId} onValueChange={(accountId) => onChange({ ...filters, accountId })}>
        <SelectTrigger className="w-full sm:w-64" aria-label="アカウントで絞り込む">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={FILTER_ALL}>すべてのアカウント</SelectItem>
          {accountOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.decision} onValueChange={(decision) => onChange({ ...filters, decision })}>
        <SelectTrigger className="w-full sm:w-44" aria-label="判定で絞り込む">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DECISION_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
