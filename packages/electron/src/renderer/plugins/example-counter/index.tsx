import React, { useState } from 'react';
import { Button, Card, Typography, Space } from 'antd';
import { PlusOutlined, MinusOutlined, ReloadOutlined } from '@ant-design/icons';
import { createDirectPlugin, DirectPlugin } from '../index';

const { Title, Text } = Typography;

// Example Counter Plugin Component
const ExampleCounterPlugin: React.FC = () => {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(0);

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <Card
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              Example Counter Plugin
            </Title>
          </Space>
        }
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={reset}
            size="small"
          >
            Reset
          </Button>
        }
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Title level={1} style={{ fontSize: '3rem', margin: '20px 0' }}>
            {count}
          </Title>
          <Text type="secondary">Current Count</Text>
        </div>
        
        <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
          <Button 
            type="primary" 
            icon={<MinusOutlined />} 
            onClick={decrement}
            size="large"
          >
            Decrease
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={increment}
            size="large"
          >
            Increase
          </Button>
        </Space>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Text type="secondary">
            This is an example of a direct plugin built into the main app.
          </Text>
        </div>
      </Card>
    </div>
  );
};

// Plugin configuration
const exampleCounterPlugin: DirectPlugin = createDirectPlugin({
  id: 'example-counter',
  name: 'Example Counter',
  version: '1.0.0',
  description: 'A simple counter plugin to demonstrate direct plugin development',
  component: ExampleCounterPlugin,
  icon: 'calculator',
  category: 'examples',
});

export default exampleCounterPlugin;