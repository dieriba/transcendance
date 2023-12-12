import { Button, Stack } from "@mui/material";
import { useGetQrCodeMutation } from "../../../redux/features/user/user.api.slice";
import { useState } from "react";
import QrCode from "./QrCode";
import { RootState } from "../../../redux/store";
import { useAppSelector } from "../../../redux/hooks";
import Disable2Fa from "./Disable2Fa";

const TwoFa = () => {
  const [data, setData] = useState<{
    qrCode: string | undefined;
    otpTempSecret: string;
    disable: boolean;
  }>({ qrCode: undefined, otpTempSecret: "", disable: false });

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
    setData({ qrCode: undefined, otpTempSecret: "", disable: false });
  };

  const handleRender = () => {
    setData((prev) => ({ ...prev, disable: true }));
  };

  return (
    <>
      <Stack>
        {twoFa ? (
          <>
            {data.disable === false ? (
              <Button
                onClick={handleRender}
                fullWidth
                variant="contained"
                color="inherit"
              >
                Disable 2Fa
              </Button>
            ) : (
              <>
                <Disable2Fa clearState={clearState} />
              </>
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
