import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/app/_components/ui";

type AuthShellProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function AuthShell({
  children,
  description,
  eyebrow,
  title,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-fond text-encre">
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" aria-label="Michelin — accueil" className="inline-flex">
          <Wordmark className="h-9 sm:h-11" />
        </Link>
        <Link
          href="/pneu"
          className="text-sm font-semibold text-bleu-fonce transition-colors hover:text-bleu"
        >
          Capteur
        </Link>
      </header>

      <main className="flex flex-1 items-center px-4 pb-10 sm:px-6 lg:px-10">
        <section className="mx-auto grid w-full max-w-[1040px] overflow-hidden rounded-[28px] bg-carte shadow-panel lg:grid-cols-[0.92fr_1.08fr]">
          <div className="px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <p className="text-sm font-bold tracking-[0.08em] text-bleu uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.02em] text-bleu-fonce">
              {title}
            </h1>
            <p className="mt-4 max-w-md text-base leading-[1.65] text-encre-2">
              {description}
            </p>

            <div className="mt-8">{children}</div>
          </div>

          <div className="relative hidden min-h-[620px] bg-bleu-fonce lg:block">
            <Image
              src="/hero-home.png"
              alt="Bibendum Michelin avec un vélo sur une route de montagne"
              fill
              priority
              sizes="520px"
              className="object-cover object-[65%_center]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,32,91,0.04) 0%, rgba(0,12,52,0.42) 100%)",
              }}
            />
            <div className="absolute right-8 bottom-8 left-8">
              <p className="max-w-sm text-[32px] leading-[1.08] font-extrabold tracking-[-0.02em] text-white">
                Chaque donnée rapproche du bon pneu.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
