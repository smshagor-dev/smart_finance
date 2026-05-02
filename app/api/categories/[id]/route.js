import { createDeleteHandler, createItemGetHandler, createPutHandler } from "@/lib/api";
export const GET = createItemGetHandler("categories");
export const PUT = createPutHandler("categories");
export const DELETE = createDeleteHandler("categories");
