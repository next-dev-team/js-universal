import { useState, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Input, 
  Select, 
  Button, 
  Avatar, 
  Tag, 
  Typography, 
  Space,
  Empty,
  Spin,
  Modal,
  Rate,
  Divider,
  message
} from 'antd'
import { 
  SearchOutlined,
  DownloadOutlined,
  StarOutlined,
  AppstoreOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  FilterOutlined
} from '@ant-design/icons'
import { useAppStore } from '@/store/useAppStore'
import { Plugin } from '../../shared/types'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

export default function Marketplace() {
  const { 
    plugins, 
    installedPlugins, 
    loading,
    loadPlugins,
    installPlugin
  } = useAppStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('popular')
  const [filteredPlugins, setFilteredPlugins] = useState<Plugin[]>([])
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [installing, setInstalling] = useState<string | null>(null)

  useEffect(() => {
    loadPlugins()
  }, [loadPlugins])

  useEffect(() => {
    let filtered = [...plugins]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(plugin => 
        plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(plugin => plugin.category === selectedCategory)
    }

    // Sort plugins
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.downloadCount - a.downloadCount)
        break
      case 'rating':
        filtered.sort((a, b) => b.averageRating - a.averageRating)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    setFilteredPlugins(filtered)
  }, [plugins, searchTerm, selectedCategory, sortBy])

  const categories = Array.from(new Set(plugins.map(p => p.category)))

  const handleInstallPlugin = async (plugin: Plugin) => {
    if (isPluginInstalled(plugin.id)) {
      message.info('Plugin is already installed')
      return
    }

    setInstalling(plugin.id)
    try {
      await installPlugin(plugin.id)
      message.success(`${plugin.name} installed successfully!`)
    } catch (error) {
      console.error('Failed to install plugin:', error)
      message.error(`Failed to install ${plugin.name}`)
    } finally {
      setInstalling(null)
    }
  }

  const isPluginInstalled = (pluginId: string) => {
    return installedPlugins.some(p => p.id === pluginId)
  }

  const showPluginDetails = (plugin: Plugin) => {
    setSelectedPlugin(plugin)
    setDetailModalVisible(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title level={2}>Plugin Marketplace</Title>
        <Text type="secondary">
          Discover and install plugins to extend your super app functionality.
        </Text>
      </div>

      {/* Search and Filters */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search plugins..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: '100%' }}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Categories</Option>
              {categories.map(category => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Sort by"
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
            >
              <Option value="popular">Most Popular</Option>
              <Option value="rating">Highest Rated</Option>
              <Option value="newest">Newest</Option>
              <Option value="name">Name A-Z</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Text type="secondary">
              {filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? 's' : ''} found
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Plugin Grid */}
      {filteredPlugins.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredPlugins.map((plugin) => {
            const isInstalled = isPluginInstalled(plugin.id)
            const isInstalling = installing === plugin.id

            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={plugin.id}>
                <Card
                  hoverable
                  actions={[
                    <Button
                      key="details"
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => showPluginDetails(plugin)}
                    >
                      Details
                    </Button>,
                    <Button
                      key="install"
                      type="primary"
                      icon={isInstalled ? <CheckCircleOutlined /> : <DownloadOutlined />}
                      loading={isInstalling}
                      disabled={isInstalled}
                      onClick={() => handleInstallPlugin(plugin)}
                    >
                      {isInstalled ? 'Installed' : 'Install'}
                    </Button>
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <Avatar 
                        size={48}
                        src={plugin.iconUrl} 
                        icon={<AppstoreOutlined />}
                      />
                    }
                    title={
                      <Space>
                        {plugin.name}
                        {plugin.isVerified && (
                          <Tag color="green" style={{ fontSize: '10px' }}>
                            Verified
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div className="space-y-2">
                        <Text type="secondary" ellipsis>
                          {plugin.description}
                        </Text>
                        <div>
                          <Tag color="blue">{plugin.category}</Tag>
                        </div>
                        <Space>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            <StarOutlined /> {plugin.averageRating.toFixed(1)}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            <DownloadOutlined /> {plugin.downloadCount}
                          </Text>
                        </Space>
                      </div>
                    }
                  />
                </Card>
              </Col>
            )
          })}
        </Row>
      ) : (
        <Card>
          <Empty 
            description="No plugins found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}

      {/* Plugin Detail Modal */}
      <Modal
        title={null}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedPlugin && (
          <div className="space-y-4">
            {/* Plugin Header */}
            <div className="flex items-start space-x-4">
              <Avatar 
                size={64}
                src={selectedPlugin.iconUrl} 
                icon={<AppstoreOutlined />}
              />
              <div className="flex-1">
                <Title level={3} className="mb-1">
                  {selectedPlugin.name}
                  {selectedPlugin.isVerified && (
                    <Tag color="green" className="ml-2">
                      Verified
                    </Tag>
                  )}
                </Title>
                <Text type="secondary">by {selectedPlugin.author}</Text>
                <div className="mt-2">
                  <Space>
                    <Rate disabled value={selectedPlugin.averageRating} />
                    <Text>({selectedPlugin.averageRating.toFixed(1)})</Text>
                    <Divider type="vertical" />
                    <Text><DownloadOutlined /> {selectedPlugin.downloadCount} downloads</Text>
                  </Space>
                </div>
              </div>
              <Button
                type="primary"
                size="large"
                icon={isPluginInstalled(selectedPlugin.id) ? <CheckCircleOutlined /> : <DownloadOutlined />}
                loading={installing === selectedPlugin.id}
                disabled={isPluginInstalled(selectedPlugin.id)}
                onClick={() => handleInstallPlugin(selectedPlugin)}
              >
                {isPluginInstalled(selectedPlugin.id) ? 'Installed' : 'Install Plugin'}
              </Button>
            </div>

            <Divider />

            {/* Plugin Details */}
            <div className="space-y-4">
              <div>
                <Title level={4}>Description</Title>
                <Paragraph>{selectedPlugin.description}</Paragraph>
              </div>

              <div>
                <Title level={4}>Category &amp; Tags</Title>
                <Space wrap>
                  <Tag color="blue">{selectedPlugin.category}</Tag>
                  {selectedPlugin.tags.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </div>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Title level={4}>Version</Title>
                    <Text>{selectedPlugin.version}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Title level={4}>Size</Title>
                    <Text>{(selectedPlugin.size / 1024 / 1024).toFixed(1)} MB</Text>
                  </div>
                </Col>
              </Row>

              <div>
                <Title level={4}>Permissions Required</Title>
                <Space wrap>
                  {selectedPlugin.requiredPermissions.map(permission => (
                    <Tag key={permission} color="orange">
                      {permission}
                    </Tag>
                  ))}
                </Space>
              </div>

              <div>
                <Title level={4}>Release Date</Title>
                <Text>{new Date(selectedPlugin.createdAt).toLocaleDateString()}</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}