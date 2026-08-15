import type { NodeProps } from '@xyflow/react';
import { NodeShell } from './NodeShell';
import { itemText, type SimNodeData } from './shared';

interface StackItem {
  label?: string;
  variant?: string;
  [key: string]: unknown;
}

/**
 * Stack: rows fill bottom-up from data[key] (image layers, call frames…).
 * Fixed `slots` show placeholders for unseen rows; items may carry a
 * `variant` (rendered as a row class) plus chips and a footer line.
 */
export function StackNode(props: NodeProps) {
  const { runtime, config } = props.data as SimNodeData;
  const items = ((runtime?.data[config.key ?? ''] as StackItem[] | undefined) ?? []);
  const variantKey = config.variantKey;

  const slots = config.slots ?? 0;
  const total = Math.max(slots, items.length);
  const rows = [...Array(total).keys()].reverse().map((index) => ({
    index,
    item: items[index] as StackItem | undefined,
  }));

  return (
    <NodeShell props={props} title={config.label ?? config.id} ghost={config.absentLabel}>
      <div className="layer-stack">
        {rows.map(({ index, item }) => {
          const variant = variantKey ? (item?.[variantKey] as string | undefined) : undefined;
          const cls = [
            'layer-slot',
            item ? 'filled' : '',
            variant === 'writable' ? 'writable' : '',
            variant === 'image' ? 'image' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div key={index} className={cls}>
              {item ? (
                <>
                  {itemText(config.itemTemplate, item)}
                  {config.subTemplate ? (
                    <span className="digest">{itemText(config.subTemplate, item)}</span>
                  ) : null}
                </>
              ) : (
                (config.emptyLabel ?? '').replace('$index', String(index + 1))
              )}
            </div>
          );
        })}
      </div>
      {(config.chips ?? []).length > 0 || config.footerKey ? (
        <div className="stack-extras">
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
          {config.footerKey && runtime?.data[config.footerKey] ? (
            <div className="cid">{String(runtime.data[config.footerKey])}</div>
          ) : null}
        </div>
      ) : null}
    </NodeShell>
  );
}
