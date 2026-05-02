import { createDeleteHandler, createItemGetHandler, createPutHandler } from "@/lib/api";
export const GET = createItemGetHandler("ai-insights");
export const PUT = createPutHandler("ai-insights");
export const DELETE = createDeleteHandler("ai-insights");
