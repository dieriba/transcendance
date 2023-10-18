import { createTheme, PaletteMode, responsiveFontSizes } from "@mui/material";
import React from "react";
import { getDesignTokens } from "./theme";

export const useColorTheme = () => {
  const [mode, setMode] = React.useState<PaletteMode>("light");

  const toggleColorMode = () =>
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));

  const modifiedTheme = React.useMemo(
    () => createTheme(getDesignTokens(mode)),
    [mode]
  );

  return {
    theme: responsiveFontSizes(modifiedTheme),
    mode,
    toggleColorMode,
  };
};
