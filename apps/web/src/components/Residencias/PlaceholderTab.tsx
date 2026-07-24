export interface PlaceholderTabProps {
  titulo: string;
  mensagem: string;
}

export function PlaceholderTab({ titulo, mensagem }: PlaceholderTabProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <p className="font-medium text-text-primary">{titulo}</p>
      <p className="max-w-sm text-sm text-text-secondary">{mensagem}</p>
    </div>
  );
}
