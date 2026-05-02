import { createListHandler, createPostHandler } from "@/lib/api";
export const GET = createListHandler("recurring");
export const POST = createPostHandler("recurring");
