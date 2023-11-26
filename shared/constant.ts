export const GAME_TITLE = "Pong!";
export const TITLE_SIZE = "60px";
export const TITLE_FONT = "Arial";
export const MAX_DATE = "9999-12-31T23:59:59.999Z";
export const VALID_UPLOADS_MIME_TYPES = [
  "image/jpg",
  "image/jpeg",
  "image/png",
];
export const GAME_SUBTITLE = "Click to play...";
export const SUBTITLE_SIZE = "32px";
export const SUBTITLE_FONT = "Arial";

export const SCORE_SIZE = "60px";
export const SCORE_FONT = "Arial";

export const WINNING_SCORE = 5;

export const GAME_BOARD_WIDTH = 1000;
export const GAME_BOARD_HEIGHT = (GAME_BOARD_WIDTH * 7) / 11;

// Pixels the players are from the edge
export const PLAYER_PADDING = 40;

// Paddle size
export const PADDLE_HEIGHT = GAME_BOARD_HEIGHT / 5;
export const PADDLE_WIDTH = PADDLE_HEIGHT / 10;
export const PADDLE_SPEED = 4;
export const RESIZE_FACTOR = 1.3;
export const defaultBall = {
  speed: 3,
  radius: 2,
  xPosition: GAME_BOARD_WIDTH / 2,
  yPosition: GAME_BOARD_HEIGHT / 2,
};

export const defaultPlayer = {
  paddleWidth: 50,
  paddleHeight: 5,
  xPosition: GAME_BOARD_WIDTH / 2,
  yPosition: GAME_BOARD_HEIGHT - 20,
  speed: 4,
};

export const defaultOpponentPlayer = {
  paddleWidth: 50,
  paddleHeight: 5,
  xPosition: GAME_BOARD_WIDTH / 2,
  yPosition: 0,
  speed: 4,
};

export const GAME_INVITATION_TIME_LIMIT = 10;
