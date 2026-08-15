import type { NodeProps } from '@xyflow/react';
import type { SimNodeData } from './shared';

/** Group: a labeled background frame containing other nodes. */
export function GroupNode(props: NodeProps) {
  const { config } = props.data as SimNodeData;
  return (
    <div className="host-group">
      <span className="tag">{config.label ?? config.id}</span>
    </div>
  );
}
