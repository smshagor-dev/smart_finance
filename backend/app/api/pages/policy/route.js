import { listPublishedPolicyPages } from "../../../../lib/custom-pages.js";

export async function GET() {
  const items = await listPublishedPolicyPages();
  return Response.json({ items });
}
