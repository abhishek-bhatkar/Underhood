import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { SimulationEvent, SimulationState } from '@underhood/simulation-engine';
import type { VisualsDef } from '../content/visuals';
import { TerminalNode } from './nodes/TerminalNode';
import { PanelNode } from './nodes/PanelNode';
import { StackNode } from './nodes/StackNode';
import { ListNode } from './nodes/ListNode';
import { GroupNode } from './nodes/GroupNode';
import type { SimNodeData } from './nodes/shared';

const nodeTypes: NodeTypes = {
  terminal: TerminalNode,
  panel: PanelNode,
  stack: StackNode,
  list: ListNode,
  group: GroupNode,
};

interface CanvasProps {
  visuals: VisualsDef;
  state: SimulationState;
  currentEvent: SimulationEvent | null;
  selected: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * Generic graph renderer: node positions, kinds, and edges all come from the
 * experience's visuals.yaml - no topic-specific code lives here.
 */
export function Canvas({ visuals, state, currentEvent, selected, onSelect }: CanvasProps) {
  const nodes = useMemo<Node<SimNodeData>[]>(
    () =>
      visuals.nodes.map((config) => ({
        id: config.id,
        type: config.kind,
        position: config.position,
        style: { width: config.size.w, height: config.size.h },
        data: {
          runtime: state.components[config.id],
          selected: selected === config.id,
          config,
          log: config.kind === 'terminal' ? state.log.map((l) => l.text) : undefined,
        },
        parentId: config.parent,
        extent: config.parent ? ('parent' as const) : undefined,
        draggable: false,
        selectable: config.kind !== 'group',
      })),
    [visuals, state, selected],
  );

  const edges = useMemo<Edge[]>(() => {
    const activeId =
      currentEvent && currentEvent.source && currentEvent.target
        ? `${currentEvent.source}-${currentEvent.target}`
        : null;
    return visuals.edges.map((e) => {
      const isActive = `${e.source}-${e.target}` === activeId;
      return {
        id: `${e.source}-${e.from}-${e.target}-${e.to}`,
        source: e.source,
        sourceHandle: e.from,
        target: e.target,
        targetHandle: e.to,
        animated: isActive,
        className: isActive ? 'active' : undefined,
        type: 'smoothstep',
        // Strokes resolve through CSS variables so they follow the active theme.
        style: { borderRadius: 8, stroke: isActive ? 'var(--work)' : undefined },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 13,
          height: 13,
        },
      };
    });
  }, [visuals, currentEvent]);

  return (
    <div className="rf-wrap">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onSelect(node.type === 'group' ? null : node.id)}
        onPaneClick={() => onSelect(null)}
        fitView
        fitViewOptions={{ padding: 0.12, maxZoom: 1 }}
        nodesConnectable={false}
        edgesFocusable
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} color="#1c2b47" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
