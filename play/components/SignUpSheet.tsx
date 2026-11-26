import type { Game } from "@/lib/types";

export function SignUpSheet({
  game,
  myName,
}: {
  game: Game;
  myName: string;
}) {
  const slots = Array.from({ length: game.spots }, (_, i) => game.roster[i] ?? "");
  return (
    <div className="sheet">
      <h4>
        Sign-up sheet · {game.when}
      </h4>
      <ol>
        {slots.map((name, i) => (
          <li key={i} className={name && name === myName ? "me" : undefined}>
            <span className="num">{i + 1}</span>
            {name}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function SheetMeter({ game }: { game: Game }) {
  const n = game.roster.length;
  const full = n >= game.spots;
  return (
    <>
      <div
        className={`meter ${full ? "full" : ""}`}
        role="img"
        aria-label={`${n} of ${game.spots} spots taken`}
      >
        <b style={{ width: `${Math.min(100, (n / game.spots) * 100)}%` }} />
      </div>
      <div className="row between">
        <span className="small muted num">
          {n} of {game.spots} signed up
        </span>
      </div>
    </>
  );
}

