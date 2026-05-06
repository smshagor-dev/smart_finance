import { AsyncLocalStorage } from "node:async_hooks";

const requestContext = new AsyncLocalStorage();

export function runWithRequestContext(context, callback) {
  return requestContext.run(context, callback);
}

export function getRequestContext() {
  return requestContext.getStore() || null;
}

export function getCurrentRequest() {
  return getRequestContext()?.request || null;
}
