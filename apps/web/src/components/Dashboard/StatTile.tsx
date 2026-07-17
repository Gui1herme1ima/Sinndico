import { Card } from '@/components/ui/Card';

export interface StatTileProps {
  label: string;
  value: number;
}

export function StatTile({ label, value }: StatTileProps) {
  return (
    <Card>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="font-display text-3xl font-bold text-text-primary">{value}</span>
      </div>
    </Card>
  );
}
