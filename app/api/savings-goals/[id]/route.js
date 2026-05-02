import { createDeleteHandler, createItemGetHandler, createPutHandler } from "@/lib/api";
export const GET = createItemGetHandler("savings-goals");
export const PUT = createPutHandler("savings-goals");
export const DELETE = createDeleteHandler("savings-goals");
