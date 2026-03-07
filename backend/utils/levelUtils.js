const LEVELS = {
  Beginner: { min: 0, max: 100 },
  Intermediate: { min: 101, max: 300 },
  Advanced: { min: 301, max: Infinity },
};

function computeLevel(points) {
  if (points == null || Number.isNaN(points)) return "Beginner";
  if (points <= LEVELS.Beginner.max) return "Beginner";
  if (points <= LEVELS.Intermediate.max) return "Intermediate";
  return "Advanced";
}

module.exports = {
  computeLevel,
  LEVELS,
};

