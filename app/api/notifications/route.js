import { createListHandler, createPostHandler } from "@/lib/api";
export const GET = createListHandler("notifications");
export const POST = createPostHandler("notifications");
