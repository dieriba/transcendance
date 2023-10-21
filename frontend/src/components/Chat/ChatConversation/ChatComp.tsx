import ChatContactInfo from "../ChatContactInfo";
import SharedMessage from "../SharedMessage";
import { useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";

const ChatComp = () => {
  const sidebar = useAppSelector((state: RootState) => state.sidebar.tab);
  console.log(sidebar);

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
