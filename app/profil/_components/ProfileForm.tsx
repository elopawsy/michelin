"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { LogoutButton } from "@/app/_components/LogoutButton";
import { Button } from "@/app/_components/ui";

type ProfileUser = {
  email: string;
  firstName: string;
  lastName: string;
};

type ProfileFormProps = {
  user: ProfileUser;
};

const inputClass =
  "h-12 w-full rounded-xl border border-bordure bg-white px-4 text-[15px] font-medium text-encre transition duration-200 placeholder:text-encre-3 focus:border-bleu focus:outline-none focus:ring-4 focus:ring-bleu/10";

const labelClass = "text-sm font-bold text-bleu-fonce";

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: readFormString(formData, "email"),
          firstName: readFormString(formData, "firstName"),
          lastName: readFormString(formData, "lastName"),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(formatProfileError(payload.error));
        return;
      }

      setSuccess("Profil mis à jour.");
      router.refresh();
    } catch {
      setError("Mise à jour impossible. Réessayez dans un instant.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
      <form
        onSubmit={handleSubmit}
        className="rounded-card border border-bordure bg-carte p-6 shadow-card sm:p-8"
      >
        <div>
          <h2 className="text-2xl font-extrabold text-bleu-fonce">
            Informations personnelles
          </h2>
          <p className="mt-2 text-sm leading-[1.6] text-encre-2">
            Ces informations sont utilisées pour personnaliser votre espace
            Michelin Ride.
          </p>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <Field
            autoComplete="given-name"
            defaultValue={user.firstName}
            label="Prénom"
            name="firstName"
            required
          />
          <Field
            autoComplete="family-name"
            defaultValue={user.lastName}
            label="Nom"
            name="lastName"
            required
          />
          <div className="sm:col-span-2">
            <Field
              autoComplete="email"
              defaultValue={user.email}
              label="Adresse email"
              name="email"
              required
              type="email"
            />
          </div>
        </div>

        {error && (
          <p
            className="mt-5 rounded-card-sm border border-danger/25 bg-danger-fond px-4 py-3 text-sm font-semibold text-danger"
            role="alert"
          >
            {error}
          </p>
        )}
        {success && (
          <p
            className="mt-5 rounded-card-sm border border-succes/25 bg-succes-fond px-4 py-3 text-sm font-semibold text-succes"
            role="status"
          >
            {success}
          </p>
        )}

        <Button type="submit" disabled={pending} className="mt-6 w-full sm:w-auto">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>

      <section className="rounded-card border border-bordure bg-carte p-6 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-bleu">
          Session
        </p>
        <h2 className="mt-3 text-xl font-extrabold text-bleu-fonce">
          Connexion active
        </h2>
        <p className="mt-3 text-sm leading-[1.6] text-encre-2">
          Déconnectez-vous de cet espace si vous changez de compte ou quittez
          cet appareil.
        </p>
        <LogoutButton variant="app" className="mt-5 h-10 w-full text-sm" />
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...props
}: {
  autoComplete: string;
  defaultValue: string;
  label: string;
  name: string;
  required?: boolean;
  type?: "email" | "text";
}) {
  const inputId = `profile-${name}`;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className={labelClass}>
        {label}
      </label>
      <input
        id={inputId}
        className={inputClass}
        name={name}
        type={type}
        {...props}
      />
    </div>
  );
}

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function formatProfileError(message?: string) {
  if (!message) {
    return "La demande n'a pas abouti.";
  }

  const messages: Record<string, string> = {
    "A valid email is required": "Adresse email invalide.",
    "Email is already registered": "Cette adresse email est déjà utilisée.",
    "firstName and lastName are required": "Prénom et nom sont requis.",
    "Unable to update user": "Mise à jour du profil impossible.",
    Unauthorized: "Session expirée. Reconnectez-vous.",
  };

  return messages[message] ?? message;
}
