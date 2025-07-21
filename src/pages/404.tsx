import React from 'react';
import { Result, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useRouter } from '@/hooks/use-router';

const NotFound: React.FC = () => {
  const { push } = useRouter();

  const handleBackHome = () => {
    push('/');
  };

  return (
    <DashboardLayout 
      title="Page Not Found" 
      showSearch={false} 
      showCreateButton={false}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh' 
      }}>
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
    </DashboardLayout>
  );
};

export default NotFound;
