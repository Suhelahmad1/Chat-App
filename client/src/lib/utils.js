export function formatMessageTime(date) {
  return new Date().toLocaleTimeString("en-us", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
