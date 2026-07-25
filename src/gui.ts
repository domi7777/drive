import { Constants } from './constants';
import { getRenderer } from './renderer';
import {
  getLeaderboardUid,
  fetchUserRecord,
  savePlayerScore,
  fetchLeaderboard,
  showLeaderboardOverlay,
  showNameEntryOverlay,
} from './utils/leaderboard';

let gameOver = false;
let currentUserUid: string | null = null;
let currentUserName: string | null = null;
export const updateGui = (elapsedSeconds: number, bonusCount: number) => {
  const score = bonusCount * Constants.SCORE_MULTIPLIER;
  // update timer display and check for end of game
  if (timerEl && !gameOver) {
    const remaining = Constants.GAME_DURATION - elapsedSeconds;
    timerEl.innerText = formatTime(remaining > 0 ? remaining : 0);
    if (remaining <= 0) {
      // game over
      endGame(score);
    }
  }

  const bonusEl = document.querySelector('.game-bonus-count') as HTMLSpanElement | null;
  if (bonusEl) {
    bonusEl.innerText = String(score);
  }
};

// Elements are now provided in `index.html`; query them.
const timerEl = document.querySelector('.game-timer') as HTMLDivElement | null;
const overlay = document.querySelector('.game-overlay') as HTMLDivElement | null;
const restartBtn = document.querySelector('.game-restart-btn') as HTMLButtonElement | null;

if (restartBtn)
  restartBtn.addEventListener('click', () => {
    location.reload(); // FIXME: replace with proper reset logic
  });
if (overlay) overlay.style.visibility = 'hidden';

// Load user's best score from leaderboard when the game starts
loadUserBestScore();

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

async function loadUserBestScore() {
  try {
    const uid = await getLeaderboardUid();
    currentUserUid = uid;
    const userRecord = await fetchUserRecord(uid);

    if (userRecord) {
      currentUserName = userRecord.name;
      // bestScore = userRecord.score;
      // deathCount = userRecord.deaths || 0;
    } else {
      // bestScore = 0;
      // deathCount = 0;
    }
  } catch (error) {
    console.error('Failed to load user best score:', error);
  }
}

function endGame(score: number) {
  if (gameOver) {
    return;
  }
  gameOver = true;
  // stop the render loop
  getRenderer().setAnimationLoop(null);
  createLeaderboardUI(score);
}

async function createLeaderboardUI(score: number) {
  const saveScore = async (playerName: string) => {
    if (!currentUserUid) return;
    await savePlayerScore(currentUserUid, playerName, score);
    const scores = await fetchLeaderboard();
    showLeaderboardOverlay(scores, () => {
      location.reload();
    });
  };

  if (currentUserName) {
    saveScore(currentUserName);
    return;
  }

  showNameEntryOverlay(score, async (name) => {
    currentUserName = name;
    await saveScore(name);
  });
}
