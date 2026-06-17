"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, BackLink, Wordmark } from "@/app/_components/ui";
import { connecter, estAnnulation } from "@/app/_lib/ble";
import {
  BRAKE_TYPES,
  CONFIGURATOR_ROUTES,
  CONFIGURATOR_STEPS,
  CONFIGURATOR_STORAGE_KEY,
  DEFAULT_PRIORITY_VALUE,
  DISTANCE_OPTIONS,
  GOAL_COPY,
  SURFACE_COPY,
  TYPE_COPY,
  WHEEL_SIZES,
  getNextStep,
  getPreviousStep,
  getStepIndex,
  type ConfiguratorBicycleModelOption,
  type ConfiguratorDraft,
  type ConfiguratorOptions,
  type ConfiguratorStep,
} from "@/lib/configurator-schema";

type ConfiguratorStepPageProps = {
  step: ConfiguratorStep;
};

type PendingAction = "connect" | "skip" | null;

const inputClass =
  "h-12 w-full rounded-xl border border-bordure bg-white px-4 text-[15px] font-medium text-encre transition duration-200 placeholder:text-encre-3 focus:border-bleu focus:outline-none focus:ring-4 focus:ring-bleu/10";

export function ConfiguratorStepPage({ step }: ConfiguratorStepPageProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<ConfiguratorDraft>(() => loadDraft());
  const [options, setOptions] = useState<ConfiguratorOptions | null>(null);
  const [optionsError, setOptionsError] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<PendingAction>(null);

  const stepIndex = getStepIndex(step);
  const stepNumber = stepIndex + 1;
  const previousStep = getPreviousStep(step);
  const nextStep = getNextStep(step);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const response = await fetch("/api/configurateur/options", {
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => ({}))) as {
          data?: ConfiguratorOptions;
          error?: string;
        };

        if (!active) return;

        if (!response.ok || !payload.data) {
          setOptionsError(
            payload.error ?? "Catalogue indisponible pour le configurateur.",
          );
          return;
        }

        setOptions(payload.data);
      } catch {
        if (active) {
          setOptionsError("Catalogue indisponible pour le configurateur.");
        }
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  function commitDraft(nextDraft: ConfiguratorDraft) {
    setDraft(nextDraft);
    persistDraft(nextDraft);
  }

  function savePatch(patch: ConfiguratorDraft) {
    setDraft((current) => {
      const nextDraft = { ...current, ...patch };

      persistDraft(nextDraft);

      return nextDraft;
    });
  }

  function selectType(title: string) {
    const defaults = TYPE_COPY[title]?.defaults ?? {};

    savePatch({
      ...defaults,
      bicycleModelId: undefined,
      bicycleTypeTitle: title,
    });
  }

  function continueToNextStep() {
    const nextDraft =
      step === "priorites" ? withDefaultPriorities(draft) : draft;
    const validationError = validateStep(step, nextDraft);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    commitDraft(nextDraft);

    if (nextStep) {
      router.push(CONFIGURATOR_ROUTES[nextStep]);
    }
  }

  async function submit(connectAfter: boolean) {
    const nextDraft = withDefaultPriorities(draft);
    const validationError = validateCompleteDraft(nextDraft);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setPending(connectAfter ? "connect" : "skip");

    try {
      const response = await fetch("/api/configurateur/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextDraft),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (response.status === 401) {
        router.push(
          `/login?next=${encodeURIComponent(CONFIGURATOR_ROUTES.capteur)}`,
        );
        return;
      }

      if (!response.ok) {
        throw new Error(formatConfiguratorError(payload.error));
      }

      commitDraft(nextDraft);

      if (connectAfter) {
        await connecter();
      }

      clearDraft();
      router.push("/recommandations");
      router.refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);

      if (estAnnulation(message)) {
        return;
      }

      setError(message);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-fond p-4 sm:p-6">
      <section className="flex h-[min(760px,calc(100svh-2rem))] min-h-[min(640px,calc(100svh-2rem))] max-h-[calc(100svh-2rem)] w-full max-w-[900px] flex-col overflow-hidden rounded-[28px] bg-carte p-6 shadow-panel sm:max-h-[calc(100svh-3rem)] sm:p-9">
        <div className="flex shrink-0 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BackLink
              href={previousStep ? CONFIGURATOR_ROUTES[previousStep] : "/"}
            />
            <Wordmark className="h-9 sm:h-11" />
          </div>
          <span className="text-sm font-semibold text-encre-2">
            Étape {stepNumber} / {CONFIGURATOR_STEPS.length}
          </span>
        </div>

        <div className="mt-6 flex shrink-0 gap-2.5">
          {CONFIGURATOR_STEPS.map((item, index) => (
            <span
              key={item}
              className={`h-1.5 flex-1 rounded-full ${
                index <= stepIndex ? "bg-jaune" : "bg-bordure"
              }`}
            />
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1 sm:pr-2">
          {optionsError && (
            <p
              className="mt-6 rounded-card-sm border border-danger/25 bg-danger-fond px-4 py-3 text-sm font-semibold text-danger"
              role="alert"
            >
              {optionsError}
            </p>
          )}

          <StepContent
            draft={draft}
            onSelectType={selectType}
            options={options}
            pending={pending}
            savePatch={savePatch}
            step={step}
            submit={submit}
          />

          {error && (
            <p
              className="mt-6 rounded-card-sm border border-danger/25 bg-danger-fond px-4 py-3 text-sm font-semibold text-danger"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        {step !== "capteur" && (
          <div className="mt-6 flex shrink-0 justify-center">
            <button
              type="button"
              onClick={continueToNextStep}
              className="group inline-flex h-[56px] min-w-[16rem] items-center justify-center gap-3 rounded-full bg-jaune px-9 text-base font-bold text-bleu-fonce shadow-cta transition duration-200 hover:-translate-y-px hover:bg-jaune-hover active:translate-y-0 active:scale-[0.98]"
            >
              Suivant
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function StepContent({
  draft,
  onSelectType,
  options,
  pending,
  savePatch,
  step,
  submit,
}: {
  draft: ConfiguratorDraft;
  onSelectType: (title: string) => void;
  options: ConfiguratorOptions | null;
  pending: PendingAction;
  savePatch: (patch: ConfiguratorDraft) => void;
  step: ConfiguratorStep;
  submit: (connectAfter: boolean) => Promise<void>;
}) {
  switch (step) {
    case "type":
      return (
        <TypeStep draft={draft} onSelectType={onSelectType} options={options} />
      );
    case "modele":
      return (
        <ModelStep draft={draft} options={options} savePatch={savePatch} />
      );
    case "terrain":
      return (
        <TerrainStep draft={draft} options={options} savePatch={savePatch} />
      );
    case "usage":
      return <UsageStep draft={draft} options={options} savePatch={savePatch} />;
    case "priorites":
      return <PrioritiesStep draft={draft} savePatch={savePatch} />;
    case "kilometres":
      return <DistanceStep draft={draft} savePatch={savePatch} />;
    case "details":
      return <DetailsStep draft={draft} savePatch={savePatch} />;
    case "capteur":
      return <SensorStep pending={pending} submit={submit} />;
  }
}

function TypeStep({
  draft,
  onSelectType,
  options,
}: {
  draft: ConfiguratorDraft;
  onSelectType: (title: string) => void;
  options: ConfiguratorOptions | null;
}) {
  return (
    <>
      <StepHeader
        title="Quel vélo utilisez-vous ?"
        description="Sélectionnez votre type de vélo."
      />
      {!options ? (
        <LoadingBlock />
      ) : (
        <div className="mx-auto mt-8 grid w-full max-w-[660px] grid-cols-1 gap-4 sm:grid-cols-2">
          {options.bicycleTypes.map((item) => {
            const copy = TYPE_COPY[item.title] ?? {
              detail: item.description ?? "",
              label: item.title,
            };

            return (
              <OptionCard
                active={draft.bicycleTypeTitle === item.title}
                detail={copy.detail}
                key={item.id}
                label={copy.label}
                onClick={() => onSelectType(item.title)}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

function ModelStep({
  draft,
  options,
  savePatch,
}: {
  draft: ConfiguratorDraft;
  options: ConfiguratorOptions | null;
  savePatch: (patch: ConfiguratorDraft) => void;
}) {
  const [query, setQuery] = useState("");
  const models = useMemo(
    () => {
      const normalizedQuery = normalizeSearch(query);

      return (options?.bicycleModels ?? []).filter((item) => {
        if (draft.bicycleTypeTitle && item.typeTitle !== draft.bicycleTypeTitle) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return normalizeSearch(
          `${item.brandName} ${item.model} ${item.description ?? ""}`,
        ).includes(normalizedQuery);
      });
    },
    [draft.bicycleTypeTitle, options, query],
  );
  const selectedModel = options?.bicycleModels.find(
    (item) => item.id === draft.bicycleModelId,
  );

  return (
    <>
      <StepHeader
        title="Quel est votre modèle ?"
        description="Associez le vélo à un modèle du catalogue."
      />
      <div className="mx-auto mt-7 w-full max-w-[660px]">
        <label
          htmlFor="bike-model-search"
          className="text-sm font-bold text-bleu-fonce"
        >
          Rechercher un modèle
        </label>
        <input
          id="bike-model-search"
          className={`${inputClass} mt-2`}
          maxLength={60}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Marque ou modèle"
          value={query}
        />
        {selectedModel && (
          <p className="mt-3 text-sm font-semibold text-encre-2">
            Modèle sélectionné&nbsp;:{" "}
            <span className="text-bleu-fonce">
              {selectedModel.brandName} {selectedModel.model}
            </span>
          </p>
        )}
      </div>
      {!options ? (
        <LoadingBlock />
      ) : models.length === 0 ? (
        <div className="mx-auto mt-6 w-full max-w-[660px] rounded-2xl border-2 border-bordure bg-carte px-5 py-6 text-center text-sm font-semibold text-encre-2">
          Aucun modèle trouvé.
        </div>
      ) : (
        <div className="mx-auto mt-6 grid w-full max-w-[660px] grid-cols-1 gap-4 sm:grid-cols-2">
          {models.map((model) => (
            <ModelCard
              active={draft.bicycleModelId === model.id}
              key={model.id}
              model={model}
              onClick={() =>
                savePatch({
                  bicycleModelId: model.id,
                  bicycleName: `${model.brandName} ${model.model}`,
                })
              }
            />
          ))}
        </div>
      )}
    </>
  );
}

function TerrainStep({
  draft,
  options,
  savePatch,
}: {
  draft: ConfiguratorDraft;
  options: ConfiguratorOptions | null;
  savePatch: (patch: ConfiguratorDraft) => void;
}) {
  return (
    <>
      <StepHeader
        title="Sur quel terrain roulez-vous le plus souvent ?"
        description="Sélectionnez votre terrain principal."
      />
      {!options ? (
        <LoadingBlock />
      ) : (
        <div className="mx-auto mt-8 grid w-full max-w-[660px] grid-cols-1 gap-4 sm:grid-cols-2">
          {options.roadSurfaces.map((item) => {
            const copy = SURFACE_COPY[item.title] ?? {
              detail: item.description ?? "",
              label: item.title,
            };

            return (
              <OptionCard
                active={draft.roadSurfaceTitle === item.title}
                detail={copy.detail}
                key={item.id}
                label={copy.label}
                onClick={() => savePatch({ roadSurfaceTitle: item.title })}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

function UsageStep({
  draft,
  options,
  savePatch,
}: {
  draft: ConfiguratorDraft;
  options: ConfiguratorOptions | null;
  savePatch: (patch: ConfiguratorDraft) => void;
}) {
  return (
    <>
      <StepHeader
        title="Quel est votre objectif principal ?"
        description="La recommandation pondère les pneus selon cette priorité."
      />
      {!options ? (
        <LoadingBlock />
      ) : (
        <div className="mx-auto mt-8 grid w-full max-w-[660px] grid-cols-1 gap-4 sm:grid-cols-3">
          {options.goals.map((item) => {
            const copy = GOAL_COPY[item.title] ?? {
              detail: item.description ?? "",
              label: item.title,
            };

            return (
              <OptionCard
                active={draft.goalTitle === item.title}
                detail={copy.detail}
                key={item.id}
                label={copy.label}
                onClick={() => savePatch({ goalTitle: item.title })}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

function PrioritiesStep({
  draft,
  savePatch,
}: {
  draft: ConfiguratorDraft;
  savePatch: (patch: ConfiguratorDraft) => void;
}) {
  const priorities = [
    {
      key: "prioritySpeed",
      label: "Vitesse",
      value: draft.prioritySpeed ?? DEFAULT_PRIORITY_VALUE,
    },
    {
      key: "priorityComfort",
      label: "Confort",
      value: draft.priorityComfort ?? DEFAULT_PRIORITY_VALUE,
    },
    {
      key: "priorityDurability",
      label: "Durabilité",
      value: draft.priorityDurability ?? DEFAULT_PRIORITY_VALUE,
    },
  ] as const;

  return (
    <>
      <StepHeader
        title="Comment arbitrer votre recommandation ?"
        description="Ajustez les trois critères de décision."
      />
      <div className="mx-auto mt-8 flex w-full max-w-[620px] flex-col gap-5">
        {priorities.map((priority) => (
          <label
            key={priority.key}
            className="rounded-2xl border-2 border-bordure bg-carte px-5 py-4"
          >
            <span className="flex items-center justify-between gap-4">
              <span className="text-base font-bold text-bleu-fonce">
                {priority.label}
              </span>
              <span className="min-w-10 rounded-pill bg-bleu-leger px-3 py-1 text-center text-sm font-bold text-bleu-fonce">
                {priority.value}
              </span>
            </span>
            <input
              className="mt-4 w-full accent-bleu"
              max={10}
              min={1}
              onChange={(event) =>
                savePatch({
                  [priority.key]: Number(event.currentTarget.value),
                } as ConfiguratorDraft)
              }
              type="range"
              value={priority.value}
            />
          </label>
        ))}
      </div>
    </>
  );
}

function DistanceStep({
  draft,
  savePatch,
}: {
  draft: ConfiguratorDraft;
  savePatch: (patch: ConfiguratorDraft) => void;
}) {
  return (
    <>
      <StepHeader
        title="Combien de kilomètres parcourez-vous par semaine ?"
        description="Sélectionnez votre volume moyen."
      />
      <div className="mx-auto mt-8 flex w-full max-w-[560px] flex-col gap-4">
        {DISTANCE_OPTIONS.map((item) => (
          <OptionCard
            active={draft.weeklyDistanceKm === item.value}
            detail={item.detail}
            key={item.value}
            label={item.label}
            onClick={() => savePatch({ weeklyDistanceKm: item.value })}
            variant="row"
          />
        ))}
      </div>
    </>
  );
}

function DetailsStep({
  draft,
  savePatch,
}: {
  draft: ConfiguratorDraft;
  savePatch: (patch: ConfiguratorDraft) => void;
}) {
  const tireWidth =
    draft.tireWidthMm ??
    TYPE_COPY[draft.bicycleTypeTitle ?? ""]?.defaults.tireWidthMm ??
    38;

  return (
    <>
      <StepHeader
        title="Quelles dimensions utilisez-vous ?"
        description="Ces valeurs vérifient la compatibilité avec les pneus."
      />
      <div className="mx-auto mt-8 grid w-full max-w-[660px] gap-6">
        <div>
          <p className="text-sm font-bold text-bleu-fonce">Taille de roue</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {WHEEL_SIZES.map((size) => (
              <OptionCard
                active={draft.wheelSize === size}
                key={size}
                label={size}
                onClick={() => savePatch({ wheelSize: size })}
                variant="compact"
              />
            ))}
          </div>
        </div>

        <label>
          <span className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-bleu-fonce">
              Largeur du pneu
            </span>
            <span className="rounded-pill bg-bleu-leger px-3 py-1 text-sm font-bold text-bleu-fonce">
              {tireWidth} mm
            </span>
          </span>
          <input
            className="mt-4 w-full accent-bleu"
            max={70}
            min={25}
            onChange={(event) =>
              savePatch({ tireWidthMm: Number(event.currentTarget.value) })
            }
            step={1}
            type="range"
            value={tireWidth}
          />
        </label>

        <div>
          <p className="text-sm font-bold text-bleu-fonce">Type de frein</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {BRAKE_TYPES.map((item) => (
              <OptionCard
                active={draft.brakeType === item.value}
                key={item.value}
                label={item.label}
                onClick={() => savePatch({ brakeType: item.value })}
                variant="compact"
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function SensorStep({
  pending,
  submit,
}: {
  pending: PendingAction;
  submit: (connectAfter: boolean) => Promise<void>;
}) {
  return (
    <>
      <StepHeader
        centered
        title="Capteur de pneu"
        description="Connexion Bluetooth"
      />
      <div className="mx-auto mt-6 flex w-full max-w-[420px] justify-center">
        <Image
          src="/capteur.png"
          alt="Capteur de pneu Michelin"
          width={1254}
          height={1254}
          priority
          className="h-auto w-full"
        />
      </div>
      <button
        type="button"
        onClick={() => submit(true)}
        disabled={pending !== null}
        className="group relative mt-6 inline-flex h-[56px] w-full items-center justify-center gap-3 rounded-full bg-jaune px-9 text-base font-bold text-bleu-fonce shadow-cta transition duration-200 hover:-translate-y-px hover:bg-jaune-hover active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-texte disabled:shadow-none disabled:hover:translate-y-0"
      >
        {pending === "connect" && <Loader size="sm" />}
        {pending === "connect" ? "Enregistrement…" : "Enregistrer et connecter"}
        {!pending && (
          <ArrowRight className="absolute right-7 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
        )}
      </button>
      <button
        type="button"
        onClick={() => submit(false)}
        disabled={pending !== null}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-encre-2 transition-colors hover:text-encre disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending === "skip" && <Loader size="sm" />}
        {pending === "skip" ? "Enregistrement…" : "Enregistrer sans connecter"}
      </button>
    </>
  );
}

function StepHeader({
  centered = false,
  description,
  title,
}: {
  centered?: boolean;
  description: string;
  title: string;
}) {
  return (
    <div className={centered ? "text-center" : ""}>
      <h1 className="mt-8 text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.01em] text-bleu-fonce">
        {title}
      </h1>
      <p className="mt-2 text-base text-encre-2">{description}</p>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div
      className="mx-auto mt-8 flex min-h-[160px] w-full max-w-[560px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-bordure bg-carte px-5 py-6 text-center text-sm font-semibold text-encre-2"
      role="status"
      aria-live="polite"
    >
      <Loader />
      <span>Chargement du catalogue…</span>
    </div>
  );
}

function Loader({ size = "md" }: { size?: "md" | "sm" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block rounded-full border-2 border-current border-t-transparent text-bleu-fonce motion-safe:animate-spin ${
        size === "sm" ? "h-4 w-4" : "h-9 w-9"
      }`}
    />
  );
}

function OptionCard({
  active,
  detail,
  label,
  onClick,
  variant = "default",
}: {
  active: boolean;
  detail?: string;
  label: string;
  onClick: () => void;
  variant?: "compact" | "default" | "row";
}) {
  const isCompact = variant === "compact";
  const isRow = variant === "row";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex border-2 text-left transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card-hover ${
        isCompact
          ? "min-h-14 items-center justify-center rounded-xl px-4 py-3 text-center"
          : isRow
            ? "min-h-20 items-center justify-between rounded-2xl px-6 py-5"
            : "min-h-[136px] flex-col justify-between rounded-2xl px-5 py-5"
      } ${
        active
          ? "border-bleu bg-bleu-leger shadow-card"
          : "border-bordure bg-carte hover:border-bleu"
      }`}
    >
      <span className="text-sm font-bold tracking-[0.04em] text-bleu-fonce">
        {label}
      </span>
      {detail && (
        <span
          className={`text-sm font-medium leading-[1.45] text-encre-2 ${
            isRow ? "ml-4 text-right" : "mt-3"
          }`}
        >
          {detail}
        </span>
      )}
    </button>
  );
}

function ModelCard({
  active,
  model,
  onClick,
}: {
  active: boolean;
  model: ConfiguratorBicycleModelOption;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-[132px] flex-col rounded-2xl border-2 px-5 py-5 text-left transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card-hover ${
        active
          ? "border-bleu bg-bleu-leger shadow-card"
          : "border-bordure bg-carte hover:border-bleu"
      }`}
    >
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-bleu">
        {model.brandName}
      </span>
      <span className="mt-2 text-base font-extrabold text-bleu-fonce">
        {model.model}
      </span>
      {model.description && (
        <span className="mt-3 text-sm font-medium leading-[1.45] text-encre-2">
          {model.description}
        </span>
      )}
    </button>
  );
}

function loadDraft(): ConfiguratorDraft {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(CONFIGURATOR_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    return normalizeDraft(JSON.parse(raw));
  } catch {
    return {};
  }
}

function persistDraft(draft: ConfiguratorDraft) {
  try {
    window.localStorage.setItem(
      CONFIGURATOR_STORAGE_KEY,
      JSON.stringify(normalizeDraft(draft)),
    );
  } catch {
    // Storage may be unavailable in private browsing or blocked contexts.
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(CONFIGURATOR_STORAGE_KEY);
  } catch {
    // Storage may be unavailable in private browsing or blocked contexts.
  }
}

function normalizeDraft(value: unknown): ConfiguratorDraft {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const raw = value as Record<string, unknown>;

  return {
    bicycleModelId: readInteger(raw.bicycleModelId),
    bicycleName: readString(raw.bicycleName),
    bicycleTypeTitle: readString(raw.bicycleTypeTitle),
    brakeType: readString(raw.brakeType),
    goalTitle: readString(raw.goalTitle),
    priorityComfort: readInteger(raw.priorityComfort),
    priorityDurability: readInteger(raw.priorityDurability),
    prioritySpeed: readInteger(raw.prioritySpeed),
    roadSurfaceTitle: readString(raw.roadSurfaceTitle),
    tireWidthMm: readInteger(raw.tireWidthMm),
    weeklyDistanceKm: readNumber(raw.weeklyDistanceKm),
    wheelSize: readString(raw.wheelSize),
  };
}

function withDefaultPriorities(draft: ConfiguratorDraft): ConfiguratorDraft {
  return {
    ...draft,
    priorityComfort: draft.priorityComfort ?? DEFAULT_PRIORITY_VALUE,
    priorityDurability: draft.priorityDurability ?? DEFAULT_PRIORITY_VALUE,
    prioritySpeed: draft.prioritySpeed ?? DEFAULT_PRIORITY_VALUE,
  };
}

function validateStep(step: ConfiguratorStep, draft: ConfiguratorDraft): string {
  switch (step) {
    case "type":
      return draft.bicycleTypeTitle ? "" : "Sélectionnez un type de vélo.";
    case "modele":
      return draft.bicycleModelId ? "" : "Sélectionnez un modèle.";
    case "terrain":
      return draft.roadSurfaceTitle ? "" : "Sélectionnez un terrain.";
    case "usage":
      return draft.goalTitle ? "" : "Sélectionnez un objectif.";
    case "priorites":
      return hasAllPriorities(draft) ? "" : "Ajustez les priorités.";
    case "kilometres":
      return draft.weeklyDistanceKm ? "" : "Sélectionnez un volume.";
    case "details":
      if (!draft.wheelSize) {
        return "Sélectionnez une taille de roue.";
      }

      if (!draft.tireWidthMm) {
        return "Renseignez la largeur du pneu.";
      }

      return draft.brakeType ? "" : "Sélectionnez un type de frein.";
    case "capteur":
      return validateCompleteDraft(draft);
  }
}

function validateCompleteDraft(draft: ConfiguratorDraft): string {
  for (const step of CONFIGURATOR_STEPS) {
    if (step === "capteur") continue;
    const error = validateStep(step, draft);

    if (error) {
      return error;
    }
  }

  return "";
}

function hasAllPriorities(draft: ConfiguratorDraft) {
  return (
    typeof draft.prioritySpeed === "number" &&
    typeof draft.priorityComfort === "number" &&
    typeof draft.priorityDurability === "number"
  );
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return undefined;
}

function readInteger(value: unknown) {
  return Number.isInteger(value) ? (value as number) : undefined;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatConfiguratorError(message?: string) {
  if (!message) {
    return "La configuration n'a pas pu être enregistrée.";
  }

  const messages: Record<string, string> = {
    Unauthorized: "Connectez-vous pour enregistrer votre configuration.",
    "Selected bicycle model does not match the bicycle type":
      "Le modèle choisi ne correspond pas au type de vélo.",
    "Selected goal is not available": "Objectif indisponible.",
    "Selected road surface is not available": "Terrain indisponible.",
    "Unable to submit configurator":
      "La configuration n'a pas pu être enregistrée.",
  };

  return messages[message] ?? message;
}
