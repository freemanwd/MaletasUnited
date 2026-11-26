import { workoutChips, type WorkoutStats } from "@/lib/fitness";

export function WorkoutStatStrip({ stats }: { stats: WorkoutStats }) {
  const chips = workoutChips(stats);
  if (!chips.length) return null;
  return (
    <ul className="stat-strip" aria-label="Workout stats">
      {chips.map((chip) => (
        <li key={chip.label}>
          <b className="num">{chip.value}</b> {chip.label}
        </li>
      ))}
    </ul>
  );
}
