import React, { useEffect, useState } from 'react';
import {
  ApiOutlined,
  AppstoreOutlined,
  CodeOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Card,
  Col,
  Divider,
  Row,
  Select,
  Space,
  Switch,
  Tooltip,
  Typography,
} from 'antd';
import type { BetterTStackConfig } from '@/types/project';

const { Text, Paragraph } = Typography;
const { Option } = Select;

interface BetterTStackBuilderProps {
  config: BetterTStackConfig;
  onChange: (config: BetterTStackConfig) => void;
  onCommandChange: (command: string) => void;
}

const BetterTStackBuilder: React.FC<BetterTStackBuilderProps> = ({
  config,
  onChange,
  onCommandChange,
}) => {
  const [generatedCommand, setGeneratedCommand] = useState<string>('');

  // Configuration options
  const frontendOptions = [
    { value: 'react', label: 'React', description: 'Popular UI library' },
    { value: 'vue', label: 'Vue.js', description: 'Progressive framework' },
    { value: 'svelte', label: 'Svelte', description: 'Compile-time framework' },
    {
      value: 'solid',
      label: 'SolidJS',
      description: 'Fine-grained reactivity',
    },
    { value: 'nuxt', label: 'Nuxt.js', description: 'Vue.js framework' },
    { value: 'next', label: 'Next.js', description: 'React framework' },
  ];

  const apiOptions = [
    { value: 'trpc', label: 'tRPC', description: 'End-to-end typesafe APIs' },
    { value: 'orpc', label: 'oRPC', description: 'OpenAPI-compatible RPC' },
    { value: 'elysia', label: 'Elysia', description: 'Bun-first framework' },
    { value: 'hono', label: 'Hono', description: 'Ultrafast web framework' },
  ];

  const databaseOptions = [
    { value: 'turso', label: 'Turso', description: 'Edge SQLite database' },
    {
      value: 'postgres',
      label: 'PostgreSQL',
      description: 'Advanced SQL database',
    },
    { value: 'mysql', label: 'MySQL', description: 'Popular SQL database' },
    { value: 'sqlite', label: 'SQLite', description: 'Lightweight database' },
    {
      value: 'planetscale',
      label: 'PlanetScale',
      description: 'Serverless MySQL',
    },
  ];

  const ormOptions = [
    { value: 'drizzle', label: 'Drizzle ORM', description: 'TypeScript ORM' },
    { value: 'prisma', label: 'Prisma', description: 'Next-generation ORM' },
  ];

  const runtimeOptions = [
    { value: 'node', label: 'Node.js', description: 'JavaScript runtime' },
    { value: 'bun', label: 'Bun', description: 'Fast all-in-one toolkit' },
    { value: 'deno', label: 'Deno', description: 'Secure TypeScript runtime' },
  ];

  const authOptions = [
    { value: 'clerk', label: 'Clerk', description: 'Complete authentication' },
    { value: 'auth0', label: 'Auth0', description: 'Identity platform' },
    {
      value: 'supabase',
      label: 'Supabase Auth',
      description: 'Open source auth',
    },
    {
      value: 'firebase',
      label: 'Firebase Auth',
      description: 'Google auth service',
    },
  ];

  const addonOptions = [
    {
      value: 'starlight',
      label: 'Starlight',
      description: 'Documentation site',
    },
    {
      value: 'storybook',
      label: 'Storybook',
      description: 'Component development',
    },
    {
      value: 'tailwind',
      label: 'Tailwind CSS',
      description: 'Utility-first CSS',
    },
    { value: 'shadcn', label: 'shadcn/ui', description: 'Component library' },
  ];

  const exampleOptions = [
    { value: 'todo', label: 'Todo App', description: 'Simple task manager' },
    { value: 'ai', label: 'AI App', description: 'AI-powered application' },
    { value: 'blog', label: 'Blog', description: 'Content management' },
    { value: 'ecommerce', label: 'E-commerce', description: 'Online store' },
  ];

  const packageManagerOptions = [
    { value: 'npm', label: 'npm', description: 'Node package manager' },
    { value: 'yarn', label: 'Yarn', description: 'Fast package manager' },
    { value: 'pnpm', label: 'pnpm', description: 'Efficient package manager' },
    { value: 'bun', label: 'Bun', description: 'Ultra-fast package manager' },
  ];

  // Generate CLI command based on configuration
  const generateCommand = (currentConfig: BetterTStackConfig): string => {
    let command = 'yarn create better-t-stack@latest';

    // Add flags based on configuration
    if (currentConfig.frontend) {
      command += ` --frontend ${currentConfig.frontend}`;
    }
    if (currentConfig.api) {
      command += ` --api ${currentConfig.api}`;
    }
    if (currentConfig.database) {
      command += ` --database ${currentConfig.database}`;
    }
    if (currentConfig.orm) {
      command += ` --orm ${currentConfig.orm}`;
    }
    if (currentConfig.runtime) {
      command += ` --runtime ${currentConfig.runtime}`;
    }
    if (currentConfig.auth) {
      command += ` --auth ${currentConfig.auth}`;
    }
    if (currentConfig.addons && currentConfig.addons.length > 0) {
      command += ` --addons ${currentConfig.addons.join(',')}`;
    }
    if (currentConfig.examples) {
      command += ` --example ${currentConfig.examples}`;
    }
    if (
      currentConfig.packageManager &&
      currentConfig.packageManager !== 'bun'
    ) {
      command += ` --package-manager ${currentConfig.packageManager}`;
    }
    if (currentConfig.installDeps === false) {
      command += ` --no-install`;
    }
    if (currentConfig.gitInit === false) {
      command += ` --no-git`;
    }

    command += ' --yes'; // Auto-confirm prompts

    return command;
  };

  // Update command when config changes
  useEffect(() => {
    const command = generateCommand(config);
    setGeneratedCommand(command);
    onCommandChange(command);
  }, [config, onCommandChange]);

  const handleConfigChange = (key: keyof BetterTStackConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    onChange(newConfig);
  };

  const copyCommand = () => {
    navigator.clipboard.writeText(generatedCommand);
  };

  const renderSelectCard = (
    title: string,
    icon: React.ReactNode,
    options: Array<{ value: string; label: string; description: string }>,
    value: string | undefined,
    onChange: (value: string) => void,
    placeholder: string,
    dataTestId?: string,
  ) => (
    <Card size="small" className="config-card">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          {icon}
          <Text strong>{title}</Text>
        </Space>
        <Select
          style={{ width: '100%' }}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          allowClear
          data-testid={dataTestId}
        >
          {options.map((option) => (
            <Option key={option.value} value={option.value}>
              <div>
                <div>{option.label}</div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {option.description}
                </Text>
              </div>
            </Option>
          ))}
        </Select>
      </Space>
    </Card>
  );

  return (
    <div className="better-t-stack-builder" data-testid="better-t-stack-config">
      <Alert
        message="Better T Stack Configuration"
        description="Configure your full-stack TypeScript project with best practices and modern tools."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]}>
        {/* Frontend */}
        <Col xs={24} sm={12} lg={8}>
          {renderSelectCard(
            'Frontend',
            <GlobalOutlined />,
            frontendOptions,
            config.frontend,
            (value) => handleConfigChange('frontend', value),
            'Select frontend framework',
            'frontend-select',
          )}
        </Col>

        {/* API Layer */}
        <Col xs={24} sm={12} lg={8}>
          {renderSelectCard(
            'API Layer',
            <ApiOutlined />,
            apiOptions,
            config.api,
            (value) => handleConfigChange('api', value),
            'Select API framework',
          )}
        </Col>

        {/* Database */}
        <Col xs={24} sm={12} lg={8}>
          {renderSelectCard(
            'Database',
            <DatabaseOutlined />,
            databaseOptions,
            config.database,
            (value) => handleConfigChange('database', value),
            'Select database',
            'database-select',
          )}
        </Col>

        {/* ORM */}
        <Col xs={24} sm={12} lg={8}>
          {renderSelectCard(
            'ORM',
            <CodeOutlined />,
            ormOptions,
            config.orm,
            (value) => handleConfigChange('orm', value),
            'Select ORM',
          )}
        </Col>

        {/* Runtime */}
        <Col xs={24} sm={12} lg={8}>
          {renderSelectCard(
            'Runtime',
            <SettingOutlined />,
            runtimeOptions,
            config.runtime,
            (value) => handleConfigChange('runtime', value),
            'Select runtime',
          )}
        </Col>

        {/* Authentication */}
        <Col xs={24} sm={12} lg={8}>
          {renderSelectCard(
            'Authentication',
            <SafetyOutlined />,
            authOptions,
            config.auth,
            (value) => handleConfigChange('auth', value),
            'Select auth provider',
          )}
        </Col>

        {/* Addons */}
        <Col xs={24} sm={12} lg={8}>
          <Card size="small" className="config-card">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <AppstoreOutlined />
                <Text strong>Addons</Text>
              </Space>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select addons"
                value={config.addons}
                onChange={(value) => handleConfigChange('addons', value)}
              >
                {addonOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    <div>
                      <div>{option.label}</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {option.description}
                      </Text>
                    </div>
                  </Option>
                ))}
              </Select>
            </Space>
          </Card>
        </Col>

        {/* Examples */}
        <Col xs={24} sm={12} lg={8}>
          {renderSelectCard(
            'Example',
            <ExperimentOutlined />,
            exampleOptions,
            config.examples,
            (value) => handleConfigChange('examples', value),
            'Select example template',
          )}
        </Col>

        {/* Package Manager */}
        <Col xs={24} sm={12} lg={8}>
          {renderSelectCard(
            'Package Manager',
            <SettingOutlined />,
            packageManagerOptions,
            config.packageManager,
            (value) => handleConfigChange('packageManager', value),
            'Select package manager',
          )}
        </Col>
      </Row>

      <Divider />

      {/* Additional Options */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Text strong>Install Dependencies</Text>
                <Tooltip title="Automatically install dependencies after project creation">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
              <Switch
                checked={config.installDeps !== false}
                onChange={(checked) =>
                  handleConfigChange('installDeps', checked)
                }
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Text strong>Initialize Git</Text>
                <Tooltip title="Initialize Git repository in the project">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
              <Switch
                checked={config.gitInit !== false}
                onChange={(checked) => handleConfigChange('gitInit', checked)}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Generated Command Preview */}
      <Card
        title="Generated Command"
        size="small"
        data-testid="command-preview"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Paragraph
            code
            copyable={{ text: generatedCommand, onCopy: copyCommand }}
            style={{ margin: 0, wordBreak: 'break-all' }}
          >
            {generatedCommand}
          </Paragraph>
          <Text type="secondary">
            This command will be executed to create your project with the
            selected configuration.
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default BetterTStackBuilder;
