import { createListHandler, createPostHandler } from "@/lib/api";
export const GET = createListHandler("wallets");
export const POST = createPostHandler("wallets");
