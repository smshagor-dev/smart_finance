import { createDeleteHandler, createItemGetHandler, createPutHandler } from "@/lib/api";
export const GET = createItemGetHandler("wallets");
export const PUT = createPutHandler("wallets");
export const DELETE = createDeleteHandler("wallets");
