
import runtimeEnv from "../config/runtime-env.cjs";

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
}

export function logApiError(context, error) {
  const message = getErrorMessage(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(`[${context}] ${message}`);
  if (stack) {
    console.error(stack);
  }
}

export function createErrorResponse(context, error, options = {}) {
  const message = getErrorMessage(error);
  const isProduction = runtimeEnv.isProduction();
  const status =
    options.status ||
    (error?.name === "ZodError"
      ? 400
      : message === "UNAUTHORIZED"
        ? 401
        : message === "FORBIDDEN"
          ? 403
          : 500);

  const publicMessage = status >= 500 && isProduction ? options.publicMessage || "Internal server error" : options.publicMessage || message;
  const details = status >= 500 && isProduction ? undefined : options.details || message;

  logApiError(context, error);

  return Response.json(
    {
      error: publicMessage,
      ...(details ? { details } : {}),
    },
    { status },
  );
}
