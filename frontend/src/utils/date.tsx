export function convertDate(date: string | null | undefined) {
  if (!date) {
    return null;
  }

  const newDate = new Date(date);
  return newDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}
