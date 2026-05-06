import { stringify } from "csv-stringify/sync";
import { requireUser } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/prisma.js";

export async function GET() {
  const user = await requireUser();
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true, wallet: true },
    orderBy: { transactionDate: "desc" },
  });

  const csv = stringify(
    transactions.map((item) => ({
      type: item.type,
      amount: item.amount.toString(),
      category: item.category?.name || "",
      wallet: item.wallet?.name || "",
      date: item.transactionDate.toISOString(),
      note: item.note || "",
    })),
    { header: true },
  );

  await prisma.exportLog.create({ data: { userId: user.id, format: "csv", resource: "transactions" } });
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="transactions.csv"',
    },
  });
}
