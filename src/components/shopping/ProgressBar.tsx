interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/60">
      <div
        className="h-full rounded-full bg-forest transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
