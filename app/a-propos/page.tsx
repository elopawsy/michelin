import Image from "next/image";
import { MichelinHeader } from "../_components/MichelinHeader";
import { ArrowRight } from "../_components/ui";

/* Contenu illustratif — page institutionnelle « À propos ». */

const STATS = [
  { value: "1889", label: "Année de fondation" },
  { value: "130+", label: "Années d’innovation" },
  { value: "70+", label: "Pays où nous roulons" },
  { value: "6 000 km", label: "Tests terrain par modèle" },
];

const VALUES = [
  {
    title: "Innovation",
    desc: "De la première chambre démontable au pneu connecté, nous repoussons sans cesse les limites de la technologie du pneumatique.",
  },
  {
    title: "Qualité",
    desc: "Chaque gomme est éprouvée sur des milliers de kilomètres pour garantir adhérence, rendement et sécurité, kilomètre après kilomètre.",
  },
  {
    title: "Durabilité",
    desc: "Des pneus plus endurants et des matériaux mieux pensés, pour une mobilité performante et plus respectueuse de la planète.",
  },
];

const TIMELINE = [
  {
    year: "1889",
    text: "Naissance de Michelin à Clermont-Ferrand, portée par la passion du caoutchouc.",
  },
  {
    year: "1891",
    text: "Premier pneu vélo démontable : une révolution pour les cyclistes de l’époque.",
  },
  {
    year: "1946",
    text: "Invention du pneu radial, qui transforme durablement l’industrie.",
  },
  {
    year: "2024",
    text: "Lancement du pneu vélo connecté, alliant capteurs et application mobile.",
  },
];

export default function APropos() {
  return (
    <div className="flex min-h-[100svh] flex-col bg-fond text-encre">
      <MichelinHeader />

      <main className="flex-1 pb-20">
        {/* Hero */}
        <section className="mx-auto w-full max-w-[920px] px-6 pt-2 lg:px-8 lg:pt-6">
          <p className="text-sm font-bold tracking-[0.14em] text-bleu uppercase">
            Notre histoire
          </p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2rem,5vw,3.4rem)] leading-[1.06] font-extrabold tracking-[-0.02em] text-bleu-fonce">
            Faire avancer la mobilité depuis 1889.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed font-medium text-bleu-fonce/75 lg:text-lg">
            Depuis plus de 130 ans, Michelin conçoit des pneumatiques qui
            repoussent les limites de la performance, de la sécurité et du
            confort — du vélo de route aux terrains les plus exigeants.
          </p>
        </section>

        {/* Bandeau visuel */}
        <section className="mx-auto mt-10 w-full max-w-[1100px] px-6 lg:px-8">
          <div className="relative h-[clamp(220px,38vh,420px)] overflow-hidden rounded-[2rem] shadow-card">
            <Image
              src="/heritage-3.jpg"
              alt="Cyclistes sur route équipés de pneus Michelin"
              fill
              unoptimized
              sizes="(max-width: 1100px) 100vw, 1100px"
              className="object-cover object-center"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,32,91,0) 40%, rgba(0,32,91,0.55) 100%)",
              }}
            />
          </div>
        </section>

        {/* Chiffres clés */}
        <section className="mx-auto mt-12 w-full max-w-[920px] px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-bordure bg-bordure shadow-card sm:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center bg-carte px-4 py-7 text-center"
              >
                <dt className="order-2 mt-1 text-[13px] font-medium text-bleu-fonce/60">
                  {stat.label}
                </dt>
                <dd className="order-1 text-3xl font-extrabold tracking-[-0.02em] text-bleu-fonce">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Mission */}
        <section className="mx-auto mt-16 w-full max-w-[920px] px-6 lg:px-8">
          <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] font-extrabold tracking-[-0.02em] text-bleu-fonce">
            Notre mission
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-bleu-fonce/75 lg:text-lg">
            Offrir à chacun la meilleure façon d’avancer. Nous croyons qu’un bon
            pneu change tout : il rend chaque sortie plus sûre, plus fluide et
            plus agréable. C’est pourquoi nous mettons la même exigence dans le
            moindre pneu vélo que dans nos technologies de compétition.
          </p>
        </section>

        {/* Valeurs */}
        <section className="mx-auto mt-12 w-full max-w-[920px] px-6 lg:px-8">
          <ul className="grid gap-5 sm:grid-cols-3">
            {VALUES.map((value) => (
              <li
                key={value.title}
                className="rounded-3xl border border-bordure bg-carte p-6 shadow-card"
              >
                <span className="inline-flex h-2 w-10 rounded-full bg-jaune" />
                <h3 className="mt-4 text-lg font-extrabold text-bleu-fonce">
                  {value.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-bleu-fonce/70">
                  {value.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Frise */}
        <section className="mx-auto mt-16 w-full max-w-[920px] px-6 lg:px-8">
          <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] font-extrabold tracking-[-0.02em] text-bleu-fonce">
            Quelques jalons
          </h2>
          <ol className="mt-6 border-l-2 border-bleu-leger">
            {TIMELINE.map((step) => (
              <li key={step.year} className="relative pb-8 pl-7 last:pb-0">
                <span className="absolute top-1 -left-[7px] h-3 w-3 rounded-full bg-bleu ring-4 ring-fond" />
                <p className="text-sm font-extrabold tracking-[0.04em] text-bleu">
                  {step.year}
                </p>
                <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-bleu-fonce/75">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="mx-auto mt-16 w-full max-w-[920px] px-6 lg:px-8">
          <div className="flex flex-col items-start gap-5 rounded-3xl bg-bleu-fonce px-7 py-8 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold sm:text-xl">
                Prêt à rouler avec Michelin ?
              </h2>
              <p className="mt-1 text-sm text-white/75">
                Trouvez le pneu idéal pour votre pratique en quelques clics.
              </p>
            </div>
            <a
              href="/pneu"
              className="group inline-flex h-[52px] shrink-0 items-center gap-3 rounded-full bg-jaune px-7 text-base font-bold text-bleu-fonce shadow-[0_14px_30px_rgba(252,229,0,0.35)] transition duration-200 hover:-translate-y-px hover:bg-jaune-hover active:translate-y-0 active:scale-[0.98]"
            >
              Trouver mon pneu
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
