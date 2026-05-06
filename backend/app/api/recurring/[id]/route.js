import { createDeleteHandler, createItemGetHandler, createPutHandler } from "../../../../lib/api.js";
export const GET = createItemGetHandler("recurring");
export const PUT = createPutHandler("recurring");
export const DELETE = createDeleteHandler("recurring");
