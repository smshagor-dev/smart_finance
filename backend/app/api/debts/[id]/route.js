import { createDeleteHandler, createItemGetHandler, createPutHandler } from "../../../../lib/api.js";
export const GET = createItemGetHandler("debts");
export const PUT = createPutHandler("debts");
export const DELETE = createDeleteHandler("debts");
