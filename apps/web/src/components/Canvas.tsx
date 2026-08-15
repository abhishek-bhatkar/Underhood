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
import { TerminalNode } from './nodes/TerminalNode';
import { CliNode } from './nodes/CliNode';
import { DaemonNode } from './nodes/DaemonNode';
import { RegistryNode } from './nodes/RegistryNode';
import { ImageStoreNode } from './nodes/ImageStoreNode';
import { ContainerNode } from './nodes/ContainerNode';
import { DockerHostGroup } from './nodes/DockerHostGroup';
import type { HostGroupData, SimNodeData } from './nodes/shared';

const nodeTypes: NodeTypes = {
  terminal: TerminalNode,
  cli: CliNode,
  daemon: DaemonNode,
  registry: RegistryNode,
  'image-store': ImageStoreNode,
  container: ContainerNode,
  'host-group': DockerHostGroup,
};

/** Static edge definitions; ids map component pairs for activity matching. */
const EDGE_DEFS: { id: string; source: string; sourceHandle: string; target: string; targetHandle: string }[] = [
  { id: 'terminal-cli', source: 'terminal', sourceHandle: 'out', target: 'cli', targetHandle: 'in' },
  { id: 'cli-daemon', source: 'cli', sourceHandle: 'out', target: 'daemon', targetHandle: 'in' },
  { id: 'daemon-registry', source: 'daemon', sourceHandle: 'to-registry', target: 'registry', targetHandle: 'in' },
  { id: 'registry-store', source: 'registry', sourceHandle: 'out', target: 'image-store', targetHandle: 'from-registry' },
  { id: 'daemon-store', source: 'daemon', sourceHandle: 'to-store', target: 'image-store', targetHandle: 'from-daemon' },
  { id: 'daemon-container', source: 'daemon', sourceHandle: 'to-container', target: 'container', targetHandle: 'in' },
];

interface CanvasProps {
  state: SimulationState;
  currentEvent: SimulationEvent | null;
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function Canvas({ state, currentEvent, selected, onSelect }: CanvasProps) {
  const nodes = useMemo<Node<SimNodeData | HostGroupData>[]>(() => {
    const sim = (id: string) => state.components[id];
    const simData = (id: string, extra: Record<string, unknown> = {}): SimNodeData => ({
      runtime: sim(id),
      selected: selected === id,
      ...extra,
    });
    return [
      {
        id: 'terminal',
        type: 'terminal',
        position: { x: 0, y: 0 },
        style: { width: 250, height: 175 },
        data: { ...simData('terminal', { log: state.log.map((l) => l.text) }) },
        draggable: false,
      },
      {
        id: 'cli',
        type: 'cli',
        position: { x: 300, y: 10 },
        style: { width: 230, height: 150 },
        data: simData('cli'),
        draggable: false,
      },
      {
        id: 'registry',
        type: 'registry',
        position: { x: 900, y: 0 },
        style: { width: 270, height: 160 },
        data: simData('registry'),
        draggable: false,
      },
      {
        id: 'docker-host',
        type: 'host-group',
        position: { x: 0, y: 230 },
        style: { width: 1160, height: 440 },
        data: { label: 'Docker Host' } as HostGroupData,
        draggable: false,
        selectable: false,
      },
      {
        id: 'daemon',
        type: 'daemon',
        position: { x: 40, y: 60 },
        style: { width: 270, height: 200 },
        data: simData('daemon'),
        parentId: 'docker-host',
        extent: 'parent',
        draggable: false,
      },
      {
        id: 'image-store',
        type: 'image-store',
        position: { x: 380, y: 70 },
        style: { width: 310, height: 320 },
        data: simData('image-store'),
        parentId: 'docker-host',
        extent: 'parent',
        draggable: false,
      },
      {
        id: 'container',
        type: 'container',
        position: { x: 790, y: 60 },
        style: { width: 330, height: 340 },
        data: simData('container'),
        parentId: 'docker-host',
        extent: 'parent',
        draggable: false,
      },
    ];
  }, [state, selected]);

  const edges = useMemo<Edge[]>(() => {
    const activeId =
      currentEvent && currentEvent.source && currentEvent.target
        ? `${currentEvent.source}-${currentEvent.target}`
        : null;
    return EDGE_DEFS.map((def) => {
      const isActive = def.id === activeId;
      return {
        ...def,
        animated: isActive,
        className: isActive ? 'active' : undefined,
        type: 'smoothstep',
        style: { borderRadius: 8, stroke: isActive ? '#ffb454' : undefined },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 13,
          height: 13,
          color: isActive ? '#ffb454' : '#223350',
        },
      };
    });
  }, [currentEvent]);

  return (
    <div className="rf-wrap">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onSelect(node.id === 'docker-host' ? null : node.id)}
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
