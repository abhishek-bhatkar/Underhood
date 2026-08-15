import type { ComponentRuntime } from '@underhood/simulation-engine';
import type { NodeVisual, ChipDef } from '../../content/visuals';

export interface SimNodeData extends Record<string, unknown> {
  runtime: ComponentRuntime | undefined;
  selected: boolean;
  config: NodeVisual;
  /** Terminal nodes receive the simulation log. */
  log?: string[];
}

export function statusClass(runtime: ComponentRuntime | undefined, selected: boolean): string {
  if (!runtime) return 'sim-node';
  return [
    'sim-node',
    runtime.status === 'active' ? 'active' : '',
    runtime.status === 'done' ? 'done' : '',
    runtime.status === 'error' ? 'error' : '',
    selected ? 'selected' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Replace $value.<key> references in a template string from an item. */
export function itemText(template: string | undefined, item: unknown): string {
  if (!template) return '';
  return template.replace(/\$value\.(\w+)/g, (_, key: string) => {
    const value = (item as Record<string, unknown> | undefined)?.[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

/** Render declared chips for values present in the component's data. */
export function Chips({
  chips,
  runtime,
}: {
  chips: ChipDef[] | undefined;
  runtime: ComponentRuntime | undefined;
}) {
  if (!chips || chips.length === 0) return null;
  return (
    <div className="chip-row">
      {chips.map((chip) => {
        const value = runtime?.data[chip.key];
        if (value === undefined || value === null || value === false) return null;
        return (
          <span key={chip.key} className={`chip${chip.variant ? ` ${chip.variant}` : ''}`}>
            {chip.text.replace('$value', String(value))}
          </span>
        );
      })}
    </div>
  );
}
