import { createListHandler, createPostHandler } from "@/lib/api";
export const GET = createListHandler("categories");
export const POST = createPostHandler("categories");
