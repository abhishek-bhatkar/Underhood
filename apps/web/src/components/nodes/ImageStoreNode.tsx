import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NodeShell } from './NodeShell';
import type { SimNodeData } from './shared';

interface PulledLayer {
  layerIndex: number;
  name: string;
  digest: string;
}

const TOTAL_SLOTS = 4;

/** Local image store: read-only layers filling bottom-up as they are pulled. */
export function ImageStoreNode(props: NodeProps) {
  const { runtime } = props.data as SimNodeData;
  const layers = (runtime.data.layers as PulledLayer[] | undefined) ?? [];
  const byIndex = new Map(layers.map((l) => [l.layerIndex, l]));
  const slots = [...Array(TOTAL_SLOTS).keys()].map((i) => TOTAL_SLOTS - i); // top = highest layer
  return (
    <NodeShell props={props} title="Local Image Store">
      <div className="layer-stack">
        {slots.map((index) => {
          const layer = byIndex.get(index);
          return (
            <div key={index} className={`layer-slot${layer ? ' filled' : ''}`}>
              {layer ? (
                <>
                  {layer.name}
                  <span className="digest">{layer.digest}</span>
                </>
              ) : (
                `layer ${index} — empty`
              )}
            </div>
          );
        })}
      </div>
      <Handle type="target" position={Position.Top} id="from-registry" style={{ left: '50%' }} />
      <Handle type="target" position={Position.Left} id="from-daemon" />
      <Handle type="source" position={Position.Top} id="ready" style={{ left: '80%' }} />
    </NodeShell>
  );
}
