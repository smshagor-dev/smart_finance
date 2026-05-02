import { createListHandler, createPostHandler } from "@/lib/api";
export const GET = createListHandler("currencies");
export const POST = createPostHandler("currencies");
