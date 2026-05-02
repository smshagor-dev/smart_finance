import { createListHandler, createPostHandler } from "@/lib/api";
export const GET = createListHandler("debts");
export const POST = createPostHandler("debts");
