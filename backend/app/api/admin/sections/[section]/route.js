import { requireAdmin } from "../../../../../lib/auth.js";
import { getAdminSectionData } from "../../../../../lib/admin-sections.js";

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    const { section } = await params;
    const data = await getAdminSectionData(section);

    if (!data) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(data);
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
