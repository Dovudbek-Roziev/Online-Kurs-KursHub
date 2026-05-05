export default function MetricCard({ label, value, note }) {
  return (
    <div className="panel card-hover p-5">
      <p className="text-sm text-soft">{label}</p>
      <div className="mt-4 flex items-end justify-between">
        <h3 className="text-3xl font-semibold tracking-tight text-main">{value}</h3>
        {note ? (
          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
            {note}
          </span>
        ) : null}
      </div>
    </div>
  );
}
