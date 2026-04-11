function capitalizeWords(str) {
  if (!str) return "-";
  return str
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
function elementEmoji(el) {
  const map = {
    fire: "🔥",
    water: "💧",
    thunder: "⚡",
    ice: "❄️",
    dragon: "🐉",
  };

  return map[el?.toLowerCase()] || "✨";
}

module.exports = { capitalizeWords, elementEmoji };
