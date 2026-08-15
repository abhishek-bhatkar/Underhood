import { useEffect, useState } from 'react';
import { loadDockerRunContent } from './content/loader';
import { useSimulation } from './simulation/useSimulation';
import { Canvas } from './components/Canvas';
import { ControlsBar } from './components/ControlsBar';
import { ExplanationPanel } from './components/ExplanationPanel';
import { Timeline } from './components/Timeline';
import { InspectorPanel } from './components/InspectorPanel';

const content = loadDockerRunContent();

export default function App() {
  const [scenarioId, setScenarioId] = useState<'pull' | 'cached'>('pull');
  const [selected, setSelected] = useState<string | null>(null);
  const { snapshot, player, events } = useSimulation(content.scenarios[scenarioId]);
  const currentEvent = snapshot.currentStep >= 0 ? events[snapshot.currentStep] : null;

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const switchScenario = (id: 'pull' | 'cached') => {
    setScenarioId(id);
    setSelected(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-brand">Underhood</span>
        <h1 className="app-title">
          What happens when you run <span className="cmd">docker run nginx</span>?
        </h1>
        <span className="spacer" />
        <div className="scenario-toggle" role="group" aria-label="Scenario">
          <button aria-pressed={scenarioId === 'pull'} onClick={() => switchScenario('pull')}>
            Pull image
          </button>
          <button aria-pressed={scenarioId === 'cached'} onClick={() => switchScenario('cached')}>
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
          <ExplanationPanel
            currentEvent={currentEvent}
            currentStep={snapshot.currentStep}
            totalSteps={events.length}
          />
          {selected && content.concepts[selected] ? (
            <InspectorPanel
              componentId={selected}
              concept={content.concepts[selected]}
              runtime={snapshot.state.components[selected]}
              onClose={() => setSelected(null)}
            />
          ) : null}
        </aside>
      </div>
      <footer className="app-transport">
        <ControlsBar snapshot={snapshot} player={player} totalSteps={events.length} />
        <Timeline
          events={events}
          log={snapshot.state.log}
          currentStep={snapshot.currentStep}
          player={player}
        />
      </footer>
    </div>
  );
}
