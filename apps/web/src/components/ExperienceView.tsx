import { useEffect, useState } from 'react';
import { topics, type ExperienceDef } from '../content/registry';
import { useSimulation } from '../simulation/useSimulation';
import { Canvas } from './Canvas';
import { ControlsBar } from './ControlsBar';
import { ExplanationPanel } from './ExplanationPanel';
import { Timeline } from './Timeline';
import { InspectorPanel } from './InspectorPanel';
import { ThemeToggle } from './ThemeToggle';

/** One experience: canvas + rail + transport, fully driven by content. */
export function ExperienceView({ experience }: { experience: ExperienceDef }) {
  const topic = topics[experience.topicId];
  const topicExperiences = topic
    ? Object.values(topic.experiences).sort((a, b) => {
        const order = ['traversal', 'insert-delete', 'two-pointers', 'prefix-sum', 'kadanes-algorithm'];
        const ai = order.indexOf(a.id);
        const bi = order.indexOf(b.id);
        if (ai >= 0 && bi >= 0) return ai - bi;
        if (ai >= 0) return -1;
        if (bi >= 0) return 1;
        return a.id.localeCompare(b.id);
      })
    : [];
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

  useEffect(() => {
    document.body.classList.add('app-shell');
    return () => document.body.classList.remove('app-shell');
  }, []);

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
        {topicExperiences.length > 1 ? (
          <nav className="topic-experience-links" aria-label={`${topic.name} experiences`}>
            {topicExperiences.map((topicExperience) => (
              <a
                data-testid="topic-experience-link"
                className="topic-experience-link"
                href={`#/${topicExperience.topicId}/${topicExperience.id}`}
                aria-current={topicExperience.id === experience.id ? 'page' : undefined}
                key={topicExperience.id}
              >
                {topicExperience.overview.title}
              </a>
            ))}
          </nav>
        ) : null}
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
        <ThemeToggle />
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
