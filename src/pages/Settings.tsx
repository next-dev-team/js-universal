import { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Switch, 
  Button, 
  Select, 
  Slider, 
  Typography, 
  Space,
  Divider,
  message,
  Row,
  Col,
  Alert,
  Modal,
  List,
  Tag
} from 'antd'
import { 
  SettingOutlined,
  UserOutlined,
  SecurityScanOutlined,
  BellOutlined,
  EyeOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined
} from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'

const { Title, Text } = Typography
const { Option } = Select
const { confirm } = Modal

interface SettingsForm {
  username: string
  email: string
  theme: string
  language: string
  autoLaunch: boolean
  notifications: boolean
  soundEnabled: boolean
  maxPlugins: number
  autoUpdate: boolean
  developerMode: boolean
  logLevel: string
  dataRetention: number
}

export default function Settings() {
  const { 
    currentUser, 
    settings, 
    loading,
    loadSettings,
    updateSettings,
    updateUser
  } = useAppStore()

  const [form] = Form.useForm<SettingsForm>()
  const [saving, setSaving] = useState(false)
  const [resetModalVisible, setResetModalVisible] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    if (currentUser && settings) {
      form.setFieldsValue({
        username: currentUser.username,
        email: currentUser.email || '',
        theme: settings.theme || 'light',
        language: settings.language || 'en',
        autoLaunch: settings.autoLaunch || false,
        notifications: settings.notifications || true,
        soundEnabled: settings.soundEnabled || true,
        maxPlugins: settings.maxPlugins || 10,
        autoUpdate: settings.autoUpdate || true,
        developerMode: settings.developerMode || false,
        logLevel: settings.logLevel || 'info',
        dataRetention: settings.dataRetention || 30
      })
    }
  }, [currentUser, settings, form])

  const handleSave = async (values: SettingsForm) => {
    setSaving(true)
    try {
      // Update user info
      if (currentUser) {
        await updateUser({
          ...currentUser,
          username: values.username,
          email: values.email
        })
      }

      // Update settings
      await updateSettings({
        theme: values.theme,
        language: values.language,
        autoLaunch: values.autoLaunch,
        notifications: values.notifications,
        soundEnabled: values.soundEnabled,
        maxPlugins: values.maxPlugins,
        autoUpdate: values.autoUpdate,
        developerMode: values.developerMode,
        logLevel: values.logLevel,
        dataRetention: values.dataRetention
      })

      message.success('Settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      message.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    confirm({
      title: 'Reset All Settings',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to reset all settings to default values? This action cannot be undone.',
      okText: 'Reset',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Reset to default values
          const defaultSettings = {
            theme: 'light',
            language: 'en',
            autoLaunch: false,
            notifications: true,
            soundEnabled: true,
            maxPlugins: 10,
            autoUpdate: true,
            developerMode: false,
            logLevel: 'info',
            dataRetention: 30
          }
          
          await updateSettings(defaultSettings)
          form.setFieldsValue(defaultSettings)
          message.success('Settings reset to defaults')
        } catch (error) {
          console.error('Failed to reset settings:', error)
          message.error('Failed to reset settings')
        }
      }
    })
  }

  const handleExportSettings = async () => {
    try {
      const settingsData = {
        user: currentUser,
        settings: settings,
        exportDate: new Date().toISOString()
      }
      
      const dataStr = JSON.stringify(settingsData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `electron-app-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      message.success('Settings exported successfully')
    } catch (error) {
      console.error('Failed to export settings:', error)
      message.error('Failed to export settings')
    }
  }

  const handleImportSettings = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)
        
        if (data.settings) {
          await updateSettings(data.settings)
          form.setFieldsValue(data.settings)
          message.success('Settings imported successfully')
        } else {
          message.error('Invalid settings file format')
        }
      } catch (error) {
        console.error('Failed to import settings:', error)
        message.error('Failed to import settings')
      }
    }
    input.click()
  }

  const clearAppData = () => {
    confirm({
      title: 'Clear Application Data',
      icon: <ExclamationCircleOutlined />,
      content: 'This will remove all plugins, settings, and user data. The application will restart. Are you sure?',
      okText: 'Clear Data',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await window.electronAPI.clearAppData()
          message.success('Application data cleared. Restarting...')
        } catch (error) {
          console.error('Failed to clear app data:', error)
          message.error('Failed to clear application data')
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title level={2}>Settings</Title>
        <Text type="secondary">
          Configure your application preferences and account settings.
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="space-y-6"
      >
        {/* User Account */}
        <Card title={<Space><UserOutlined />User Account</Space>}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please enter your username' }]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Please enter a valid email' }]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Appearance */}
        <Card title={<Space><EyeOutlined />Appearance</Space>}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Theme" name="theme">
                <Select>
                  <Option value="light">Light</Option>
                  <Option value="dark">Dark</Option>
                  <Option value="auto">Auto (System)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Language" name="language">
                <Select>
                  <Option value="en">English</Option>
                  <Option value="zh">中文</Option>
                  <Option value="es">Español</Option>
                  <Option value="fr">Français</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Application Behavior */}
        <Card title={<Space><SettingOutlined />Application Behavior</Space>}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Auto Launch" name="autoLaunch" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Text type="secondary" className="block mt-1">
                Start the application when system boots
              </Text>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Auto Update" name="autoUpdate" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Text type="secondary" className="block mt-1">
                Automatically update plugins and application
              </Text>
            </Col>
          </Row>

          <Form.Item label="Maximum Concurrent Plugins" name="maxPlugins">
            <Slider
              min={1}
              max={20}
              marks={{
                1: '1',
                5: '5',
                10: '10',
                15: '15',
                20: '20'
              }}
            />
          </Form.Item>
        </Card>

        {/* Notifications */}
        <Card title={<Space><BellOutlined />Notifications</Space>}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Enable Notifications" name="notifications" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Text type="secondary" className="block mt-1">
                Show system notifications for plugin events
              </Text>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Sound Effects" name="soundEnabled" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Text type="secondary" className="block mt-1">
                Play sounds for notifications and events
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Security & Privacy */}
        <Card title={<Space><SecurityScanOutlined />Security &amp; Privacy</Space>}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Developer Mode" name="developerMode" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Text type="secondary" className="block mt-1">
                Enable advanced debugging and development features
              </Text>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Log Level" name="logLevel">
                <Select>
                  <Option value="error">Error</Option>
                  <Option value="warn">Warning</Option>
                  <Option value="info">Info</Option>
                  <Option value="debug">Debug</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Data Retention (days)" name="dataRetention">
            <Slider
              min={7}
              max={365}
              marks={{
                7: '1 week',
                30: '1 month',
                90: '3 months',
                365: '1 year'
              }}
            />
          </Form.Item>
        </Card>

        {/* Data Management */}
        <Card title={<Space><DatabaseOutlined />Data Management</Space>}>
          <Alert
            message="Data Management"
            description="Manage your application data, including plugins, settings, and user preferences."
            type="info"
            showIcon
            className="mb-4"
          />

          <Space direction="vertical" className="w-full">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExportSettings}
                  block
                >
                  Export Settings
                </Button>
              </Col>
              <Col xs={24} sm={8}>
                <Button
                  icon={<ImportOutlined />}
                  onClick={handleImportSettings}
                  block
                >
                  Import Settings
                </Button>
              </Col>
              <Col xs={24} sm={8}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  block
                >
                  Reset to Defaults
                </Button>
              </Col>
            </Row>

            <Divider />

            <Button
              danger
              icon={<DatabaseOutlined />}
              onClick={clearAppData}
              block
            >
              Clear All Application Data
            </Button>
            <Text type="secondary" className="text-center block">
              This will remove all plugins, settings, and restart the application
            </Text>
          </Space>
        </Card>

        {/* Save Button */}
        <Card>
          <div className="flex justify-end space-x-4">
            <Button onClick={() => form.resetFields()}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              icon={<SettingOutlined />}
            >
              Save Settings
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  )
}