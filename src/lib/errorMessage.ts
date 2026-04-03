/** Safe message from mutation/catch `unknown` errors without using `any`. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
