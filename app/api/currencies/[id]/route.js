import { createDeleteHandler, createItemGetHandler, createPutHandler } from "@/lib/api";
export const GET = createItemGetHandler("currencies");
export const PUT = createPutHandler("currencies");
export const DELETE = createDeleteHandler("currencies");
