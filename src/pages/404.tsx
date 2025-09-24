import React from 'react';
import { HomeOutlined } from '@ant-design/icons';
import { Button, Result } from 'antd';
import { useRouter } from '@/hooks/use-router';

const NotFound: React.FC = () => {
  const { push } = useRouter();

  const handleBackHome = () => {
    push('/');
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={handleBackHome}
          >
            Back to Dashboard
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
