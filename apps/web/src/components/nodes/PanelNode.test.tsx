import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { NodeProps } from '@xyflow/react';
import { PanelNode } from './PanelNode';

describe('PanelNode', () => {
  it('renders runtime values in declarative panel lines', () => {
    const props = {
      id: 'operation',
      data: {
        selected: false,
        config: {
          id: 'operation',
          kind: 'panel',
          label: 'Operation',
          lines: ['from → to → $value', 'shifts · writes · deletes'],
          handles: [],
        },
        runtime: {
          id: 'operation',
          status: 'active',
          data: { from: 3, to: 4, value: 40, shifts: 1, writes: 0, deletes: 0 },
        },
      },
    } as unknown as NodeProps;

    render(<PanelNode {...props} />);

    expect(screen.getByText('from → to → 40')).toBeTruthy();
    expect(screen.getByText('shifts · writes · deletes')).toBeTruthy();
  });
});
