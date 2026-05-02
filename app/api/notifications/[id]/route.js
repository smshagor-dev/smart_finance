import { createDeleteHandler, createItemGetHandler, createPutHandler } from "@/lib/api";
export const GET = createItemGetHandler("notifications");
export const PUT = createPutHandler("notifications");
export const DELETE = createDeleteHandler("notifications");
