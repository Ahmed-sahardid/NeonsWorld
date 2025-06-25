// js/player.js
export function getPlayerData() {
  return {
    path: localStorage.getItem('path') || 'Unknown',
    difficulty: localStorage.getItem('difficulty') || 'Easy',
    xp: parseInt(localStorage.getItem('xp') || '0'),
    level: parseInt(localStorage.getItem('level') || '1'),
  };
}

export function setPlayerData({ path, difficulty, xp, level }) {
  if (path) localStorage.setItem('path', path);
  if (difficulty) localStorage.setItem('difficulty', difficulty);
  if (xp !== undefined) localStorage.setItem('xp', xp);
  if (level !== undefined) localStorage.setItem('level', level);
}
