import { jsonError } from "@/lib/api-response";
import { loadConfiguratorOptions } from "@/lib/configurator";

export async function GET() {
  try {
    const data = await loadConfiguratorOptions();

    return Response.json({ data });
  } catch {
    return jsonError("Unable to load configurator options", 500);
  }
}
