import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NodeShell } from './NodeShell';

/** Docker CLI: thin client. Shows the API call it is making. */
export function CliNode(props: NodeProps) {
  return (
    <NodeShell props={props} title="Docker CLI">
      <div className="term-body">
        <div className="out">client binary</div>
        <div className="out">unix:///var/run/docker.sock</div>
      </div>
      <Handle type="target" position={Position.Left} id="in" />
      <Handle type="source" position={Position.Bottom} id="out" />
    </NodeShell>
  );
}
