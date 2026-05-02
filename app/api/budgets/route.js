import { createListHandler, createPostHandler } from "@/lib/api";
export const GET = createListHandler("budgets");
export const POST = createPostHandler("budgets");
