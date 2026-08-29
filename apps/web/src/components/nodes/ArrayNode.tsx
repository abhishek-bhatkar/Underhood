import type { NodeProps } from '@xyflow/react';
import { NodeShell } from './NodeShell';
import { itemText, type SimNodeData } from './shared';

interface ArrayCell {
  value?: unknown;
  active?: boolean;
  moving?: boolean;
  state?: string;
  [key: string]: unknown;
}

interface ArrayPointer {
  index?: number;
  label?: string;
}

interface ArrayRange {
  start?: number;
  end?: number;
  label?: string;
}

function cellText(cell: ArrayCell, template: string | undefined): string {
  if (template) {
    if (template === '$value') {
      if (cell.value !== undefined && cell.value !== null) return String(cell.value);
      return String(cell);
    }
    const templated = itemText(template, cell);
    if (templated) return templated;
  }
  if (cell.value !== undefined && cell.value !== null) return String(cell.value);
  return String(cell);
}

function pointerIndexes(pointer: unknown): ArrayPointer[] {
  if (pointer === undefined || pointer === null) return [];
  if (Array.isArray(pointer)) {
    return pointer.flatMap((entry) => pointerIndexes(entry));
  }
  if (typeof pointer === 'number') return [{ index: pointer }];
  if (typeof pointer === 'object') return [pointer as ArrayPointer];
  return [];
}

function rangeEntries(range: unknown): ArrayRange[] {
  if (range === undefined || range === null) return [];
  if (Array.isArray(range)) {
    return range.flatMap((entry) => rangeEntries(entry));
  }
  if (typeof range === 'object') return [range as ArrayRange];
  return [];
}

/** Array: indexed cells, pointer markers, selected windows, and cell motion. */
export function ArrayNode(props: NodeProps) {
  const { runtime, config } = props.data as SimNodeData;
  const cells = ((runtime?.data[config.key ?? ''] as ArrayCell[] | undefined) ?? []);
  const pointers = [
    ...(config.pointerKey ? pointerIndexes(runtime?.data[config.pointerKey]) : []),
    ...(config.pointerKeys ?? []).flatMap((key) =>
      pointerIndexes(runtime?.data[key]).map((pointer) => ({ ...pointer, label: pointer.label ?? key })),
    ),
  ];
  const ranges = [
    ...(config.rangeKey ? rangeEntries(runtime?.data[config.rangeKey]) : []),
    ...(config.rangeKeys && config.rangeKeys.length >= 2
      ? [{ start: runtime?.data[config.rangeKeys[0]] as number, end: runtime?.data[config.rangeKeys[1]] as number }]
      : []),
  ];

  return (
    <NodeShell props={props} title={config.label ?? config.id} ghost={config.absentLabel}>
      <div className="array-grid" role="grid" aria-label={config.label ?? config.id}>
        {cells.map((cell, index) => {
          const pointer = pointers.find((entry) => entry.index === index);
          const range = ranges.find(
            (entry) =>
              typeof entry.start === 'number' &&
              typeof entry.end === 'number' &&
              index >= entry.start &&
              index <= entry.end,
          );
          const cls = [
            'array-cell',
            cell.state === 'read' ? 'read' : '',
            cell.state === 'write' || cell.state === 'written' ? 'write' : '',
            cell.active ? 'active' : '',
            cell.moving || cell.state === 'moved' ? 'moving' : '',
            cell.state === 'stale' ? 'stale' : '',
            pointer ? 'pointer' : '',
            range ? 'range' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div key={index} className={cls} role="gridcell" aria-selected={cell.active || undefined}>
              <div className="array-meta">
                <span className="array-index">{index}</span>
                {pointer ? <span className="array-pointer">{pointer.label ?? config.pointerKey}</span> : null}
                {range ? (
                  <span className="array-range">
                    {range.label ?? `${range.start} - ${range.end}`}
                  </span>
                ) : null}
              </div>
              <div className="array-value">{cellText(cell, config.itemTemplate)}</div>
            </div>
          );
        })}
      </div>
    </NodeShell>
  );
}
