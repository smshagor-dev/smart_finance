import { createDeleteHandler, createItemGetHandler } from "@/lib/api";
export const GET = createItemGetHandler("savings-contributions");
export const DELETE = createDeleteHandler("savings-contributions");
