import { createDeleteHandler, createItemGetHandler, createPutHandler } from "../../../../lib/api.js";
export const GET = createItemGetHandler("transactions");
export const PUT = createPutHandler("transactions");
export const DELETE = createDeleteHandler("transactions");
