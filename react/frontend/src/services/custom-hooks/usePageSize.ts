import { useWindowSize } from "usehooks-ts";
import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from "../../utils/constant";

const usePageSize = () => {
  const { width, height } = useWindowSize();
  if (width < 900) return { width, height: height - NAVBAR_HEIGHT };

  return { width: width - SIDEBAR_WIDTH, height };
};

export default usePageSize;
