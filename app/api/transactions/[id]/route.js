import { createDeleteHandler, createItemGetHandler, createPutHandler } from "@/lib/api";
export const GET = createItemGetHandler("transactions");
export const PUT = createPutHandler("transactions");
export const DELETE = createDeleteHandler("transactions");
