import { createListHandler, createPostHandler } from "../../../lib/api.js";
export const GET = createListHandler("wallets");
export const POST = createPostHandler("wallets");
