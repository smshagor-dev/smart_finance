import { createDeleteHandler, createItemGetHandler } from "@/lib/api";
export const GET = createItemGetHandler("receipts");
export const DELETE = createDeleteHandler("receipts");
