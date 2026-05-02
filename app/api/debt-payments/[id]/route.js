import { createDeleteHandler, createItemGetHandler } from "@/lib/api";
export const GET = createItemGetHandler("debt-payments");
export const DELETE = createDeleteHandler("debt-payments");
