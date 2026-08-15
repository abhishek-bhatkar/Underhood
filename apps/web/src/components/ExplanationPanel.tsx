import type { SimulationEvent } from '@underhood/simulation-engine';

interface ExplanationPanelProps {
  currentEvent: SimulationEvent | null;
  currentStep: number;
  totalSteps: number;
}

/** "Now" panel: what just happened and why it matters. */
export function ExplanationPanel({ currentEvent, currentStep, totalSteps }: ExplanationPanelProps) {
  if (!currentEvent) {
    return (
      <section className="rail-section">
        <p className="rail-eyebrow">Now</p>
        <p className="now-empty">
          Press play — or step through — to watch the command travel through Docker.
        </p>
      </section>
    );
  }

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <section className="rail-section">
      <p className="rail-eyebrow">
        Now <span className="step-counter" data-testid="step-counter">· step {currentStep + 1} / {totalSteps}</span>
      </p>
      <div className="progress-track" aria-hidden>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <h2 className="now-title">{currentEvent.explanation.title}</h2>
      <p className="now-body">{currentEvent.explanation.body}</p>
      {currentEvent.explanation.concept ? (
        <div className="concept-callout">
          <p className="rail-eyebrow">Key concept</p>
          <p>{currentEvent.explanation.concept}</p>
        </div>
      ) : null}
    </section>
  );
}
