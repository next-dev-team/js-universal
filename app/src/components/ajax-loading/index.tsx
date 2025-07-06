import Loading from '@/router/utils/loading';

export type Props = {
  visible?: boolean | null;
};

const AjaxLoading = (props: Props) => {
  const { visible } = props;

  return <div>{visible && <Loading />}</div>;
};
export default AjaxLoading;
