import { createDeleteHandler, createItemGetHandler } from "../../../../lib/api.js";
export const GET = createItemGetHandler("receipts");
export const DELETE = createDeleteHandler("receipts");
