import { createListHandler, createPostHandler } from "../../../lib/api.js";
export const GET = createListHandler("notifications");
export const POST = createPostHandler("notifications");
