import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Avatar,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { GameController, User } from "phosphor-react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useEffect, useState } from "react";
import { socket } from "../../utils/getSocket";
import { GeneralEvent } from "../../../shared/socket.event";
import { SocketServerSucessResponse } from "../../services/type";
import { RootState } from "../../redux/store";
import BadgeAvatar from "../../components/Badge/BadgeAvatar";
import { useGetLeaderboardQuery } from "../../redux/features/pong/pong.api.slice";
import GameInvitation from "../../components/game-invitation/GameInvitation";
import {
  setLeaderboardUser,
  updateUserStatus,
} from "../../redux/features/pong/pong.slice";
import { UserUpdateStatusType } from "../../models/login/UserSchema";
import UserProfile from "../../components/Profile/UserProfile";
import { UserWithProfile } from "../../models/ChatContactSchema";
import StyledBadge from "../../components/Badge/StyledBadge";

const LeaderboardPage = () => {
  const { data, isLoading, isError } = useGetLeaderboardQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [info, setInfo] = useState<{
    gameInvitation: boolean;
    profile: boolean;
    nickname: string;
    id: string;
    user: UserWithProfile | undefined;
  }>({
    gameInvitation: false,
    profile: false,
    id: "",
    nickname: "",
    user: undefined,
  });

  const handleSetUser = (data: UserWithProfile) => {
    setInfo((prev) => ({ ...prev, profile: true, user: data }));
  };

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data && data.data) {
      dispatch(setLeaderboardUser(data.data));

      if (!socket) return;

      socket.on(
        GeneralEvent.USER_UPDATE_STATUS,
        (data: SocketServerSucessResponse & { data: UserUpdateStatusType }) => {
          dispatch(updateUserStatus(data.data));
        }
      );

      return () => {
        socket.off(GeneralEvent.USER_UPDATE_STATUS);
      };
    }
  }, [data, dispatch]);

  const users = useAppSelector((state: RootState) => state.pong.users);
  const myNickname = useAppSelector(
    (state: RootState) => state.user.user?.nickname
  );

  if (isLoading) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <CircularProgress size={100} />
      </Stack>
    );
  } else if (isError || !data) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <Typography>An error has occured</Typography>
      </Stack>
    );
  } else {
    return (
      <>
        <Stack
          spacing={3}
          width={"100%"}
          justifyContent={"center"}
          height={"100vh"}
          alignItems="center"
        >
          <Typography variant="h2" fontStyle={"italic"}>
            Leaderboard
          </Typography>
          <TableContainer
            sx={{ maxHeight: "500px", overflow: "scroll", width: "80%" }}
            component={Paper}
          >
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell align="center">Rank</TableCell>
                  <TableCell align="center">Avatar</TableCell>
                  <TableCell align="center">Nickname</TableCell>
                  <TableCell align="center">Rating</TableCell>
                  <TableCell align="center">Win - Defeat</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(
                  (
                    {
                      id,
                      nickname,
                      pong,
                      status,
                      profile: { avatar, firstname, lastname },
                    },
                    index
                  ) => (
                    <TableRow
                      key={id}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell padding="checkbox"></TableCell>
                      <TableCell align="center">
                        <Typography>{index + 1}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        {status === "ONLINE" ? (
                          <BadgeAvatar>
                            <Avatar
                              sx={{ width: "50px", height: "50px" }}
                              src={avatar ? avatar : undefined}
                            />
                          </BadgeAvatar>
                        ) : (
                          <StyledBadge>
                            <Avatar
                              sx={{ width: "50px", height: "50px" }}
                              src={avatar ? avatar : undefined}
                            />
                          </StyledBadge>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle1">{nickname}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography>{pong ? pong.rating : 0}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography>
                          {pong ? `${pong.victory} - ${pong.losses}` : "0 - 0"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          justifyContent="center"
                          spacing={2}
                        >
                          {myNickname !== nickname && (
                            <>
                              <Tooltip
                                onClick={() => {
                                  setInfo((prev) => ({
                                    ...prev,
                                    gameInvitation: true,
                                    id,
                                    nickname,
                                  }));
                                }}
                                placement="top"
                                title={`Play with ${nickname}`}
                              >
                                <IconButton>
                                  <GameController />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip
                            onClick={() => {
                              handleSetUser({
                                id,
                                nickname,
                                status,
                                profile: { avatar, firstname, lastname },
                                pong,
                              });
                            }}
                            placement="top"
                            title="Profile"
                          >
                            <IconButton>
                              <User />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
        {info.gameInvitation && (
          <GameInvitation
            open={info.gameInvitation}
            handleClose={() =>
              setInfo((prev) => ({ ...prev, gameInvitation: false }))
            }
            nickname={info.nickname}
            id={info.id}
          />
        )}
        {info.profile && (
          <UserProfile
            handleClose={() => setInfo((prev) => ({ ...prev, profile: false }))}
            open={info.profile}
            user={info.user as UserWithProfile}
            myNickname={myNickname}
          />
        )}
      </>
    );
  }
};

export default LeaderboardPage;
