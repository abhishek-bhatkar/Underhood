import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import {
  SimulationPlayer,
  materializeEvents,
  type PlayerSnapshot,
  type ScenarioDef,
  type SimulationEvent,
} from '@underhood/simulation-engine';

export interface UseSimulation {
  snapshot: PlayerSnapshot;
  player: SimulationPlayer;
  events: SimulationEvent[];
}

/**
 * Bind a scenario to a SimulationPlayer for the lifetime of the scenario
 * object; re-creates (and destroys) the player when the scenario changes.
 */
export function useSimulation(scenario: ScenarioDef): UseSimulation {
  const events = useMemo(() => materializeEvents(scenario), [scenario]);
  const player = useMemo(
    () => new SimulationPlayer(events, scenario.components ?? []),
    [events, scenario],
  );

  useEffect(() => () => player.destroy(), [player]);

  const subscribe = useCallback((onChange: () => void) => player.subscribe(onChange), [player]);
  const getSnapshot = useCallback(() => player.getSnapshot(), [player]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return { snapshot, player, events };
}
