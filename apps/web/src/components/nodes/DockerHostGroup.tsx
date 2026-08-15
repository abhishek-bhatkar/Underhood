import type { NodeProps } from '@xyflow/react';
import type { HostGroupData } from './shared';

/** Background group frame: "Docker Host" contains daemon, store, container. */
export function DockerHostGroup(props: NodeProps) {
  const { label } = props.data as HostGroupData;
  return (
    <div className="host-group">
      <span className="tag">{label}</span>
    </div>
  );
}
