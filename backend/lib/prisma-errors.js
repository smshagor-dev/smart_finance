export function isMissingTableError(error) {
  return (
    error?.code === "P2021" ||
    error?.message?.includes("does not exist in the current database") ||
    error?.message?.includes("The table `")
  );
}
