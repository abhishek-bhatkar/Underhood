import { describe, expect, it } from 'vitest';
import { parseVisualsYaml } from './visuals';

describe('parseVisualsYaml', () => {
  it('accepts array nodes with generic array config fields', () => {
    const yaml = `
nodes:
  - id: values
    kind: array
    position: { x: 10, y: 20 }
    size: { w: 320, h: 180 }
    key: items
    itemTemplate: "$value"
    pointerKey: cursor
    rangeKey: window
edges: []
`;

    const visuals = parseVisualsYaml(yaml, 'fixtures/array.yaml');

    expect(visuals.nodes).toHaveLength(1);
    expect(visuals.nodes[0]).toMatchObject({
      id: 'values',
      kind: 'array',
      key: 'items',
      itemTemplate: '$value',
      pointerKey: 'cursor',
      rangeKey: 'window',
    });
  });

  it('rejects an array node without its data key', () => {
    const yaml = `
nodes:
  - id: values
    kind: array
    position: { x: 10, y: 20 }
    size: { w: 320, h: 180 }
edges: []
`;

    expect(() => parseVisualsYaml(yaml, 'fixtures/array.yaml')).toThrow(/key/i);
  });

  it('retains plural pointer and range bindings used by array experiences', () => {
    const visuals = parseVisualsYaml(`
nodes:
  - id: values
    kind: array
    position: { x: 0, y: 0 }
    size: { w: 400, h: 160 }
    key: cells
    pointerKeys: [left, right]
    rangeKeys: [start, end]
edges: []
`, 'fixtures/array-plural.yaml');

    expect(visuals.nodes[0]).toMatchObject({ pointerKeys: ['left', 'right'], rangeKeys: ['start', 'end'] });
  });
});
