import Image from "next/image";
import Link from "next/link";
import { MichelinHeader } from "../_components/MichelinHeader";
import { ArrowRight } from "../_components/ui";

type Card = {
  title: string;
  desc: string;
  img: string;
  alt: string;
  year?: string;
};

const CARDS: Card[] = [
  {
    title: "Héritage depuis 1889",
    desc: "Une histoire guidée par la passion et la qualité.",
    img: "/heritage-1.jpg",
    alt: "Bicyclette de sécurité d'époque, héritage du cycle depuis 1889",
    year: "1889",
  },
  {
    title: "Innovation continue",
    desc: "Des technologies de pointe pour toujours aller plus loin.",
    img: "/heritage-2.jpg",
    alt: "Ingénieur Michelin au travail dans un environnement high-tech bleuté",
  },
  {
    title: "Gamme wide premium",
    desc: "Des pneus conçus pour chaque pratique.",
    img: "/heritage-3.jpg",
    alt: "Cycliste sur une route de montagne, gamme premium Michelin",
  },
];

export default function Heritage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-fond text-encre">
      <MichelinHeader />

      <main className="mx-auto flex w-full min-h-0 max-w-[1040px] flex-1 flex-col justify-center px-6 pb-6 lg:px-12">
        <h1 className="max-w-2xl text-[clamp(1.6rem,3.4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.02em] text-bleu-fonce">
          L&rsquo;héritage Michelin depuis 1889.
        </h1>
        <p className="mt-2 max-w-xl text-base leading-snug font-medium text-bleu-fonce/80 lg:text-lg">
          Plus de 130 ans d&rsquo;innovation au service de votre mobilité.
        </p>

        <ul className="mt-6 grid grid-cols-3 gap-4 lg:mt-8 lg:gap-7">
          {CARDS.map((card) => (
            <li key={card.title} className="flex flex-col">
              <div className="relative h-[clamp(220px,34vh,300px)] overflow-hidden rounded-3xl shadow-card">
                <Image
                  src={card.img}
                  alt={card.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 33vw, 320px"
                  className="object-cover"
                />
                {card.year && (
                  <>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-1/3"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)",
                      }}
                    />
                    <span
                      aria-hidden="true"
                      className="absolute right-4 bottom-3 font-serif text-3xl font-semibold tracking-wide text-white italic drop-shadow"
                    >
                      {card.year}
                    </span>
                  </>
                )}
              </div>

              <h2 className="mt-3 text-[15px] font-bold text-bleu-fonce lg:text-base">
                {card.title}
              </h2>
              <p className="mt-1 text-[13px] leading-snug text-bleu-fonce/65 lg:text-sm">
                {card.desc}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex shrink-0 justify-center lg:mt-8">
          <Link
            href="/configurateur"
            className="group inline-flex h-[54px] min-w-[17rem] items-center justify-between rounded-full bg-bleu-fonce pr-7 pl-9 text-base font-bold text-white shadow-[0_16px_34px_rgba(0,32,91,0.32)] transition duration-200 hover:-translate-y-px hover:bg-bleu-nuit active:translate-y-0 active:scale-[0.98]"
          >
            Continuer
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </main>
    </div>
  );
}
