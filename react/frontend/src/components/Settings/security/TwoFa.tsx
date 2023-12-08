import { Button, Stack } from "@mui/material";
import { useGetQrCodeMutation } from "../../../redux/features/user/user.api.slice";
import { useState } from "react";
import QrCode from "./QrCode";
import { RootState } from "../../../redux/store";
import { useAppSelector } from "../../../redux/hooks";
import Disable2Fa from "./Disable2Fa";
export type Render = "DISABLE" | "UPDATE" | undefined;

const TwoFa = () => {
  const [data, setData] = useState<{
    qrCode: string | undefined;
    otpTempSecret: string;
    render: Render | undefined;
  }>({ qrCode: undefined, otpTempSecret: "", render: undefined });

  const [getQrCode, { isLoading }] = useGetQrCodeMutation();

  const handleSubmit = async () => {
    try {
      const res = await getQrCode().unwrap();

      setData((prev) => ({ ...prev, ...res.data }));
    } catch (error) {
      /** */
    }
  };
  const twoFa = useAppSelector((state: RootState) => state.user.user?.twoFa);

  const clearState = () => {
    setData({ qrCode: undefined, otpTempSecret: "", render: undefined });
  };

  const handleRender = (render: Render) => {
    setData((prev) => ({ ...prev, render }));
  };

  return (
    <>
      <Stack>
        {twoFa ? (
          <>
            {data.render === undefined ? (
              <Stack spacing={1}>
                <Button
                  onClick={() => {
                    handleRender("UPDATE");
                  }}
                  fullWidth
                  variant="contained"
                  color="inherit"
                >
                  Update 2Fa
                </Button>
                <Button
                  onClick={() => {
                    handleRender("DISABLE");
                  }}
                  fullWidth
                  variant="contained"
                  color="inherit"
                >
                  Disable 2Fa
                </Button>
              </Stack>
            ) : data.render === "DISABLE" ? (
              <>
                <Disable2Fa clearState={clearState} />
              </>
            ) : (
              <></>
            )}
          </>
        ) : (
          <>
            {data.qrCode && (
              <QrCode secret={data.otpTempSecret} qrCode={data.qrCode} />
            )}
            {!data.qrCode && (
              <Button
                disabled={isLoading}
                onClick={handleSubmit}
                color="inherit"
                variant="contained"
              >
                ENABLED 2FA
              </Button>
            )}
          </>
        )}
      </Stack>
    </>
  );
};

export default TwoFa;
