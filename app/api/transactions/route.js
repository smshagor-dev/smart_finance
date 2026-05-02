import { createListHandler, createPostHandler } from "@/lib/api";
export const GET = createListHandler("transactions");
export const POST = createPostHandler("transactions");
