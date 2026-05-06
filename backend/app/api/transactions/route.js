import { createListHandler, createPostHandler } from "../../../lib/api.js";
export const GET = createListHandler("transactions");
export const POST = createPostHandler("transactions");
