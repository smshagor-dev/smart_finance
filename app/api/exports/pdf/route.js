import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { transactionDate: "desc" },
    take: 20,
  });

  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Finance Tracker Report", 14, 20);
  doc.setFontSize(10);
  transactions.forEach((item, index) => {
    const y = 35 + index * 8;
    doc.text(`${item.transactionDate.toISOString().slice(0, 10)} | ${item.type} | ${item.category?.name || "-"} | ${item.amount}`, 14, y);
  });

  await prisma.exportLog.create({ data: { userId: user.id, format: "pdf", resource: "report" } });
  return new NextResponse(Buffer.from(doc.output("arraybuffer")), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="report.pdf"',
    },
  });
}
