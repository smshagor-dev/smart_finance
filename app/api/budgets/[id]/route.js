import { createDeleteHandler, createItemGetHandler, createPutHandler } from "@/lib/api";
export const GET = createItemGetHandler("budgets");
export const PUT = createPutHandler("budgets");
export const DELETE = createDeleteHandler("budgets");
