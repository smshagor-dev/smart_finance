import { createListHandler, createPostHandler } from "../../../lib/api.js";
export const GET = createListHandler("savings-goals");
export const POST = createPostHandler("savings-goals");
