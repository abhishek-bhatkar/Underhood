import { useEffect, useState } from 'react';
import type { ExperienceDef } from '../content/registry';
import { useSimulation } from '../simulation/useSimulation';
import { Canvas } from './Canvas';
import { ControlsBar } from './ControlsBar';
import { ExplanationPanel } from './ExplanationPanel';
import { Timeline } from './Timeline';
import { InspectorPanel } from './InspectorPanel';

/** One experience: canvas + rail + transport, fully driven by content. */
export function ExperienceView({ experience }: { experience: ExperienceDef }) {
  const scenarioIds = Object.keys(experience.scenarios);
  const [scenarioId, setScenarioId] = useState(scenarioIds[0]);
  const [selected, setSelected] = useState<string | null>(null);
  const scenario = experience.scenarios[scenarioId] ?? experience.scenarios[scenarioIds[0]];
  const { snapshot, player, events } = useSimulation(scenario);
  const currentEvent = snapshot.currentStep >= 0 ? events[snapshot.currentStep] : null;

  useEffect(() => {
    setScenarioId(Object.keys(experience.scenarios)[0]);
    setSelected(null);
  }, [experience]);

  const switchScenario = (id: string) => {
    setScenarioId(id);
    setSelected(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <a className="app-brand" href="#/">
          Underhood
        </a>
        <h1 className="app-title">{experience.overview.title}</h1>
        <span className="spacer" />
        {scenarioIds.length > 1 ? (
          <div className="scenario-toggle" role="group" aria-label="Scenario">
            {scenarioIds.map((id) => (
              <button
                key={id}
                aria-pressed={id === scenarioId}
                onClick={() => switchScenario(id)}
              >
                {experience.scenarios[id].name}
              </button>
            ))}
          </div>
        ) : null}
      </header>
      <div className="app-body">
        <div className="app-canvas-wrap">
          <Canvas
            visuals={experience.visuals}
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
          {selected && experience.concepts[selected] ? (
            <InspectorPanel
              componentId={selected}
              concept={experience.concepts[selected]}
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
