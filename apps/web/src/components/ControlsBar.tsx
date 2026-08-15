import type { PlayerSnapshot, SimulationPlayer } from '@underhood/simulation-engine';

const SPEEDS = [0.5, 1, 2, 4];

interface ControlsBarProps {
  snapshot: PlayerSnapshot;
  player: SimulationPlayer;
  totalSteps: number;
}

export function ControlsBar({ snapshot, player, totalSteps }: ControlsBarProps) {
  const { status, currentStep, speed } = snapshot;
  const atStart = currentStep < 0;
  const atEnd = currentStep >= totalSteps - 1;
  const playing = status === 'playing';

  return (
    <div className="transport-row">
      <div className="transport-buttons" role="group" aria-label="Playback">
        <button
          className="t-btn"
          onClick={() => player.restart()}
          disabled={atStart}
          title="Restart"
          aria-label="Restart"
        >
          <span className="glyph">⏮</span>
        </button>
        <button
          className="t-btn"
          onClick={() => player.prev()}
          disabled={atStart}
          title="Step back"
          aria-label="Step back"
        >
          <span className="glyph">◀</span>
        </button>
        <button
          className="t-btn play"
          onClick={() => (playing ? player.pause() : player.play())}
          disabled={atEnd}
          title={playing ? 'Pause' : 'Play'}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          <span className="glyph">{playing ? '❙❙' : '▶'}</span>
        </button>
        <button
          className="t-btn"
          onClick={() => player.next()}
          disabled={atEnd}
          title="Step forward"
          aria-label="Step forward"
        >
          <span className="glyph">▶❙</span>
        </button>
      </div>
      <label className="sr-only" htmlFor="speed-select">
        Playback speed
      </label>
      <select
        id="speed-select"
        className="speed-select"
        value={speed}
        onChange={(e) => player.setSpeed(Number(e.target.value))}
        title="Playback speed"
      >
        {SPEEDS.map((s) => (
          <option key={s} value={s}>
            {s}x
          </option>
        ))}
      </select>
      <span className={`status-chip${playing ? ' playing' : ''}${status === 'ended' ? ' ended' : ''}`}>
        {status}
      </span>
    </div>
  );
}
