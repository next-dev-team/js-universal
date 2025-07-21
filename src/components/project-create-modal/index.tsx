import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,

  Button,
  Steps,
  Card,
  Row,
  Col,
  Space,
  Typography,
  message,
  Divider,
  Tooltip,

  Switch
} from 'antd';
import {
  FolderOutlined,
  GlobalOutlined,
  MobileOutlined,
  DesktopOutlined,
  ApiOutlined,
  BookOutlined,
  FileOutlined,
  FolderOpenOutlined,

  GithubOutlined,
  InfoCircleOutlined,

} from '@ant-design/icons';
import { useProjectStore } from '../../store/modules/use-project-store';
import type { ProjectCreateModalProps, ProjectTemplate, ProjectCreateRequest } from '../../types/project';
import './styles.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;


const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  open,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  
  const {
    createProject,
    templates,
    loadTemplates
  } = useProjectStore();

  useEffect(() => {
    if (open) {
      loadTemplates();
      setCurrentStep(0);
      setSelectedTemplate(null);
      form.resetFields();
    }
  }, [open, loadTemplates, form]);

  const projectTypes = [
    {
      key: 'web',
      label: 'Web Application',
      icon: <GlobalOutlined />,
      description: 'Frontend, fullstack, or web-based applications'
    },
    {
      key: 'mobile',
      label: 'Mobile Application',
      icon: <MobileOutlined />,
      description: 'iOS, Android, or cross-platform mobile apps'
    },
    {
      key: 'desktop',
      label: 'Desktop Application',
      icon: <DesktopOutlined />,
      description: 'Native desktop applications for Windows, macOS, or Linux'
    },
    {
      key: 'api',
      label: 'API/Backend',
      icon: <ApiOutlined />,
      description: 'REST APIs, GraphQL, microservices, or backend services'
    },
    {
      key: 'library',
      label: 'Library/Package',
      icon: <BookOutlined />,
      description: 'Reusable libraries, packages, or components'
    },
    {
      key: 'other',
      label: 'Other',
      icon: <FileOutlined />,
      description: 'Scripts, tools, or other types of projects'
    }
  ];

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        // Validate basic info
        await form.validateFields(['name', 'description', 'type']);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        // Validate project setup
        await form.validateFields(['path']);
        setCurrentStep(2);
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
        path: values.path,
        template: selectedTemplate?.id,
        gitRepository: values.gitRepository,
        initializeGit: values.initializeGit || false,
        installDependencies: values.installDependencies || false
      };

      await createProject(projectData);
      message.success('Project created successfully!');
      
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
    if (onCancel) {
      onCancel();
    }
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    form.setFieldsValue({
      type: template.type,
      description: template.description
    });
  };

  const handleBrowseFolder = () => {
    // TODO: Implement folder browser using Electron dialog
    message.info('Folder browser will be implemented with Electron dialog');
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
                { min: 2, message: 'Project name must be at least 2 characters' },
                { max: 50, message: 'Project name must be less than 50 characters' },
                { pattern: /^[a-zA-Z0-9-_\s]+$/, message: 'Only letters, numbers, hyphens, underscores and spaces allowed' }
              ]}
            >
              <Input placeholder="Enter project name" size="large" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: 'Please enter project description' },
                { max: 200, message: 'Description must be less than 200 characters' }
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
              rules={[{ required: true, message: 'Please select project type' }]}
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
                { required: true, message: 'Please specify project location' }
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
                        <div className="template-icon"><FileOutlined /></div>
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
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <Title level={4}>Additional Options</Title>
            
            <Form.Item
              name="gitRepository"
              label="Git Repository (Optional)"
            >
              <Input 
                placeholder="https://github.com/username/repo.git"
                prefix={<GithubOutlined />}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="initializeGit"
              valuePropName="checked"
            >
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

            <Form.Item
              name="installDependencies"
              valuePropName="checked"
            >
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
            
            <div className="project-summary">
              <Title level={5}>Project Summary</Title>
              <div className="summary-item">
                <Text strong>Name:</Text> <Text>{form.getFieldValue('name')}</Text>
              </div>
              <div className="summary-item">
                <Text strong>Type:</Text> <Text>{form.getFieldValue('type')}</Text>
              </div>
              <div className="summary-item">
                <Text strong>Location:</Text> <Text>{form.getFieldValue('path')}</Text>
              </div>
              {selectedTemplate && (
                <div className="summary-item">
                  <Text strong>Template:</Text> <Text>{selectedTemplate.name}</Text>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    {
      title: 'Project Info',
      description: 'Basic information'
    },
    {
      title: 'Setup',
      description: 'Location and template'
    },
    {
      title: 'Options',
      description: 'Additional settings'
    }
  ];

  return (
    <Modal
      title="Create New Project"
      open={open}
      onCancel={handleCancel}
      width={800}
      className="project-create-modal"
      footer={null}
      destroyOnClose
    >
      <div className="modal-content">
        <Steps current={currentStep} className="create-steps">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
            />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          className="create-form"
        >
          {renderStepContent()}
        </Form>

        <div className="modal-actions">
          <Space>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>
                Previous
              </Button>
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
              >
                Create Project
              </Button>
            )}
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectCreateModal;