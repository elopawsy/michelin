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
    alt: "Vélo de route vintage, héritage du cycle Michelin depuis 1889",
    year: "1889",
  },
  {
    title: "Innovation continue",
    desc: "Des technologies de pointe pour toujours aller plus loin.",
    img: "/heritage-2.jpg",
    alt: "Vélo de route carbone moderne, innovation et technologie de pointe Michelin",
  },
  {
    title: "Gamme wide premium",
    desc: "Des pneus conçus pour chaque pratique.",
    img: "/heritage-3.jpg",
    alt: "Cyclistes sur route équipés de pneus premium Michelin",
  },
];

export default function Heritage() {
  return (
    <div className="flex min-h-[100svh] flex-col bg-fond text-encre">
      <MichelinHeader />

      <main className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col px-6 pb-6 lg:justify-center lg:px-12 lg:py-4">
        <h1 className="max-w-2xl text-[clamp(1.55rem,3vw,2.35rem)] leading-[1.08] font-extrabold tracking-[-0.01em] text-bleu-fonce">
          L&rsquo;héritage Michelin depuis 1889.
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-snug font-medium text-bleu-fonce/80 lg:text-base">
          Plus de 130 ans d&rsquo;innovation au service de votre mobilité.
        </p>

        <ul className="-mx-6 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] lg:mx-0 lg:mt-5 lg:flex-none lg:gap-7 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
          {CARDS.map((card) => (
            <li
              key={card.title}
              className="group flex shrink-0 basis-[82%] snap-start flex-col transition-[flex-grow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:basis-[46%] lg:min-w-0 lg:flex-1 lg:basis-0 lg:hover:grow-[1.7]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-card sm:aspect-[5/6] lg:h-[clamp(190px,34svh,360px)] lg:aspect-auto lg:flex-none xl:h-[clamp(170px,32svh,390px)]">
                <Image
                  src={card.img}
                  alt={card.alt}
                  fill
                  fetchPriority="high"
                  loading="eager"
                  unoptimized
                  sizes="(max-width: 640px) 82vw, (max-width: 1024px) 46vw, 420px"
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

              <h2 className="mt-3 text-[15px] font-bold leading-tight text-bleu-fonce lg:text-base">
                {card.title}
              </h2>
              <p className="mt-1 text-[13px] leading-snug text-bleu-fonce/65 lg:text-sm">
                {card.desc}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex shrink-0 justify-center lg:mt-5">
          <Link
            href="/configurateur"
            className="group inline-flex h-11 items-center gap-3 rounded-full bg-bleu-fonce px-7 text-[15px] font-bold text-white shadow-[0_16px_34px_rgba(0,32,91,0.32)] transition duration-200 hover:-translate-y-px hover:bg-bleu-nuit active:translate-y-0 active:scale-[0.98]"
          >
            Continuer
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </main>
    </div>
  );
}
