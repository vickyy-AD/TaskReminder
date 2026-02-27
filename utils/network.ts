export const formatErrorMessage = (
  raw: string | undefined,
  fallback: string,
) => {
  if (!raw) return fallback;
  const lower = raw.toLowerCase();

  if (
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("failed to connect") ||
    lower.includes("timed out")
  ) {
    return "Network error. Check your internet connection and try again.";
  }

  return raw || fallback;
};
