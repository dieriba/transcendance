export type Coordinate = {
  x: number;
  y: number;
};

export type Dimension = {
  height: number;
  width: number;
};

export type Velocity = {
  x: number;
  y: number;
};

export type BallInfoType = Coordinate & {
  player1Score: number;
  player2Score: number;
};

export type PlayerData = { id: string; score: number } & Coordinate;

export type UpdatedGameData = {
  player1: PlayerData;
  player2: PlayerData;
  coordinates: Coordinate[];
};

type playerInfo = {
  id: string;
  nickname?: string;
  score: number;
};

export type EndGameData = {
  winner: playerInfo;
  looser: playerInfo;
};

export type StartGameInfo = {
  room: string;
  creator: PlayerStartGameInfo;
  opponent: PlayerStartGameInfo;
};

export type PlayerStartGameInfo = {
  id?: string;
  nickname: string;
  avatar: string | undefined;
  socketId?: string;
};
