import type { NodeProps } from '@xyflow/react';
import { NodeShell } from './NodeShell';
import { Chips, type SimNodeData } from './shared';

/** Panel: a titled component with fixed descriptive lines and optional chips. */
export function PanelNode(props: NodeProps) {
  const { runtime, config } = props.data as SimNodeData;
  return (
    <NodeShell props={props} title={config.label ?? config.id}>
      <div className="term-body">
        {(config.lines ?? []).map((line) => (
          <div key={line} className="out">
            {line}
          </div>
        ))}
      </div>
      <Chips chips={config.chips} runtime={runtime} />
    </NodeShell>
  );
}
