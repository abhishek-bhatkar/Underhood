import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NodeShell } from './NodeShell';
import type { SimNodeData } from './shared';

const IMAGE_LAYER_NAMES = ['base image', 'distro packages', 'nginx binaries', 'nginx config'];

/**
 * Container: dashed ghost until created, then a stack of read-only image
 * layers with the amber writable layer on top, plus live chips.
 */
export function ContainerNode(props: NodeProps) {
  const { runtime } = props.data as SimNodeData;
  const { data, status } = runtime;
  const created = status !== 'absent';
  const running = data.running === true;

  if (!created) {
    return (
      <div className="sim-node" style={{ borderStyle: 'dashed', boxShadow: 'none' }}>
        <div className="head">
          <span className="dot" />
          <span className="title">Container</span>
        </div>
        <div className="body">
          <div className="ghost-note">not created yet — watch the daemon build this</div>
        </div>
        <Handle type="target" position={Position.Top} id="in" style={{ opacity: 0 }} />
      </div>
    );
  }

  return (
    <NodeShell props={props} title="Container">
      <div className="layer-stack">
        <div className={`layer-slot writable${running ? ' on' : ''}`}>writable layer (container's own)</div>
        {[...IMAGE_LAYER_NAMES].reverse().map((name) => (
          <div key={name} className="layer-slot filled" style={{ opacity: 0.65 }}>
            {name}
          </div>
        ))}
      </div>
      <div className="chip-row">
        <span className={`chip${data.ip ? ' net' : ''}`}>{data.ip ? `IP ${data.ip}` : 'no network'}</span>
        <span className={`chip${data.pid ? ' pid' : ''}`}>{data.pid ? `PID ${data.pid} · nginx` : 'no process'}</span>
        {running ? <span className="chip on">running</span> : null}
      </div>
      <div className="cid">{String(data.containerId ?? '')}</div>
      <Handle type="target" position={Position.Top} id="in" />
    </NodeShell>
  );
}
