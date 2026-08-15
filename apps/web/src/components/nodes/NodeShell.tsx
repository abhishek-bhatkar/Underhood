import type { ReactNode } from 'react';
import type { NodeProps } from '@xyflow/react';
import { statusClass, type SimNodeData } from './shared';

interface NodeShellProps {
  props: NodeProps;
  title: string;
  children: ReactNode;
  labelWidth?: string;
}

/** Common node chrome: status dot, title, transient label, body slot. */
export function NodeShell({ props, title, children }: NodeShellProps) {
  const { runtime, selected } = props.data as SimNodeData;
  return (
    <div className={statusClass(runtime, selected)}>
      <div className="head">
        <span className="dot" />
        <span className="title">{title}</span>
        {runtime.label ? <span className="label">{runtime.label}</span> : null}
      </div>
      <div className="body">{children}</div>
    </div>
  );
}
