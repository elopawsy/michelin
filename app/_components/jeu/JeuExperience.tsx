"use client";

import { useCallback, useState } from "react";
import { GameClient, type JeuUser } from "./GameClient";
import { Leaderboard } from "./Leaderboard";

/* Assemble le jeu et le classement : un score soumis déclenche le
   rafraîchissement du leaderboard via `refreshKey`. */
export function JeuExperience({ user }: { user: JeuUser }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const onScoreSubmitted = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
      <GameClient user={user} onScoreSubmitted={onScoreSubmitted} />
      <Leaderboard refreshKey={refreshKey} isLoggedIn={!!user} />
    </div>
  );
}
