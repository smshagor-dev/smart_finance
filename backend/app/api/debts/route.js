import { createListHandler, createPostHandler } from "../../../lib/api.js";
export const GET = createListHandler("debts");
export const POST = createPostHandler("debts");
