import type { ReactNode } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { statusClass, type SimNodeData } from './shared';

const POSITION_MAP = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
} as const;

interface NodeShellProps {
  props: NodeProps;
  title: string;
  children: ReactNode;
  ghost?: string;
}

/** Common node chrome: status dot, title, transient label, handles, body. */
export function NodeShell({ props, title, children, ghost }: NodeShellProps) {
  const { runtime, selected, config } = props.data as SimNodeData;
  const absent = ghost !== undefined && runtime?.status === 'absent';
  return (
    <div
      className={absent ? 'sim-node ghost' : statusClass(runtime, selected)}
      style={absent ? { borderStyle: 'dashed', boxShadow: 'none' } : undefined}
    >
      <div className="head">
        <span className="dot" />
        <span className="title">{title}</span>
        {!absent && runtime?.label ? <span className="label">{runtime.label}</span> : null}
      </div>
      <div className="body">
        {absent ? <div className="ghost-note">{ghost}</div> : children}
      </div>
      {(config.handles ?? []).map((h) => (
        <Handle
          key={h.id}
          id={h.id}
          type={h.type}
          position={POSITION_MAP[h.pos]}
          style={h.offset ? { left: h.offset } : undefined}
        />
      ))}
    </div>
  );
}
