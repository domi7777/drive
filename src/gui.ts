import { Constants } from './constants';
import { getRenderer } from './renderer';
import { formatTime } from './utils/time';
import { handleLeaderboardFlow, loadUserBestScore } from './utils/leaderboard';

let gameOver = false;
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
loadUserBestScore().then((score) => {
  document.querySelector('.game-best-score')!.textContent = String(score);
});

function endGame(score: number) {
  if (gameOver) {
    return;
  }
  gameOver = true;
  // stop the render loop
  getRenderer().setAnimationLoop(null);
  handleLeaderboardFlow(score, () => {
    location.reload();
  });
}
