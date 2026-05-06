import { createListHandler, createPostHandler } from "../../../lib/api.js";
export const GET = createListHandler("currencies");
export const POST = createPostHandler("currencies");
