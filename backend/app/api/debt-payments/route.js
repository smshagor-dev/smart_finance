import { createListHandler, createPostHandler } from "../../../lib/api.js";
export const GET = createListHandler("debt-payments");
export const POST = createPostHandler("debt-payments");
