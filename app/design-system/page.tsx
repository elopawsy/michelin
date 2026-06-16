import Link from "next/link";
import { Hero } from "../_components/Hero";
import { SiteHeader } from "../_components/SiteHeader";
import { Counter, Reveal } from "../_components/motion";
import { ArrowRight, Badge, ButtonLink } from "../_components/ui";

export default function Home() {
  return (
    <div className="bg-fond text-encre">
      <SiteHeader />
      <main>
        <Hero />
        <Heritage />
        <Connecte />
        <Gamme />
        <Preuve />
      </main>
      <Footer />
    </div>
  );
}

const Overline = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[13px] leading-[18px] font-bold tracking-[0.18em] text-bleu uppercase">
    {children}
  </p>
);

const H2 = ({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) => (
  <h2
    id={id}
    className="mt-5 max-w-2xl text-[clamp(1.75rem,3.6vw,2rem)] leading-[1.2] font-extrabold tracking-[-0.01em] text-encre"
  >
    {children}
  </h2>
);

/* ─────────────────────────────────────────────────────────────
   2. Bande héritage — « Depuis 1891 »
───────────────────────────────────────────────────────────── */
function Heritage() {
  return (
    <section
      id="heritage"
      aria-labelledby="heritage-title"
      className="border-y border-bordure bg-bleu-leger"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="max-w-3xl">
          <Reveal>
            <Overline>Depuis 1891</Overline>
          </Reveal>
          <Reveal delay={80}>
            <H2 id="heritage-title">
              Inventer le pneu, puis ne jamais cesser de le réinventer.
            </H2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-6 max-w-2xl text-base leading-[1.7] text-encre-2">
              En 1891, Michelin dépose le premier pneumatique démontable. Depuis,
              la même obsession nous fait avancer&nbsp;: tenir la route là où les
              autres s&apos;arrêtent. Michelin Ride hérite de ce siècle et demi de
              recherche — et l&apos;emmène sur le gravel.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <dl className="mt-14 grid gap-4 sm:grid-cols-3">
            <Figure value={<Counter to={1891} grouping={false} duration={1900} />} label="Le pneu démontable, breveté" />
            <Figure value={<Counter to={135} duration={1700} />} label="Années d'invention continue" />
            <Figure value="1ᵉʳ" label="Pneu connecté de la marque" />
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

function Figure({
  value,
  label,
}: {
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-card-sm border border-bordure bg-carte p-6 shadow-card">
      <dd className="text-[2.5rem] leading-[3rem] font-extrabold text-encre tabular-nums">
        {value}
      </dd>
      <dt className="mt-2 text-[13px] leading-[18px] font-bold text-encre-2">
        {label}
      </dt>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. Le pneu connecté — aperçu du dashboard live
───────────────────────────────────────────────────────────── */
function Connecte() {
  const points = [
    "Pression optimale, suivie en continu.",
    "Usure et durée de vie restante, au kilomètre près.",
    "Surface détectée : route, gravel, chemin.",
  ];

  return (
    <section
      id="connecte"
      aria-labelledby="connecte-title"
      className="bg-fond"
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-28">
        <div>
          <Reveal>
            <Overline>Le pneu connecté</Overline>
          </Reveal>
          <Reveal delay={80}>
            <H2 id="connecte-title">
              Un capteur dans le flanc. Une longueur d&apos;avance dans la tête.
            </H2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-6 max-w-md text-base leading-[1.7] text-encre-2">
              Pression, usure, température, surface&nbsp;: Michelin Ride lit la
              route en temps réel et vous prévient avant même que vous ne sentiez
              quoi que ce soit. La technologie, au service de la sensation.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <ul className="mt-8 flex flex-col gap-4">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bleu-leger text-bleu"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-base leading-[1.6] text-encre-2">{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={290}>
            <ButtonLink href="/pneu" variant="secondary" className="mt-9">
              Connecter mon pneu
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <Dashboard />
        </Reveal>
      </div>
    </section>
  );
}

function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-[480px] rounded-panel border border-bordure bg-carte p-6 shadow-panel sm:p-8">
      <div className="flex items-center justify-between">
        <p className="text-[13px] leading-[18px] font-bold tracking-[0.16em] text-encre-3 uppercase">
          Michelin Ride · Live
        </p>
        <Badge variant="connecte">
          <span
            className="pulse-dot h-2 w-2 rounded-full bg-succes"
            aria-hidden="true"
          />
          Connecté
        </Badge>
      </div>

      <p className="mt-5 text-xl font-extrabold text-encre">Pneu avant — gravel</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <StatTile label="Pression" unit="bar" note="optimal 2,4 bar">
          <Counter to={2.4} decimals={1} duration={1400} />
        </StatTile>

        <StatTile label="Usure" unit="%">
          <Counter to={12} duration={1500} />
          <span
            className="mt-3 block h-1 w-full overflow-hidden rounded-pill bg-bordure"
            aria-hidden="true"
          >
            <span className="block h-full rounded-pill bg-jaune" style={{ width: "12%" }} />
          </span>
        </StatTile>

        <StatTile label="Vitesse" unit="km/h">
          <Counter to={31} duration={1500} />
        </StatTile>

        <StatTile label="Vie restante" unit="km">
          <Counter to={3200} duration={1800} />
        </StatTile>
      </div>

      <div className="mt-3 rounded-card-sm border border-bordure bg-fond p-4">
        <p className="text-[13px] leading-[18px] font-bold text-encre-2">
          Surface détectée
        </p>
        <p className="mt-1 text-[2rem] leading-none font-extrabold text-encre">
          Gravel
        </p>
      </div>

      {/* Recommandation pneu — DA §11 */}
      <div className="mt-3 rounded-card bg-bleu-fonce p-5 text-white shadow-pneu">
        <Badge variant="premium">Ride Gravel</Badge>
        <p className="mt-3 text-sm text-white/65">Recommandé pour votre profil</p>
        <p className="text-xl font-extrabold text-white">Ride Gravel 700 × 42</p>
        <p className="mt-1 text-sm text-white/65">
          Tubeless · gomme tendre · carcasse souple
        </p>
        <div className="mt-4 flex items-center gap-2" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-bleu" />
          <span className="h-2 w-2 rounded-full bg-dot" />
          <span className="h-2 w-2 rounded-full bg-dot" />
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  unit,
  note,
  children,
}: {
  label: string;
  unit: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card-sm border border-bordure bg-fond p-4">
      <p className="text-[13px] leading-[18px] font-bold text-encre-2">{label}</p>
      <p className="mt-1 text-[2rem] leading-none font-extrabold tracking-tight text-encre tabular-nums">
        {children}
        <span className="ml-1 align-baseline text-base font-semibold text-encre-3">
          {unit}
        </span>
      </p>
      {note && <p className="mt-2 text-xs text-encre-3">{note}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. Trois univers — Gravel d'abord
───────────────────────────────────────────────────────────── */
function Gamme() {
  return (
    <section
      id="gamme"
      aria-labelledby="gamme-title"
      className="border-t border-bordure bg-fond"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:px-10 lg:py-28">
        <Reveal>
          <Overline>La gamme</Overline>
        </Reveal>
        <Reveal delay={80}>
          <H2 id="gamme-title">Trois terrains, une même exigence.</H2>
        </Reveal>

        <Reveal delay={140}>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <UniversCard
              featured
              name="Gravel"
              line="Là où le chemin devient terrain de jeu. Adhérence, confort et vitesse, sans compromis."
              caption="Image — pneu gravel, terre sèche"
            />
            <UniversCard
              name="Route"
              line="La vitesse, en silence."
              caption="Image — bitume, aube bleutée"
            />
            <UniversCard
              name="Femmes"
              line="Conçu avec et pour les cyclistes femmes."
              caption="Image — portrait rider, studio"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function UniversCard({
  name,
  line,
  caption,
  featured = false,
}: {
  name: string;
  line: string;
  caption: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-card bg-carte shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${
        featured
          ? "border-2 border-jaune md:col-span-2 md:flex-row"
          : "border border-bordure hover:border-bleu"
      }`}
    >
      {/* Zone image (placeholder décrit) */}
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-bleu-leger ${
          featured ? "min-h-[14rem] md:w-1/2" : "h-44"
        }`}
        aria-hidden="true"
      >
        <span className="relative block aspect-square w-28 rounded-full bg-carte shadow-card transition-transform duration-[400ms] ease-out group-hover:scale-105">
          <span className="absolute inset-3 rounded-full border-[6px] border-bleu-fonce" />
          <span className="absolute inset-7 rounded-full bg-bleu-leger" />
        </span>
        <span className="absolute right-3 bottom-3 font-mono text-[10px] tracking-wide text-encre-3">
          {caption}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 lg:p-8">
        {featured && (
          <span className="mb-3">
            <Badge variant="premium">Gravel d&apos;abord</Badge>
          </span>
        )}
        <h3 className="text-[1.5rem] leading-8 font-bold text-encre">{name}</h3>
        <p className="mt-2 max-w-sm text-base leading-[1.6] text-encre-2">{line}</p>
        <Link
          href="#gamme"
          className="mt-auto inline-flex items-center gap-2 pt-6 text-[15px] font-bold text-bleu"
        >
          Explorer
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
   5. Preuve — citation, grand traitement typographique
───────────────────────────────────────────────────────────── */
function Preuve() {
  return (
    <section aria-label="Témoignage" className="bg-bleu-nuit text-white">
      <div className="mx-auto max-w-[1100px] px-6 py-20 lg:px-10 lg:py-32">
        <Reveal>
          <blockquote>
            <p className="max-w-4xl text-[clamp(1.5rem,3.6vw,2.5rem)] leading-[1.2] font-extrabold tracking-[-0.01em]">
              «&nbsp;Au bout de deux cents kilomètres de cailloux, j&apos;avais
              oublié mes pneus. C&apos;est le plus beau compliment que je puisse
              leur faire.&nbsp;»
            </p>
            <footer className="mt-10 flex items-center gap-4">
              <span
                className="h-12 w-12 shrink-0 rounded-full border border-white/25 bg-white/10"
                aria-hidden="true"
              />
              <span>
                <span className="block text-sm font-bold text-white">
                  Testeuse gravel
                </span>
                <span className="block text-sm text-white/60">
                  4 200 km en conditions réelles · Massif central
                </span>
              </span>
            </footer>
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   6. Footer — clin d'œil discret à Bibendum
───────────────────────────────────────────────────────────── */
function Footer() {
  const columns = [
    {
      title: "La gamme",
      links: [
        { label: "Gravel", href: "#gamme" },
        { label: "Route", href: "#gamme" },
        { label: "Femmes", href: "#gamme" },
      ],
    },
    {
      title: "Le pneu",
      links: [
        { label: "Pneu connecté", href: "#connecte" },
        { label: "Technologie", href: "#connecte" },
        { label: "Héritage", href: "#heritage" },
      ],
    },
    {
      title: "La marque",
      links: [
        { label: "Notre histoire", href: "#heritage" },
        { label: "Revendeurs", href: "/pneu" },
        { label: "Nous contacter", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-bleu-nuit text-white">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold tracking-[0.24em] text-white uppercase">
                Michelin
              </span>
              <span className="text-xl leading-none font-bold text-white/85">
                Ride
              </span>
              <span
                className="h-1.5 w-1.5 self-end rounded-full bg-jaune"
                aria-hidden="true"
              />
            </div>
            <p className="mt-5 max-w-sm text-base leading-[1.7] text-white/60">
              La gamme gravel haut de gamme de Michelin. Héritière de
              l&apos;invention du pneu démontable, pensée pour rouler par-delà le
              bitume.
            </p>

            {/* Clin d'œil discret à Bibendum */}
            <div className="mt-10 flex items-end gap-4">
              <span className="flex flex-col items-center gap-1.5" aria-hidden="true">
                <span className="h-5 w-5 rounded-full border border-white/25" />
                <span className="h-6 w-7 rounded-full border border-white/20" />
                <span className="h-7 w-9 rounded-full border border-white/15" />
              </span>
              <span className="text-[13px] leading-[18px] text-white/45">
                Un clin d&apos;œil à Bibendum,
                <br />
                fidèle au poste depuis 1898.
              </span>
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="md:col-span-2">
              <h2 className="text-[13px] leading-[18px] font-bold tracking-[0.16em] text-white/45 uppercase">
                {col.title}
              </h2>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="md:col-span-1" />
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Michelin — LB 2 Wheels. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="#" className="transition-colors hover:text-white">
              Mentions légales
            </Link>
            <Link href="#" className="transition-colors hover:text-white">
              Confidentialité
            </Link>
            <span className="text-white/70">FR / EN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
