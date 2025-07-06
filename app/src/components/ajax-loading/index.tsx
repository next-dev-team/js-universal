import Loading from '@/router/utils/loading.tsx';

export type Props = {
  visible?: boolean | null;
};
import Loading from '@/router/utils/loading';

const AjaxLoading = (props: Props) => {
  const { visible } = props;

  return <div>{visible && <Loading visible={visible} />}</div>;
};
export default AjaxLoading;
