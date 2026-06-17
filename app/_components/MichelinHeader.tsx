import { getCurrentUserSummary } from "@/lib/current-session";
import { MichelinHeaderClient } from "./MichelinHeaderClient";

/* En-tête marketing partagé : logo Michelin officiel + navigation. */
export async function MichelinHeader() {
  const user = await getCurrentUserSummary();

  return <MichelinHeaderClient user={user} />;
}
