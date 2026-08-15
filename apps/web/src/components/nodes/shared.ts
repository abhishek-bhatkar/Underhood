import type { ComponentRuntime } from '@underhood/simulation-engine';

export interface SimNodeData extends Record<string, unknown> {
  runtime: ComponentRuntime;
  selected: boolean;
}

export interface HostGroupData extends Record<string, unknown> {
  label: string;
}

export const statusClass = (runtime: ComponentRuntime, selected: boolean): string =>
  [
    'sim-node',
    runtime.status === 'active' ? 'active' : '',
    runtime.status === 'done' ? 'done' : '',
    selected ? 'selected' : '',
  ]
    .filter(Boolean)
    .join(' ');
