export const GAME_TITLE = 'Pong!';
export const TITLE_SIZE = '60px';
export const TITLE_FONT = 'Arial';
export const MAX_DATE = '9999-12-31T23:59:59.999Z';
export const VALID_UPLOADS_MIME_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
];
export const GAME_SUBTITLE = 'Click to play...';
export const SUBTITLE_SIZE = '32px';
export const SUBTITLE_FONT = 'Arial';
export type keyPressedType = 'ArrowUp' | 'ArrowDown';
export const SCORE_SIZE = '60px';
export const SCORE_FONT = 'Arial';

export const WINNING_SCORE = 5;

// Pixels the players are from the edge
export const PLAYER_PADDING = 40;

export const ArrowUp = 'ArrowUp';
export const ArrowDown = 'ArrowDown';

// Paddle size
export const BALL_VELOCITY = 0.01;
export const RESIZE_FACTOR = 1.3;
export const defaultBall = {
  speed: BALL_VELOCITY,
  radius: 0.05,
  xPosition: 0.5,
  yPosition: 0.5,
};

export const GAME_INVITATION_TIME_LIMIT = 10;
export const GAME_INVITATION_TIME_LIMIT_SNACKBAR =
  GAME_INVITATION_TIME_LIMIT * 1000;
export const FRAME_RATE = 1000 / 60;
export const BALL_HALF_WIDTH = 0.009;
export const ASPECT_RATIO = 286 / 175;
export const BALL_HALF_HEIGHT = BALL_HALF_WIDTH * ASPECT_RATIO;
export const GAME_MARGIN = 15;
export const PLAYER_SPEED = 0.02;
export const PADDLE_MARGIN_X = 0.01;
export const PADDLE_MARGIN_Y = PADDLE_MARGIN_X * ASPECT_RATIO;
export const PADDLE_WIDTH = 0.015;
export const PADDLE_HEIGHT = 0.16;
export const PADDLE_MIN_Y_POS = PADDLE_MARGIN_Y + PADDLE_HEIGHT / 2;
export const PADDLE_MAX_Y_POS = 1 - PADDLE_MIN_Y_POS;

export const defaultPlayer = {
  paddleWidth: PADDLE_WIDTH,
  paddleHeight: PADDLE_HEIGHT,
  xPosition: PADDLE_MARGIN_X + PADDLE_WIDTH / 2,
  yPosition: 0.5,
  speed: PLAYER_SPEED,
};

export const defaultOpponentPlayer = {
  paddleWidth: PADDLE_WIDTH,
  paddleHeight: PADDLE_HEIGHT,
  xPosition: 1 - defaultPlayer.xPosition,
  yPosition: 0.5,
  speed: PLAYER_SPEED,
};

export type gameStatus = 'NOT_STARTED' | 'STARTED' | 'IN_PROGRESS' | 'FINISHED';
export const scoreToWinPongGame = 3;
export const pongGameDuration = 15;
