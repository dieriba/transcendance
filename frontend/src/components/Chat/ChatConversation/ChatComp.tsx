import ChatContactInfo from "../ChatContactInfo";
import SharedMessage from "../SharedMessages/SharedMessage";
import { useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";

const ChatComp = () => {
  const { open, tab } = useAppSelector((state: RootState) => state.sidebar);
  if (open) {
    switch (tab) {
      case "CONTACT":
        return <ChatContactInfo />;
      case "SHARED":
        return <SharedMessage />;
      default:
        return null;
    }
  } else {
    return null;
  }
};

export default ChatComp;
