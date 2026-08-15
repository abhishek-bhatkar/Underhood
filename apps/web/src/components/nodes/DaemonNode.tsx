import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NodeShell } from './NodeShell';

/** Docker daemon (dockerd): the server that does all the work. */
export function DaemonNode(props: NodeProps) {
  return (
    <NodeShell props={props} title="Docker Daemon">
      <div className="term-body">
        <div className="out">dockerd</div>
        <div className="out">REST API · image store</div>
        <div className="out">containerd · runc</div>
      </div>
      <Handle type="target" position={Position.Top} id="in" />
      <Handle type="source" position={Position.Right} id="to-registry" />
      <Handle type="source" position={Position.Bottom} id="to-store" style={{ left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="to-container" style={{ left: '70%' }} />
    </NodeShell>
  );
}
