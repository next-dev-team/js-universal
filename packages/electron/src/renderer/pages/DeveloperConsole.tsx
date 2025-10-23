import { useState, useEffect, useRef } from 'react'
import { 
  Card, 
  Typography, 
  Input, 
  Button, 
  Select, 
  Space,
  Table,
  Tag,
  Modal,
  Tabs,
  Alert,
  Switch,
  Tooltip,
  Progress,
  Statistic,
  Row,
  Col
} from 'antd'
import { 
  CodeOutlined,
  PlayCircleOutlined,
  ClearOutlined,
  DownloadOutlined,
  BugOutlined,
  MonitorOutlined,
  ApiOutlined,
  DatabaseOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select
const { TabPane } = Tabs

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  source: string
  message: string
  data?: any
}

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  status: 'good' | 'warning' | 'error'
}

export default function DeveloperConsole() {
  const { 
    plugins,
    runningPlugins,
    settings,
    loading
  } = useAppStore()

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [logLevel, setLogLevel] = useState<string>('all')
  const [logSource, setLogSource] = useState<string>('all')
  const [jsCode, setJsCode] = useState('')
  const [jsResult, setJsResult] = useState('')
  const [activeTab, setActiveTab] = useState('logs')
  const [autoScroll, setAutoScroll] = useState(true)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize with some sample logs
    const sampleLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        level: 'info',
        source: 'main',
        message: 'Application started successfully'
      },
      {
        id: '2',
        timestamp: new Date().toISOString(),
        level: 'info',
        source: 'plugin-manager',
        message: `Loaded ${plugins.length} plugins`
      },
      {
        id: '3',
        timestamp: new Date().toISOString(),
        level: 'debug',
        source: 'database',
        message: 'Database connection established'
      }
    ]
    setLogs(sampleLogs)

    // Initialize performance metrics
    const metrics: PerformanceMetric[] = [
      { name: 'Memory Usage', value: 45.2, unit: 'MB', status: 'good' },
      { name: 'CPU Usage', value: 12.5, unit: '%', status: 'good' },
      { name: 'Plugin Load Time', value: 234, unit: 'ms', status: 'good' },
      { name: 'Database Queries', value: 15, unit: '/min', status: 'good' }
    ]
    setPerformanceMetrics(metrics)

    // Set up log listener (in real app, this would listen to actual logs)
    const interval = setInterval(() => {
      if (runningPlugins.length > 0) {
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          level: Math.random() > 0.8 ? 'warn' : 'info',
          source: runningPlugins[Math.floor(Math.random() * runningPlugins.length)],
          message: `Plugin activity detected`
        }
        setLogs(prev => [...prev, newLog].slice(-100)) // Keep last 100 logs
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [plugins.length, runningPlugins])

  useEffect(() => {
    // Filter logs based on level and source
    let filtered = logs

    if (logLevel !== 'all') {
      filtered = filtered.filter(log => log.level === logLevel)
    }

    if (logSource !== 'all') {
      filtered = filtered.filter(log => log.source === logSource)
    }

    setFilteredLogs(filtered)
  }, [logs, logLevel, logSource])

  useEffect(() => {
    // Auto scroll to bottom
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredLogs, autoScroll])

  const executeJavaScript = () => {
    try {
      // In a real implementation, this would be executed in a sandboxed environment
      const result = eval(jsCode)
      setJsResult(JSON.stringify(result, null, 2))
      
      // Add log entry
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        level: 'info',
        source: 'console',
        message: 'JavaScript executed',
        data: { code: jsCode, result }
      }
      setLogs(prev => [...prev, newLog])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setJsResult(`Error: ${errorMessage}`)
      
      // Add error log
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        level: 'error',
        source: 'console',
        message: 'JavaScript execution failed',
        data: { code: jsCode, error: errorMessage }
      }
      setLogs(prev => [...prev, newLog])
    }
  }

  const clearLogs = () => {
    setLogs([])
    setFilteredLogs([])
  }

  const exportLogs = () => {
    const logsData = {
      exportDate: new Date().toISOString(),
      logs: logs,
      filters: { level: logLevel, source: logSource }
    }
    
    const dataStr = JSON.stringify(logsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `electron-app-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'red'
      case 'warn': return 'orange'
      case 'info': return 'blue'
      case 'debug': return 'gray'
      default: return 'default'
    }
  }

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'good': return '#52c41a'
      case 'warning': return '#faad14'
      case 'error': return '#f5222d'
      default: return '#1890ff'
    }
  }

  const logSources = Array.from(new Set(logs.map(log => log.source)))

  const logColumns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => new Date(timestamp).toLocaleTimeString()
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => (
        <Tag color={getLogLevelColor(level)}>{level.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (source: string) => (
        <Tag color="blue">{source}</Tag>
      )
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title level={2}>Developer Console</Title>
        <Text type="secondary">
          Debug, monitor, and test your plugin ecosystem.
        </Text>
      </div>

      {/* Performance Metrics */}
      <Card title={<Space><MonitorOutlined />Performance Metrics</Space>}>
        <Row gutter={[16, 16]}>
          {performanceMetrics.map((metric, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card size="small">
                <Statistic
                  title={metric.name}
                  value={metric.value}
                  suffix={metric.unit}
                  valueStyle={{ color: getMetricColor(metric.status) }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Main Console */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Logs Tab */}
          <TabPane tab={<Space><BugOutlined />Logs</Space>} key="logs">
            <div className="space-y-4">
              {/* Log Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <Select
                  value={logLevel}
                  onChange={setLogLevel}
                  style={{ width: 120 }}
                >
                  <Option value="all">All Levels</Option>
                  <Option value="error">Error</Option>
                  <Option value="warn">Warning</Option>
                  <Option value="info">Info</Option>
                  <Option value="debug">Debug</Option>
                </Select>

                <Select
                  value={logSource}
                  onChange={setLogSource}
                  style={{ width: 150 }}
                >
                  <Option value="all">All Sources</Option>
                  {logSources.map(source => (
                    <Option key={source} value={source}>{source}</Option>
                  ))}
                </Select>

                <Space>
                  <Tooltip title="Auto Scroll">
                    <Switch
                      checked={autoScroll}
                      onChange={setAutoScroll}
                      checkedChildren="Auto"
                      unCheckedChildren="Manual"
                    />
                  </Tooltip>

                  <Button
                    icon={<ClearOutlined />}
                    onClick={clearLogs}
                  >
                    Clear
                  </Button>

                  <Button
                    icon={<DownloadOutlined />}
                    onClick={exportLogs}
                  >
                    Export
                  </Button>

                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => window.location.reload()}
                  >
                    Refresh
                  </Button>
                </Space>
              </div>

              {/* Log Table */}
              <div style={{ height: '400px', overflow: 'auto' }}>
                <Table
                  columns={logColumns}
                  dataSource={filteredLogs}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  scroll={{ y: 350 }}
                />
                <div ref={logsEndRef} />
              </div>
            </div>
          </TabPane>

          {/* JavaScript Console Tab */}
          <TabPane tab={<Space><CodeOutlined />JavaScript Console</Space>} key="console">
            <div className="space-y-4">
              <Alert
                message="JavaScript Console"
                description="Execute JavaScript code in the application context. Use with caution in production."
                type="warning"
                showIcon
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Text strong>Input:</Text>
                  <TextArea
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    placeholder="Enter JavaScript code here..."
                    rows={10}
                    className="mt-2"
                  />
                  <div className="mt-2">
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={executeJavaScript}
                      disabled={!jsCode.trim()}
                    >
                      Execute
                    </Button>
                  </div>
                </div>

                <div>
                  <Text strong>Output:</Text>
                  <TextArea
                    value={jsResult}
                    readOnly
                    placeholder="Execution result will appear here..."
                    rows={10}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </TabPane>

          {/* API Inspector Tab */}
          <TabPane tab={<Space><ApiOutlined />API Inspector</Space>} key="api">
            <div className="space-y-4">
              <Alert
                message="API Inspector"
                description="Monitor and inspect API calls between plugins and the main application."
                type="info"
                showIcon
              />

              <Card title="Recent API Calls" size="small">
                <Table
                  columns={[
                    { title: 'Time', dataIndex: 'time', key: 'time', width: 100 },
                    { title: 'Method', dataIndex: 'method', key: 'method', width: 80 },
                    { title: 'Endpoint', dataIndex: 'endpoint', key: 'endpoint' },
                    { title: 'Status', dataIndex: 'status', key: 'status', width: 80 },
                    { title: 'Duration', dataIndex: 'duration', key: 'duration', width: 100 }
                  ]}
                  dataSource={[
                    { key: '1', time: '14:30:25', method: 'GET', endpoint: '/api/plugins', status: '200', duration: '45ms' },
                    { key: '2', time: '14:30:20', method: 'POST', endpoint: '/api/plugins/install', status: '201', duration: '1.2s' },
                    { key: '3', time: '14:30:15', method: 'GET', endpoint: '/api/settings', status: '200', duration: '23ms' }
                  ]}
                  size="small"
                  pagination={false}
                />
              </Card>
            </div>
          </TabPane>

          {/* Database Inspector Tab */}
          <TabPane tab={<Space><DatabaseOutlined />Database</Space>} key="database">
            <div className="space-y-4">
              <Alert
                message="Database Inspector"
                description="View and manage database operations and queries."
                type="info"
                showIcon
              />

              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="Database Statistics" size="small">
                    <Space direction="vertical" className="w-full">
                      <div className="flex justify-between">
                        <Text>Total Plugins:</Text>
                        <Text strong>{plugins.length}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text>Running Plugins:</Text>
                        <Text strong>{runningPlugins.length}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text>Database Size:</Text>
                        <Text strong>2.4 MB</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text>Last Backup:</Text>
                        <Text strong>2 hours ago</Text>
                      </div>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="Recent Queries" size="small">
                    <div className="space-y-2">
                      <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                        SELECT * FROM plugins WHERE isEnabled = true
                      </div>
                      <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                        UPDATE user_plugins SET lastUsedAt = NOW()
                      </div>
                      <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                        INSERT INTO plugin_ratings VALUES (...)
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}