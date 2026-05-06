import { createDeleteHandler, createItemGetHandler } from "../../../../lib/api.js";
export const GET = createItemGetHandler("savings-contributions");
export const DELETE = createDeleteHandler("savings-contributions");
