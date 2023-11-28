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

export type UserCoordinate = { id: string } & Coordinate;

export type UpdatedGameData = {
  player1: UserCoordinate;
  player2: UserCoordinate;
  ball: Coordinate;
};
