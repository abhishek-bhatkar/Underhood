import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NodeShell } from './NodeShell';
import type { SimNodeData } from './shared';

/** Terminal: shows the typed command plus the tail of the daemon log. */
export function TerminalNode(props: NodeProps) {
  const { runtime } = props.data as SimNodeData;
  const log = (props.data as SimNodeData & { log: string[] }).log ?? [];
  const command = runtime.data.command as string | undefined;
  const tail = log.slice(-5);
  return (
    <NodeShell props={props} title="Terminal">
      <div className="term-body">
        <div>
          <span className="prompt">$ </span>
          <span className="cmd">{command ?? '…'}</span>
        </div>
        {tail.map((line, i) => (
          <div key={i} className={`out${i === tail.length - 1 ? ' latest' : ''}`}>
            {line}
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} id="out" />
    </NodeShell>
  );
}
