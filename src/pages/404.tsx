import RouterTitle from '@/layouts/common/components/router-title.tsx';

const NotFound = () => {
  return (
    <>
      <RouterTitle />
      <div
        className="pos-a"
        style={{
          background: '#fff',
          pointerEvents: 'auto',
          width: '100%',
          height: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          Sorry, the page you visited does not exist
        </div>
      </div>
    </>
  );
};

export default NotFound;
