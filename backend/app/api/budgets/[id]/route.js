import { createDeleteHandler, createItemGetHandler, createPutHandler } from "../../../../lib/api.js";
export const GET = createItemGetHandler("budgets");
export const PUT = createPutHandler("budgets");
export const DELETE = createDeleteHandler("budgets");
