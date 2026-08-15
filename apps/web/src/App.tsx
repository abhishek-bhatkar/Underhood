import { useState } from 'react';
import { loadDockerRunContent } from './content/loader';
import { useSimulation } from './simulation/useSimulation';
import { Canvas } from './components/Canvas';

const content = loadDockerRunContent();

export default function App() {
  const [scenarioId, setScenarioId] = useState<'pull' | 'cached'>('pull');
  const [selected, setSelected] = useState<string | null>(null);
  const { snapshot, events } = useSimulation(content.scenarios[scenarioId]);
  const currentEvent = snapshot.currentStep >= 0 ? events[snapshot.currentStep] : null;

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-brand">Underhood</span>
        <h1 className="app-title">
          What happens when you run <span className="cmd">docker run nginx</span>?
        </h1>
        <span className="spacer" />
        <div className="scenario-toggle" role="group" aria-label="Scenario">
          <button aria-pressed={scenarioId === 'pull'} onClick={() => setScenarioId('pull')}>
            Pull image
          </button>
          <button aria-pressed={scenarioId === 'cached'} onClick={() => setScenarioId('cached')}>
            Image cached
          </button>
        </div>
      </header>
      <div className="app-body">
        <div className="app-canvas-wrap">
          <Canvas
            state={snapshot.state}
            currentEvent={currentEvent}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
        <aside className="app-rail">
          <section className="rail-section">
            <p className="now-empty">Transport controls arrive next.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
