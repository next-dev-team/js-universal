import React, { useEffect, useRef, useState } from 'react';
import {
  ApiOutlined,
  BookOutlined,
  DesktopOutlined,
  FileOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  GithubOutlined,
  GlobalOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  MobileOutlined,
  PlusOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Steps,
  Switch,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { useProjectStore } from '../../store/modules/use-project-store';
import type {
  BetterTStackConfig,
  ProjectCreateModalProps,
  ProjectCreateRequest,
  ProjectTemplate,
} from '../../types/project';
import BetterTStackBuilder from './BetterTStackBuilder';
import './styles.css';

const { Text, Paragraph, Title } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProjectTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'create' | 'open'>('create');
  const [dragActive, setDragActive] = useState(false);
  const [useBetterTStack, setUseBetterTStack] = useState(false);
  const [betterTStackConfig, setBetterTStackConfig] =
    useState<BetterTStackConfig>({
      frontend: 'next',
      api: 'trpc',
      database: 'sqlite',
      orm: 'drizzle',
      runtime: 'node',
      auth: undefined,
      addons: [],
      examples: undefined,
      packageManager: 'npm',
      installDeps: true,
      gitInit: true,
    });
  const [generatedCommand, setGeneratedCommand] = useState<string>('');
  const dragCounter = useRef(0);

  const {
    createProject,
    openExistingProject,
    addExistingProject,
    templates,
    loadTemplates,
  } = useProjectStore();

  useEffect(() => {
    if (open) {
      loadTemplates();
      setCurrentStep(0);
      setSelectedTemplate(null);
      setUseBetterTStack(false);
      setBetterTStackConfig({
        frontend: 'next',
        api: 'trpc',
        database: 'sqlite',
        orm: 'drizzle',
        runtime: 'node',
        auth: undefined,
        addons: [],
        examples: undefined,
        packageManager: 'npm',
        installDeps: true,
        gitInit: true,
      });
      setGeneratedCommand('');
      form.resetFields();
    }
  }, [open, loadTemplates, form]);

  const projectTypes = [
    {
      key: 'web',
      label: 'Web Application',
      icon: <GlobalOutlined />,
      description: 'Frontend, fullstack, or web-based applications',
    },
    {
      key: 'mobile',
      label: 'Mobile Application',
      icon: <MobileOutlined />,
      description: 'iOS, Android, or cross-platform mobile apps',
    },
    {
      key: 'desktop',
      label: 'Desktop Application',
      icon: <DesktopOutlined />,
      description: 'Native desktop applications for Windows, macOS, or Linux',
    },
    {
      key: 'api',
      label: 'API/Backend',
      icon: <ApiOutlined />,
      description: 'REST APIs, GraphQL, microservices, or backend services',
    },
    {
      key: 'library',
      label: 'Library/Package',
      icon: <BookOutlined />,
      description: 'Reusable libraries, packages, or components',
    },
    {
      key: 'other',
      label: 'Other',
      icon: <FileOutlined />,
      description: 'Scripts, tools, or other types of projects',
    },
  ];

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        // Validate basic info
        await form.validateFields(['name', 'description', 'type']);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        // Check if Better T Stack is selected and validate accordingly
        if (useBetterTStack) {
          // Skip path validation for Better T Stack as it will be generated
          setCurrentStep(2);
        } else {
          // Validate project setup for regular projects
          await form.validateFields(['path']);
          setCurrentStep(2);
        }
      } else if (currentStep === 2) {
        // Move to Better T Stack configuration or final options
        if (useBetterTStack) {
          setCurrentStep(3);
        } else {
          setCurrentStep(3);
        }
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const projectData: ProjectCreateRequest = {
        name: values.name,
        description: values.description,
        type: values.type,
        path: useBetterTStack ? `${values.path}/${values.name}` : values.path,
        template: selectedTemplate?.id,
        gitRepository: values.gitRepository,
        initializeGit: useBetterTStack
          ? betterTStackConfig.gitInit
          : values.initializeGit || false,
        installDependencies: useBetterTStack
          ? betterTStackConfig.installDeps
          : values.installDependencies || false,
        useBetterTStack,
        betterTStackConfig: useBetterTStack ? betterTStackConfig : undefined,
        generatedCommand: useBetterTStack ? generatedCommand : undefined,
      };

      await createProject(projectData);
      message.success(
        useBetterTStack
          ? 'Better T Stack project created successfully!'
          : 'Project created successfully!',
      );

      if (onSuccess) {
        onSuccess(projectData);
      }

      handleCancel();
    } catch (error) {
      console.error('Failed to create project:', error);
      message.error('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrentStep(0);
    setSelectedTemplate(null);
    setUseBetterTStack(false);
    setBetterTStackConfig({
      frontend: 'next',
      api: 'trpc',
      database: 'sqlite',
      orm: 'drizzle',
      runtime: 'node',
      auth: undefined,
      addons: [],
      examples: undefined,
      packageManager: 'npm',
      installDeps: true,
      gitInit: true,
    });
    setGeneratedCommand('');
    if (onCancel) {
      onCancel();
    }
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    form.setFieldsValue({
      type: template.type,
      description: template.description,
    });
  };

  const handleBrowseFolder = async () => {
    try {
      const projectInfo = await window.electronAPI?.project?.selectFolder();
      if (projectInfo) {
        form.setFieldsValue({
          path: projectInfo.path,
          name: projectInfo.name || form.getFieldValue('name'),
        });
        message.success('Project folder selected successfully!');
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
      message.error('Failed to select folder. Please try again.');
    }
  };

  const handleOpenExistingProject = async () => {
    try {
      setLoading(true);
      const project = await openExistingProject();

      if (project) {
        message.success(`Project "${project.name}" opened successfully!`);
        onSuccess?.(project);
        handleCancel();
      }
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : 'Failed to open project',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    dragCounter.current = 0;

    try {
      const files = Array.from(e.dataTransfer.files);

      if (files.length === 0) {
        message.warning('No files were dropped');
        return;
      }

      // Get the first file/folder path
      const file = files[0];
      const folderPath = (file as any).path || file.name;

      if (!folderPath) {
        message.error('Invalid folder path');
        return;
      }

      setLoading(true);
      const project = await addExistingProject(folderPath);

      message.success(`Project "${project.name}" added successfully!`);
      onSuccess?.(project);
      handleCancel();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : 'Failed to add project',
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <Title level={4}>Project Information</Title>
            <Form.Item
              name="name"
              label="Project Name"
              rules={[
                { required: true, message: 'Please enter project name' },
                {
                  min: 2,
                  message: 'Project name must be at least 2 characters',
                },
                {
                  max: 50,
                  message: 'Project name must be less than 50 characters',
                },
                {
                  pattern: /^[a-zA-Z0-9-_\s]+$/,
                  message:
                    'Only letters, numbers, hyphens, underscores and spaces allowed',
                },
              ]}
            >
              <Input placeholder="Enter project name" size="large" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: 'Please enter project description' },
                {
                  max: 200,
                  message: 'Description must be less than 200 characters',
                },
              ]}
            >
              <TextArea
                placeholder="Describe your project"
                rows={3}
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Form.Item
              name="type"
              label="Project Type"
              rules={[
                { required: true, message: 'Please select project type' },
              ]}
            >
              <div className="project-type-selector">
                <Row gutter={[16, 16]}>
                  {projectTypes.map((type) => (
                    <Col span={12} key={type.key}>
                      <Card
                        className={`type-card ${form.getFieldValue('type') === type.key ? 'selected' : ''}`}
                        hoverable
                        onClick={() => form.setFieldsValue({ type: type.key })}
                      >
                        <div className="type-content">
                          <div className="type-icon">{type.icon}</div>
                          <div className="type-info">
                            <Text strong>{type.label}</Text>
                            <Paragraph className="type-description">
                              {type.description}
                            </Paragraph>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </Form.Item>
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <Title level={4}>Project Setup</Title>

            {/* Better T Stack Option */}
            <Form.Item name="useBetterTStack" valuePropName="checked">
              <div className="option-item">
                <Switch
                  data-testid="better-t-stack-toggle"
                  checked={useBetterTStack}
                  onChange={setUseBetterTStack}
                />
                <div className="option-content">
                  <Space>
                    <ThunderboltOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Use Better T Stack</Text>
                  </Space>
                  <Text className="option-description">
                    Advanced project starter with modern tech stack
                    configuration
                  </Text>
                </div>
              </div>
            </Form.Item>

            {!useBetterTStack && (
              <Form.Item
                name="path"
                label={
                  <Space>
                    Project Location
                    <Tooltip title="Choose where to create your project">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  {
                    required: true,
                    message: 'Please specify project location',
                  },
                ]}
              >
                <Input.Group compact>
                  <Input
                    style={{ width: 'calc(100% - 100px)' }}
                    placeholder="/path/to/project"
                    size="large"
                  />
                  <Button
                    size="large"
                    icon={<FolderOpenOutlined />}
                    onClick={handleBrowseFolder}
                  >
                    Browse
                  </Button>
                </Input.Group>
              </Form.Item>
            )}

            {useBetterTStack && (
              <Form.Item
                name="path"
                label={
                  <Space>
                    Base Directory (Optional)
                    <Tooltip title="Project will be created in a subfolder with your project name">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
              >
                <Input.Group compact>
                  <Input
                    style={{ width: 'calc(100% - 100px)' }}
                    placeholder={'/path/to/base/directory'}
                    size="large"
                  />
                  <Button
                    size="large"
                    icon={<FolderOpenOutlined />}
                    onClick={handleBrowseFolder}
                  >
                    Browse
                  </Button>
                </Input.Group>
              </Form.Item>
            )}

            {!useBetterTStack && (
              <>
                <Divider>Template Selection (Optional)</Divider>

                <div className="template-selector">
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Card
                        className={`template-card ${!selectedTemplate ? 'selected' : ''}`}
                        hoverable
                        onClick={() => setSelectedTemplate(null)}
                      >
                        <div className="template-content">
                          <FolderOutlined className="template-icon" />
                          <Text strong>Empty Project</Text>
                          <Text className="template-description">
                            Start with an empty folder
                          </Text>
                        </div>
                      </Card>
                    </Col>
                    {templates.map((template) => (
                      <Col span={8} key={template.id}>
                        <Card
                          className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                          hoverable
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div className="template-content">
                            <div className="template-icon">
                              <FileOutlined />
                            </div>
                            <Text strong>{template.name}</Text>
                            <Text className="template-description">
                              {template.description}
                            </Text>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </>
            )}
          </div>
        );

      case 2:
        if (useBetterTStack) {
          return (
            <div className="step-content">
              <Title level={4}>Better T Stack Configuration</Title>
              <BetterTStackBuilder
                config={betterTStackConfig}
                onChange={(config) => {
                  setBetterTStackConfig(config);
                }}
                onCommandChange={(command) => {
                  setGeneratedCommand(command);
                }}
              />
            </div>
          );
        }
        // Fall through to case 3 for regular projects
        return renderAdditionalOptions();

      case 3:
        return renderAdditionalOptions();

      default:
        return null;
    }
  };

  const renderAdditionalOptions = () => {
    return (
      <div className="step-content">
        <Title level={4}>Additional Options</Title>

        {!useBetterTStack && (
          <>
            <Form.Item name="gitRepository" label="Git Repository (Optional)">
              <Input
                placeholder="https://github.com/username/repo.git"
                prefix={<GithubOutlined />}
                size="large"
              />
            </Form.Item>

            <Form.Item name="initializeGit" valuePropName="checked">
              <div className="option-item">
                <Switch />
                <div className="option-content">
                  <Text strong>Initialize Git Repository</Text>
                  <Text className="option-description">
                    Create a new Git repository in the project folder
                  </Text>
                </div>
              </div>
            </Form.Item>

            <Form.Item name="installDependencies" valuePropName="checked">
              <div className="option-item">
                <Switch />
                <div className="option-content">
                  <Text strong>Install Dependencies</Text>
                  <Text className="option-description">
                    Automatically install project dependencies after creation
                  </Text>
                </div>
              </div>
            </Form.Item>

            <Divider />
          </>
        )}

        <div className="project-summary">
          <Title level={5}>Project Summary</Title>
          <div className="summary-item">
            <Text strong>Name:</Text> <Text>{form.getFieldValue('name')}</Text>
          </div>
          <div className="summary-item">
            <Text strong>Type:</Text> <Text>{form.getFieldValue('type')}</Text>
          </div>
          <div className="summary-item">
            <Text strong>Location:</Text>{' '}
            <Text>
              {useBetterTStack
                ? `${form.getFieldValue('path')}/${form.getFieldValue('name')}`
                : form.getFieldValue('path')}
            </Text>
          </div>
          {useBetterTStack ? (
            <>
              <div className="summary-item">
                <Text strong>Stack:</Text> <Text>Better T Stack</Text>
              </div>
              <div className="summary-item">
                <Text strong>Frontend:</Text>{' '}
                <Text>{betterTStackConfig.frontend}</Text>
              </div>
              <div className="summary-item">
                <Text strong>Database:</Text>{' '}
                <Text>{betterTStackConfig.database}</Text>
              </div>
              {generatedCommand && (
                <div className="summary-item">
                  <Text strong>Command:</Text>
                  <div
                    style={{
                      marginTop: 8,
                      padding: 12,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 4,
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {generatedCommand}
                  </div>
                </div>
              )}
            </>
          ) : (
            selectedTemplate && (
              <div className="summary-item">
                <Text strong>Template:</Text>{' '}
                <Text>{selectedTemplate.name}</Text>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  const getSteps = () => {
    const baseSteps = [
      {
        title: 'Project Info',
        description: 'Basic information',
      },
      {
        title: 'Setup',
        description: 'Location and template',
      },
    ];

    if (useBetterTStack) {
      baseSteps.push({
        title: 'Configuration',
        description: 'Better T Stack setup',
      });
    }

    baseSteps.push({
      title: 'Options',
      description: 'Additional settings',
    });

    return baseSteps;
  };

  const steps = getSteps();

  return (
    <Modal
      title={mode === 'create' ? 'Create New Project' : 'Open Existing Project'}
      open={open}
      onCancel={handleCancel}
      width={800}
      className="project-create-modal"
      footer={null}
      destroyOnHidden={true}
    >
      <div
        className="modal-content"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Mode Selection */}
        <div style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Card
                hoverable
                className={mode === 'create' ? 'selected-card' : ''}
                onClick={() => setMode('create')}
                style={{
                  border:
                    mode === 'create'
                      ? '2px solid #1890ff'
                      : '1px solid #d9d9d9',
                  cursor: 'pointer',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <PlusOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                  <div>
                    <strong>Create New Project</strong>
                  </div>
                  <Text type="secondary">
                    Start from scratch or use a template
                  </Text>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                hoverable
                className={mode === 'open' ? 'selected-card' : ''}
                onClick={() => setMode('open')}
                style={{
                  border:
                    mode === 'open' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  cursor: 'pointer',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <FolderOpenOutlined
                    style={{ fontSize: 24, marginBottom: 8 }}
                  />
                  <div>
                    <strong>Open Existing Project</strong>
                  </div>
                  <Text type="secondary">
                    Import an existing project folder
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {mode === 'create' ? (
          <>
            <Steps current={currentStep} className="create-steps">
              {steps.map((step, index) => (
                <Step
                  key={index}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </Steps>

            <Form form={form} layout="vertical" className="create-form">
              {renderStepContent()}
            </Form>

            <div className="modal-actions">
              <Space>
                <Button onClick={handleCancel}>Cancel</Button>
                {currentStep > 0 && (
                  <Button onClick={handlePrev}>Previous</Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button type="primary" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={loading}
                    icon={useBetterTStack ? <ThunderboltOutlined /> : undefined}
                  >
                    {useBetterTStack
                      ? 'Create Better T Stack Project'
                      : 'Create Project'}
                  </Button>
                )}
              </Space>
            </div>
          </>
        ) : (
          <>
            {/* Drag and Drop Area */}
            <div
              style={{
                border: dragActive
                  ? '2px dashed #1890ff'
                  : '2px dashed #d9d9d9',
                borderRadius: 8,
                padding: 40,
                textAlign: 'center',
                backgroundColor: dragActive ? '#f0f8ff' : '#fafafa',
                marginBottom: 24,
                transition: 'all 0.3s ease',
              }}
            >
              <InboxOutlined
                style={{
                  fontSize: 48,
                  color: dragActive ? '#1890ff' : '#d9d9d9',
                  marginBottom: 16,
                }}
              />
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 16 }}>
                  {dragActive
                    ? 'Drop your project folder here'
                    : 'Drag & Drop Project Folder'}
                </Text>
              </div>
              <Text type="secondary">
                Drag and drop a project folder here to import it automatically
              </Text>
            </div>

            {/* Manual Selection */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Text type="secondary">or</Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                icon={<FolderOpenOutlined />}
                onClick={handleOpenExistingProject}
                loading={loading}
              >
                Browse for Project Folder
              </Button>
            </div>

            <Alert
              message="Supported Project Types"
              description="We support React, Vue, Angular, Node.js, Python, and many other project types. The system will automatically detect your project type and configuration."
              type="info"
              showIcon
              style={{ marginTop: 24 }}
            />

            <div className="modal-actions">
              <Button onClick={handleCancel}>Cancel</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ProjectCreateModal;
