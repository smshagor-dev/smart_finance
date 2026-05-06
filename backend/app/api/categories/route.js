import { createListHandler, createPostHandler } from "../../../lib/api.js";
export const GET = createListHandler("categories");
export const POST = createPostHandler("categories");
