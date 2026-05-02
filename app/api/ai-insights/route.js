import { createListHandler, createPostHandler } from "@/lib/api";
export const GET = createListHandler("ai-insights");
export const POST = createPostHandler("ai-insights");
