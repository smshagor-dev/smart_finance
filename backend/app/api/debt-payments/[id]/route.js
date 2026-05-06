import { createDeleteHandler, createItemGetHandler } from "../../../../lib/api.js";
export const GET = createItemGetHandler("debt-payments");
export const DELETE = createDeleteHandler("debt-payments");
