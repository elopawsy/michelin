"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Picto } from "../ui";
import { tireById } from "./data/tires";
import type { TireId } from "./engine/types";

type Entry = {
  rank: number;
  userId: number;
  name: string;
  initials: string;
  score: number;
  distance: number;
  tireId: string;
  isCurrentUser: boolean;
};

type Data = { top: Entry[]; me: Entry | null };

const RANK_STYLES: Record<number, string> = {
  1: "bg-jaune text-bleu-fonce",
  2: "bg-bleu-leger text-bleu",
  3: "bg-bleu-leger text-bleu",
};

const fmt = (n: number) => n.toLocaleString("fr-FR");

function tirePicto(id: string): string {
  try {
    return tireById(id as TireId).picto;
  } catch {
    return "car-tire";
  }
}

function Row({ entry }: { entry: Entry }) {
  const rankClass = RANK_STYLES[entry.rank] ?? "bg-fond text-encre-2";
  return (
    <li
      className={`flex items-center gap-3 rounded-card-sm px-3 py-2.5 ${
        entry.isCurrentUser ? "bg-bleu-leger ring-1 ring-bleu/30" : ""
      }`}
    >
      <span
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold tabular-nums ${rankClass}`}
      >
        {entry.rank}
      </span>
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bleu-fonce text-xs font-bold text-white">
        {entry.initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-encre">
          {entry.name}
          {entry.isCurrentUser && (
            <span className="ml-1.5 text-[11px] font-bold text-bleu">
              (vous)
            </span>
          )}
        </span>
        <span className="flex items-center gap-1 text-[12px] text-encre-3">
          <Picto name={tirePicto(entry.tireId)} className="h-3.5 w-3.5 text-bleu" />
          {fmt(entry.distance)} m
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-base font-extrabold tabular-nums text-encre">
          {fmt(entry.score)}
        </span>
        <span className="block text-[11px] font-bold tracking-[0.1em] text-encre-3 uppercase">
          pts
        </span>
      </span>
    </li>
  );
}

export function Leaderboard({
  refreshKey,
  isLoggedIn,
}: {
  refreshKey: number;
  isLoggedIn: boolean;
}) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leaderboard?limit=10", { headers: { accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        if (!cancelled) {
          setData(json.data as Data);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const top = data?.top ?? [];
  const meOutside =
    data?.me && !top.some((e) => e.userId === data.me!.userId) ? data.me : null;

  return (
    <div className="rounded-card border border-bordure bg-carte p-6 shadow-card lg:p-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-bold tracking-[0.18em] text-bleu uppercase">
            Classement
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-[-0.01em] text-encre italic">
            Les meilleurs grimpeurs
          </h2>
        </div>
        <Picto name="speed-rating" className="h-8 w-8 text-bordure" />
      </div>

      {data === null && !error && (
        <p className="mt-6 text-sm text-encre-3">Chargement du classement…</p>
      )}
      {data === null && error && (
        <p className="mt-6 text-sm text-encre-3">
          Classement indisponible pour le moment.
        </p>
      )}
      {data !== null && top.length === 0 && (
        <p className="mt-6 text-sm text-encre-2">
          Aucun score pour l&rsquo;instant.{" "}
          {isLoggedIn
            ? "À vous de lancer le classement !"
            : "Soyez le premier à inscrire votre nom !"}
        </p>
      )}
      {data !== null && top.length > 0 && (
        <>
          <ol className="mt-5 flex flex-col gap-1.5">
            {top.map((e) => (
              <Row key={e.userId} entry={e} />
            ))}
          </ol>
          {meOutside && (
            <>
              <p
                aria-hidden="true"
                className="py-1 text-center text-lg leading-none text-bordure"
              >
                ⋯
              </p>
              <ol className="flex flex-col gap-1.5">
                <Row entry={meOutside} />
              </ol>
            </>
          )}
        </>
      )}

      {!isLoggedIn && (
        <p className="mt-5 border-t border-bordure pt-4 text-[13px] leading-relaxed text-encre-2">
          <Link
            href="/register?next=/jeu"
            className="font-bold text-bleu underline-offset-2 hover:underline"
          >
            Créez un compte
          </Link>{" "}
          pour enregistrer votre score et apparaître au classement.
        </p>
      )}
    </div>
  );
}
