import type { NodeProps } from '@xyflow/react';
import { NodeShell } from './NodeShell';
import { itemText, type SimNodeData } from './shared';

interface ListItem {
  [key: string]: unknown;
}

/** List: rows appended over time (loaded classes, heap objects…). */
export function ListNode(props: NodeProps) {
  const { runtime, config } = props.data as SimNodeData;
  const key = config.key ?? 'items';
  const items = ((runtime?.data[key] as ListItem[] | undefined) ?? []);
  return (
    <NodeShell props={props} title={config.label ?? config.id} ghost={config.absentLabel}>
      <div className="list-rows">
        {items.length === 0 ? <div className="list-empty">{config.emptyLabel ?? '-'}</div> : null}
        {items.map((item, i) => (
          <div key={i} className={`row${item.variant ? ` ${String(item.variant)}` : ''}`}>
            <span className="row-dot" />
            <span className="row-text">{itemText(config.itemTemplate, item)}</span>
          </div>
        ))}
      </div>
      <div className="chip-row">
        {(config.chips ?? []).map((chip) => {
          const value = runtime?.data[chip.key];
          if (value === undefined || value === null || value === false) return null;
          return (
            <span key={chip.key} className={`chip${chip.variant ? ` ${chip.variant}` : ''}`}>
              {chip.text.replace('$value', String(value))}
            </span>
          );
        })}
      </div>
    </NodeShell>
  );
}
