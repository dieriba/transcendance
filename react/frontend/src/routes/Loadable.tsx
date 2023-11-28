import loadable, {
  DefaultComponent,
  LoadableComponent,
} from "@loadable/component";
import LoadingScreen from "../components/Loading/LoadingScreen";

const Loadable = <TProps,>(
  loadFn: (props: TProps) => Promise<DefaultComponent<TProps>>
): LoadableComponent<TProps> =>
  loadable(loadFn, { fallback: <LoadingScreen size="10rem"/> });

export default Loadable;
