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

// Pixels the players are from the edge
export const PLAYER_PADDING = 40;

// Paddle size
export const BALL_VELOCITY = 0.01;
export const PADDLE_HEIGHT = 1 / 5;
export const PADDLE_WIDTH = PADDLE_HEIGHT / 10;
export const PADDLE_SPEED = 4;
export const RESIZE_FACTOR = 1.3;
export const defaultBall = {
  speed: BALL_VELOCITY,
  radius: 0.05,
  xPosition: 0.5,
  yPosition: 0.5,
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
export const BALL_HALF_WIDTH = 0.009;
export const ASPECT_RATIO = 286 / 175;
export const BALL_HALF_HEIGHT = BALL_HALF_WIDTH * ASPECT_RATIO;
export const LINE_MARGIN = 0.01;
export const LINE_WIDTH = PADDLE_WIDTH;
export const BALL_LOW = BALL_HALF_HEIGHT / 2 + 2 * LINE_MARGIN + LINE_WIDTH;
export const BALL_HIGH = 1 - BALL_LOW;
export const GAME_MARGIN = 15;
