import loadable, {
  DefaultComponent,
  LoadableComponent,
} from "@loadable/component";

const Loader = () => <div>Loading...</div>;

const Loadable = <TProps,>(
  loadFn: (props: TProps) => Promise<DefaultComponent<TProps>>
): LoadableComponent<TProps> => loadable(loadFn, { fallback: <Loader /> });

export default Loadable;
