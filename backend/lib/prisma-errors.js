export function isMissingTableError(error) {
  const message = String(error?.message || "");

  return (
    error?.code === "P2021" ||
    message.includes("does not exist in the current database") ||
    message.includes("The table `") ||
    message.includes("Collection not found") ||
    message.includes("ns does not exist")
  );
}
