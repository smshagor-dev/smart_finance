import { getPublicSiteSettings } from "../../../../lib/site-settings.js";

export async function GET() {
  const settings = await getPublicSiteSettings();
  return Response.json(settings);
}
