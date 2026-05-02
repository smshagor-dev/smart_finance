import { createListHandler, createPostHandler } from "@/lib/api";
export const GET = createListHandler("savings-contributions");
export const POST = createPostHandler("savings-contributions");
