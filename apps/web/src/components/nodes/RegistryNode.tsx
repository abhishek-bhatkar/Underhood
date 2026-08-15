import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NodeShell } from './NodeShell';

/** Registry (Docker Hub): serves manifests and layer blobs. */
export function RegistryNode(props: NodeProps) {
  return (
    <NodeShell props={props} title="Registry · Docker Hub">
      <div className="term-body">
        <div className="out">registry-1.docker.io</div>
        <div className="out">library/nginx:latest</div>
        <div className="out">manifest · layer blobs</div>
      </div>
      <Handle type="target" position={Position.Left} id="in" />
      <Handle type="source" position={Position.Bottom} id="out" style={{ left: '50%' }} />
    </NodeShell>
  );
}
