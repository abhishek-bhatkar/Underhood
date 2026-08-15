import { describe, it, expect } from 'vitest';
import { deriveState, makeEvent, COMPONENT_IDS } from '../fold';

const ev = (i: number, type: string, source?: string, target?: string, payload?: Record<string, unknown>) =>
  makeEvent(i, type, { source, target, payload });

describe('deriveState', () => {
  it('initial state: currentStep -1, all components idle/absent, empty log', () => {
    const s = deriveState([ev(0, 'COMMAND_ENTERED', 'terminal', 'cli')], -1);
    expect(s.currentStep).toBe(-1);
    expect(s.log).toHaveLength(0);
    for (const id of COMPONENT_IDS) {
      expect(s.components[id].status).toBe(id === 'container' ? 'absent' : 'idle');
    }
  });

  it('COMMAND_ENTERED stores the command on terminal and logs it', () => {
    const s = deriveState([ev(0, 'COMMAND_ENTERED', 'terminal', 'cli', { command: 'docker run nginx' })], 0);
    expect(s.components.terminal.data.command).toBe('docker run nginx');
    expect(s.log.at(-1)?.text).toContain('docker run nginx');
    expect(s.components.cli.status).toBe('active');
  });

  it('CLI_REQUEST marks cli and daemon active with an API log line', () => {
    const s = deriveState([ev(0, 'CLI_REQUEST', 'cli', 'daemon', { method: 'POST', path: '/containers/create' })], 0);
    expect(s.components.cli.status).toBe('active');
    expect(s.components.daemon.status).toBe('active');
    expect(s.log.at(-1)?.text).toContain('POST /containers/create');
  });

  it('LAYER_PULL events accumulate layers on image-store in order', () => {
    const events = [
      ev(0, 'LAYER_PULL', 'registry', 'image-store', { layerIndex: 1, total: 4, name: 'base image', digest: 'aaa' }),
      ev(1, 'LAYER_PULL', 'registry', 'image-store', { layerIndex: 2, total: 4, name: 'binaries', digest: 'bbb' }),
    ];
    const s = deriveState(events, 1);
    expect(s.components['image-store'].data.layers).toEqual([
      { layerIndex: 1, total: 4, name: 'base image', digest: 'aaa' },
      { layerIndex: 2, total: 4, name: 'binaries', digest: 'bbb' },
    ]);
    expect(s.components['image-store'].status).toBe('active');
  });

  it('IMAGE_READY settles registry and image-store', () => {
    const events = [
      ev(0, 'REGISTRY_REQUEST', 'daemon', 'registry', { registry: 'registry-1.docker.io' }),
      ev(1, 'IMAGE_READY', 'image-store', 'daemon', { image: 'nginx:latest' }),
    ];
    const s = deriveState(events, 1);
    expect(s.components.registry.status).toBe('done');
    expect(s.components['image-store'].status).toBe('done');
  });

  it('container lifecycle: absent -> created -> networked -> process -> running', () => {
    const events = [
      ev(0, 'CONTAINER_CREATED', 'daemon', 'container', { containerId: 'e4f5a6b7c8', writableLayer: true }),
      ev(1, 'NETWORK_ATTACHED', 'daemon', 'container', { ip: '172.17.0.2', network: 'bridge', veth: 'veth7a2b' }),
      ev(2, 'PROCESS_STARTED', 'container', 'container', { pid: 1, process: 'nginx: master process' }),
      ev(3, 'CONTAINER_RUNNING', 'container', 'terminal', { status: 'running' }),
    ];
    const mid = deriveState(events, 1);
    expect(mid.components.container.data.containerId).toBe('e4f5a6b7c8');
    expect(mid.components.container.data.ip).toBe('172.17.0.2');
    expect(mid.components.container.data.pid).toBeUndefined();
    const end = deriveState(events, 3);
    expect(end.components.container.status).toBe('done');
    expect(end.components.container.data.pid).toBe(1);
    expect(end.components.container.data.running).toBe(true);
    expect(end.log.at(-1)?.text).toContain('Running');
  });

  it('deriveState is pure: folding to an earlier index discards later effects', () => {
    const events = [
      ev(0, 'COMMAND_ENTERED', 'terminal', 'cli', { command: 'x' }),
      ev(1, 'CONTAINER_CREATED', 'daemon', 'container', { containerId: 'abc' }),
      ev(2, 'CONTAINER_RUNNING', 'container', 'terminal'),
    ];
    expect(deriveState(events, 1)).toEqual(deriveState(events, 1));
    expect(deriveState(events, 0).components.container.data.containerId).toBeUndefined();
  });

  it('unknown event types are ignored without throwing', () => {
    const s = deriveState([ev(0, 'SOMETHING_ELSE', 'cli', 'daemon')], 0);
    expect(s.currentStep).toBe(0);
  });
});
