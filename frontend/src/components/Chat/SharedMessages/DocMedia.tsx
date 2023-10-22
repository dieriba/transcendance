import Docs from "./Docs";
import Media from "./Media";

interface DocMediaProps {
  value: number;
}

const DocMedia = ({ value }: DocMediaProps) => {
  switch (value) {
    case 0:
      return <Media/>;
    case 1:
      return <Docs />;
    default:
      return null;
  }
};

export default DocMedia;
