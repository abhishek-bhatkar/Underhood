import type { ComponentRuntime, ConceptDef } from '@underhood/simulation-engine';

interface InspectorPanelProps {
  componentId: string;
  concept: ConceptDef;
  runtime: ComponentRuntime;
  onClose: () => void;
}

/** Per-component live state, keyed by component id. */
function liveRows(
  id: string,
  data: Record<string, unknown>,
  runtime: ComponentRuntime,
): { k: string; v: string; cls?: string }[] {
  switch (id) {
    case 'terminal':
      return [{ k: 'command', v: (data.command as string) ?? '—', cls: 'work' }];
    case 'cli':
      return [
        { k: 'role', v: 'client' },
        { k: 'phase', v: runtime.label ?? 'idle' },
      ];
    case 'daemon':
      return [
        { k: 'api', v: 'unix:///var/run/docker.sock' },
        { k: 'phase', v: runtime.label ?? 'idle' },
      ];
    case 'registry':
      return [
        { k: 'host', v: 'registry-1.docker.io' },
        { k: 'state', v: runtimeLabel(runtime) },
      ];
    case 'image-store': {
      const layers = (data.layers as unknown[]) ?? [];
      return [
        { k: 'layers pulled', v: `${layers.length} / 4` },
        { k: 'image', v: layers.length === 4 ? 'nginx:latest ✓' : 'incomplete' },
      ];
    }
    case 'container':
      return [
        { k: 'id', v: (data.containerId as string) ?? '—' },
        { k: 'network', v: (data.network as string) ?? '—' },
        { k: 'ip', v: (data.ip as string) ?? '—' },
        { k: 'pid', v: data.pid ? String(data.pid) : '—' },
        { k: 'process', v: (data.process as string) ?? '—' },
        { k: 'status', v: data.running ? 'running' : (data.containerId ? 'created' : 'absent'), cls: data.running ? 'on' : undefined },
      ];
    default:
      return [];
  }
}

function runtimeLabel(runtime: ComponentRuntime): string {
  return runtime.status;
}

export function InspectorPanel({ componentId, concept, runtime, onClose }: InspectorPanelProps) {
  const rows = liveRows(componentId, runtime.data, runtime);
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
    </section>
  );
}
