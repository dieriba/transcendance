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
export const BALL_VELOCITY = 2;
export const PADDLE_HEIGHT = GAME_BOARD_HEIGHT / 5;
export const PADDLE_WIDTH = PADDLE_HEIGHT / 10;
export const PADDLE_SPEED = 4;
export const RESIZE_FACTOR = 1.3;
export const defaultBall = {
  speed: BALL_VELOCITY,
  radius: 1,
  xPosition: GAME_BOARD_WIDTH / 2,
  yPosition: GAME_BOARD_HEIGHT / 2,
};

export const defaultPlayer = {
  paddleWidth: 0.015,
  paddleHeight: 0.16,
  xPosition: 0.015,
  yPosition: 0.5,
  speed: 2,
};

export const defaultOpponentPlayer = {
  paddleWidth: 0.015,
  paddleHeight: 0.16,
  xPosition: 1 - defaultPlayer.xPosition,
  yPosition: 0.5,
  speed: 2,
};

export const GAME_INVITATION_TIME_LIMIT = 10;
export const GAME_INVITATION_TIME_LIMIT_SNACKBAR =
  GAME_INVITATION_TIME_LIMIT * 1000;
export const FRAME_RATE = 1000 / 60;
export const FACTOR_POSITION = 1;
export const BALL_WIDTH = 0.018;
export const ASPECT_RATIO = 286 / 175;
export const BALL_HEIGHT = BALL_WIDTH * ASPECT_RATIO;
export const LINE_MARGIN = 0.01;
export const LINE_WIDTH = PADDLE_WIDTH;
export const BALL_LOW = BALL_HEIGHT / 2 + 2 * LINE_MARGIN + LINE_WIDTH;
export const BALL_HIGH = 1 - BALL_LOW;
