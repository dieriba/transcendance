import { Shared_docs } from "../../../data/data";
import DocumentMessage from "../ChatBodyComponents/DocumentMessage";

const Docs = () => {
  return (
    <>
      {Shared_docs.map((docs) => (
        <DocumentMessage {...docs} />
      ))}
    </>
  );
};

export default Docs;
