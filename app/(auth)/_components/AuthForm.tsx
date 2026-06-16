"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { ArrowRight, Button } from "@/app/_components/ui";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

const inputClass =
  "h-12 w-full rounded-xl border border-bordure bg-white pl-4 text-[15px] font-medium text-encre transition duration-200 placeholder:text-encre-3 focus:border-bleu focus:outline-none focus:ring-4 focus:ring-bleu/10";

const labelClass = "text-sm font-bold text-bleu-fonce";

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister
      ? {
          email: readFormString(formData, "email"),
          firstName: readFormString(formData, "firstName"),
          lastName: readFormString(formData, "lastName"),
          password: readFormString(formData, "password"),
        }
      : {
          email: readFormString(formData, "email"),
          password: readFormString(formData, "password"),
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(formatAuthError(payload.error));
        return;
      }

      router.replace("/pneu");
      router.refresh();
    } catch {
      setError("Connexion impossible. Réessayez dans un instant.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isRegister && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            autoComplete="given-name"
            label="Prénom"
            name="firstName"
            required
          />
          <Field
            autoComplete="family-name"
            label="Nom"
            name="lastName"
            required
          />
        </div>
      )}

      <Field
        autoComplete="email"
        label="Adresse email"
        name="email"
        required
        type="email"
      />
      <Field
        autoComplete={isRegister ? "new-password" : "current-password"}
        label="Mot de passe"
        minLength={8}
        name="password"
        required
        trailingControl={
          <button
            type="button"
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
            aria-pressed={showPassword}
            className="flex h-9 w-9 items-center justify-center rounded-full text-encre-3 transition duration-200 hover:bg-bleu/10 hover:text-bleu-fonce focus:outline-none focus:ring-4 focus:ring-bleu/10"
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        }
        type={showPassword ? "text" : "password"}
      />

      {error && (
        <p
          className="rounded-card-sm border border-danger/25 bg-danger-fond px-4 py-3 text-sm font-semibold text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="group w-full gap-3">
        {pending
          ? isRegister
            ? "Création…"
            : "Connexion…"
          : isRegister
            ? "Créer le compte"
            : "Se connecter"}
        {!pending && (
          <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
        )}
      </Button>

      <p className="text-center text-sm font-medium text-encre-2">
        {isRegister ? "Déjà inscrit ?" : "Pas encore de compte ?"}{" "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="font-bold text-bleu-fonce transition-colors hover:text-bleu"
        >
          {isRegister ? "Se connecter" : "Créer un compte"}
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  trailingControl,
  type = "text",
  ...props
}: {
  autoComplete: string;
  label: string;
  minLength?: number;
  name: string;
  required?: boolean;
  trailingControl?: ReactNode;
  type?: "email" | "password" | "text";
}) {
  const inputId = `auth-${name}`;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          className={`${inputClass} ${trailingControl ? "pr-12" : "pr-4"}`}
          name={name}
          type={type}
          {...props}
        />
        {trailingControl && (
          <div className="absolute inset-y-0 right-2 flex items-center">
            {trailingControl}
          </div>
        )}
      </div>
    </div>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M2.06 12.35a11.52 11.52 0 0 1 19.88 0 11.52 11.52 0 0 1-19.88 0Z" />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m2 2 20 20" />
      <path d="M6.7 6.7A11.7 11.7 0 0 0 2.06 12.35a11.52 11.52 0 0 0 15.24 5.65" />
      <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
      <path d="M14.12 9.88 9.88 14.12" />
      <path d="M10.73 5.12a11.5 11.5 0 0 1 11.21 7.23 11.67 11.67 0 0 1-2.06 3.14" />
    </svg>
  );
}

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function formatAuthError(message?: string) {
  if (!message) {
    return "La demande n'a pas abouti.";
  }

  const messages: Record<string, string> = {
    "A valid email is required": "Adresse email invalide.",
    "Already authenticated": "Vous êtes déjà connecté.",
    "Email and password are required": "Email et mot de passe sont requis.",
    "Email is already registered": "Cette adresse email est déjà utilisée.",
    "firstName and lastName are required": "Prénom et nom sont requis.",
    "Invalid credentials": "Identifiants invalides.",
    "Password must be at least 8 characters":
      "Le mot de passe doit contenir au moins 8 caractères.",
    "Unable to register user": "Création du compte impossible.",
  };

  return messages[message] ?? message;
}
