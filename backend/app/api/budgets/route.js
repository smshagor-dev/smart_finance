import { createListHandler, createPostHandler } from "../../../lib/api.js";
export const GET = createListHandler("budgets");
export const POST = createPostHandler("budgets");
