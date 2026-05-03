import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminSectionData } from "@/lib/admin-sections";

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    const { section } = await params;
    const data = await getAdminSectionData(section);

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
