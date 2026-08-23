import { useEffect, useRef } from 'react';
import type { SimulationEvent, SimulationPlayer } from '@underhood/simulation-engine';
import type { LogEntry } from '@underhood/simulation-engine';

interface TimelineProps {
  events: SimulationEvent[];
  log: LogEntry[];
  currentStep: number;
  player: SimulationPlayer;
}

/** Timeline: one scrub target per event, plus a clickable log of what happened. */
export function Timeline({ events, log, currentStep, player }: TimelineProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [currentStep]);

  return (
    <>
      <div
        className="timeline-ticks"
        role="group"
        aria-label="Timeline - one button per event"
      >
        {events.map((event, i) => (
          <button
            key={event.id}
            ref={i === currentStep ? activeRef : undefined}
            className={`tl-tick${i < currentStep ? ' past' : ''}${i === currentStep ? ' current' : ''}`}
            onClick={() => player.seek(i)}
            title={event.explanation.title}
            aria-label={`Step ${i + 1}: ${event.explanation.title}`}
            aria-current={i === currentStep ? 'step' : undefined}
          />
        ))}
      </div>
      <div className="log-strip" ref={logRef} aria-label="Event log">
        {log.length === 0 ? (
          <span>
            <span className="prompt">$</span> waiting…
          </span>
        ) : (
          log.map((entry) => (
            <span key={entry.eventIndex}>
              {entry.eventIndex > 0 ? <span className="sep">·</span> : null}
              {entry.text}
            </span>
          ))
        )}
      </div>
    </>
  );
}
