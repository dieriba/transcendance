import { Button, Stack } from "@mui/material";
import { useGetQrCodeMutation } from "../../../redux/features/user/user.api.slice";
import { useState } from "react";
import QrCode from "./QrCode";
import { RootState } from "../../../redux/store";
import { useAppSelector } from "../../../redux/hooks";

const TwoFa = () => {
  const [data, setData] = useState<{
    qrCode: string | undefined;
    otpSecret: string;
  }>({ qrCode: undefined, otpSecret: "" });

  const [getQrCode, { isLoading }] = useGetQrCodeMutation();

  const handleSubmit = async () => {
    try {
      const res = await getQrCode().unwrap();
      console.log({ res });

      setData(res.data);
    } catch (error) {
      console.log({ error });
    }
  };
  const twoFa = useAppSelector((state: RootState) => state.user.user?.twoFa);

  return (
    <>
      <Stack>
        {twoFa ? (
          <Stack spacing={1}>
            <Button fullWidth variant="contained" color="inherit">
              Update 2Fa
            </Button>
            <Button fullWidth variant="contained" color="inherit">
              Disabled 2Fa
            </Button>
          </Stack>
        ) : (
          <>
            {data.qrCode && (
              <QrCode secret={data.otpSecret} qrCode={data.qrCode} />
            )}
            {!data.qrCode && (
              <Button
                disabled={isLoading}
                onClick={handleSubmit}
                color="inherit"
                variant="contained"
              >
                ENABLED TWO
              </Button>
            )}
          </>
        )}
      </Stack>
    </>
  );
};

export default TwoFa;
