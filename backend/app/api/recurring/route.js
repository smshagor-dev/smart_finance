import { createListHandler, createPostHandler } from "../../../lib/api.js";
export const GET = createListHandler("recurring");
export const POST = createPostHandler("recurring");
