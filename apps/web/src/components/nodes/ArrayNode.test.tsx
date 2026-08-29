import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ReactFlowProvider, type NodeProps } from '@xyflow/react';
import { deriveState, materializeEvents, parseSimulationYaml } from '@underhood/simulation-engine';
import { parseVisualsYaml } from '../../content/visuals';
import { ArrayNode } from './ArrayNode';

describe('ArrayNode', () => {
  it('renders indexes, values, active cells, pointers, a range, and movement state', () => {
    const props = {
      id: 'array',
      data: {
        selected: false,
        config: {
          id: 'array',
          kind: 'array',
          label: 'Heap array',
          key: 'items',
          itemTemplate: '$value',
          pointerKeys: ['cursor'],
          rangeKeys: ['start', 'end'],
          handles: [],
        },
        runtime: {
          id: 'array',
          status: 'active',
          label: 'mutating',
          data: {
            items: [
              { value: 11 },
              { value: 22, active: true },
              { value: 33, moving: true },
              { value: 44 },
            ],
            cursor: 1,
            start: 1,
            end: 2,
          },
        },
      },
    } as unknown as NodeProps;

    const { container } = render(<ReactFlowProvider><ArrayNode {...props} /></ReactFlowProvider>);

    expect(screen.getByText('Heap array')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('11')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('22')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('33')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('44')).toBeTruthy();
    expect(screen.getByText('cursor')).toBeTruthy();
    expect(container.querySelectorAll('.array-range')).toHaveLength(2);
    expect(container.querySelector('.array-cell.active')).toBeTruthy();
    expect(container.querySelector('.array-cell.pointer')).toBeTruthy();
    expect(container.querySelector('.array-cell.range')).toBeTruthy();
    expect(container.querySelector('.array-cell.moving')).toBeTruthy();
  });

  it('renders generic read and write cell states', () => {
    const props = {
      id: 'array',
      data: {
        selected: false,
        config: {
          id: 'array',
          kind: 'array',
          key: 'items',
          handles: [],
        },
        runtime: {
          id: 'array',
          status: 'active',
          data: {
            items: [{ value: 11, state: 'read' }, { value: 22, state: 'write' }],
          },
        },
      },
    } as unknown as NodeProps;

    const { container } = render(<ReactFlowProvider><ArrayNode {...props} /></ReactFlowProvider>);

    expect(container.querySelector('.array-cell.read')).toBeTruthy();
    expect(container.querySelector('.array-cell.write')).toBeTruthy();
  });

  it('renders movement and stale states from a folded Insert & Delete snapshot', () => {
    const root = resolve(__dirname, '../../../../../');
    const simulation = parseSimulationYaml(readFileSync(resolve(root, 'content/arrays/insert-delete/simulation.yaml'), 'utf8'));
    const visuals = parseVisualsYaml(readFileSync(resolve(root, 'content/arrays/insert-delete/visuals.yaml'), 'utf8'), 'arrays/insert-delete/visuals.yaml');
    const scenario = simulation.find((item) => item.id === 'middle-delete')!;
    const events = materializeEvents(scenario);
    const runtime = deriveState(events, 2, scenario.components).components.array;
    const config = visuals.nodes.find((node) => node.id === 'array')!;
    const props = { id: 'array', data: { selected: false, config, runtime } } as unknown as NodeProps;

    const { container } = render(<ReactFlowProvider><ArrayNode {...props} /></ReactFlowProvider>);

    expect(container.querySelectorAll('.array-cell.moving')).toHaveLength(2);
    expect(container.querySelectorAll('.array-cell.stale')).toHaveLength(1);
  });

  it('defines a theme-aware stale style for removed-but-visible cells', () => {
    const css = readFileSync(resolve(__dirname, '../../index.css'), 'utf8');
    expect(css).toMatch(/\.array-cell\.stale\s*\{/);
    expect(css).toMatch(/\.array-cell\.stale[\s\S]*color-mix\(in srgb, var\(--ink-faint\)/);
  });
});
