import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true, wallet: true },
    orderBy: { transactionDate: "desc" },
  });

  const worksheet = XLSX.utils.json_to_sheet(
    transactions.map((item) => ({
      Type: item.type,
      Amount: item.amount.toString(),
      Category: item.category?.name || "",
      Wallet: item.wallet?.name || "",
      Date: item.transactionDate.toISOString(),
      Note: item.note || "",
    })),
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  await prisma.exportLog.create({ data: { userId: user.id, format: "excel", resource: "transactions" } });
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="transactions.xlsx"',
    },
  });
}
