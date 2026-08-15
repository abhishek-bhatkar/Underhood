import type { ComponentRuntime, ConceptDef } from '@underhood/simulation-engine';

interface InspectorPanelProps {
  componentId: string;
  concept: ConceptDef;
  runtime: ComponentRuntime | undefined;
  onClose: () => void;
}

/** Inspect a component: concept content plus live state from its data. */
export function InspectorPanel({ componentId, concept, runtime, onClose }: InspectorPanelProps) {
  const rows: { k: string; v: string; cls?: string }[] = [
    {
      k: 'status',
      v: runtime?.status ?? '—',
      cls:
        runtime?.status === 'error'
          ? 'err'
          : runtime?.status === 'done'
            ? 'on'
            : runtime?.status === 'active'
              ? 'work'
              : undefined,
    },
    ...(concept.fields ?? []).map((field) => {
      const value = runtime?.data[field.key];
      if (field.list) {
        return { k: field.label, v: Array.isArray(value) ? String(value.length) : '0' };
      }
      if (value === undefined || value === null || value === '') return { k: field.label, v: '—' };
      if (value === true) return { k: field.label, v: 'yes', cls: 'on' };
      return { k: field.label, v: String(value) };
    }),
  ];

  return (
    <section className="rail-section" aria-label={`Inspect ${concept.name}`}>
      <div className="inspector-head">
        <h2 className="inspector-title">{concept.name}</h2>
        <button className="inspector-close" onClick={onClose} aria-label="Close inspector">
          esc
        </button>
      </div>
      <p className="inspector-summary">{concept.summary}</p>
      <ul className="inspector-details">
        {concept.details.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <div className="live-state">
        {rows.map((row) => (
          <div className="row" key={row.k}>
            <span className="k">{row.k}</span>
            <span className={`v${row.cls ? ` ${row.cls}` : ''}`}>{row.v}</span>
          </div>
        ))}
      </div>
      {componentId ? null : null}
    </section>
  );
}
