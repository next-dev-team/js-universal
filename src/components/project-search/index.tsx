import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  FolderOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Dropdown, Input, Select, Space, Tag } from 'antd';
import { useProjectStore } from '../../store/modules/use-project-store';
import type {
  ProjectSearchFilters,
  ProjectSearchProps,
} from '../../types/project';
import './styles.css';

const { Option } = Select;

const ProjectSearch: React.FC<ProjectSearchProps> = ({
  onSearch,
  onFilter,
  onSort,
  className = '',
  showAdvancedFilters = true,
  compact = false,
}) => {
  const { filters, setFilters, clearFilters, getProjectStats } =
    useProjectStore();

  const [localQuery, setLocalQuery] = useState(filters.query || '');
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<ProjectSearchFilters>(filters);

  const stats = getProjectStats();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ query: localQuery });
      onSearch?.(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setFilters, onSearch]);

  // Project type options
  const projectTypeOptions = useMemo(
    () => [
      { label: 'React', value: 'react', color: '#61dafb' },
      { label: 'Vue', value: 'vue', color: '#4fc08d' },
      { label: 'Angular', value: 'angular', color: '#dd0031' },
      { label: 'Node.js', value: 'nodejs', color: '#339933' },
      { label: 'Python', value: 'python', color: '#3776ab' },
      { label: 'Java', value: 'java', color: '#ed8b00' },
      { label: 'C#', value: 'csharp', color: '#239120' },
      { label: 'Go', value: 'go', color: '#00add8' },
      { label: 'Rust', value: 'rust', color: '#000000' },
      { label: 'Other', value: 'other', color: '#666666' },
    ],
    [],
  );

  // Sort options
  const sortOptions = [
    { label: 'Name', value: 'name', icon: <FolderOutlined /> },
    {
      label: 'Last Opened',
      value: 'lastOpened',
      icon: <ClockCircleOutlined />,
    },
    { label: 'Created Date', value: 'createdAt', icon: <CalendarOutlined /> },
    { label: 'Project Type', value: 'type', icon: <FolderOutlined /> },
    { label: 'Favorites', value: 'favorite', icon: <StarOutlined /> },
  ];

  const handleFilterChange = (key: keyof ProjectSearchFilters, value: any) => {
    const newFilters = { ...tempFilters, [key]: value };
    setTempFilters(newFilters);
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    onFilter?.(tempFilters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    const emptyFilters: ProjectSearchFilters = {
      query: '',
      type: undefined,
      status: undefined,
      tags: [],
      isFavorite: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
    };
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
    clearFilters();
    onFilter?.(emptyFilters);
  };

  const handleSortChange = (value: string) => {
    setFilters({ sortBy: value as any });
    // Map sortBy values to SortOption field values
    const fieldMap: Record<
      string,
      'name' | 'lastOpened' | 'createdAt' | 'type' | 'favorite'
    > = {
      name: 'name',
      updatedAt: 'lastOpened',
      createdAt: 'createdAt',
      lastOpenedAt: 'lastOpened',
      size: 'name',
      type: 'type',
      favorite: 'favorite',
    };
    onSort?.({
      field: fieldMap[value] || 'name',
      order: filters.sortOrder || 'asc',
    });
  };

  const toggleSortOrder = () => {
    const newOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters({ sortOrder: newOrder });
    const fieldMap: Record<
      string,
      'name' | 'lastOpened' | 'createdAt' | 'type' | 'favorite'
    > = {
      name: 'name',
      updatedAt: 'lastOpened',
      createdAt: 'createdAt',
      lastOpenedAt: 'lastOpened',
      size: 'name',
      type: 'type',
      favorite: 'favorite',
    };
    onSort?.({
      field: fieldMap[filters.sortBy || 'name'] || 'name',
      order: newOrder,
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.type) count++;
    if (filters.isFavorite) count++;
    if (filters.tags?.length) count++;
    return count;
  };

  const filterDropdownContent = (
    <div className="filter-dropdown">
      <div className="filter-section">
        <h4>Project Types</h4>
        <Checkbox.Group
          value={tempFilters.type ? [tempFilters.type] : []}
          onChange={(values) => handleFilterChange('type', values[0])}
        >
          <div className="checkbox-grid">
            {projectTypeOptions.map((type) => (
              <Checkbox key={type.value} value={type.value}>
                <Tag color={type.color} style={{ margin: 0 }}>
                  {type.label}
                </Tag>
              </Checkbox>
            ))}
          </div>
        </Checkbox.Group>
      </div>

      {showAdvancedFilters && (
        <>
          <div className="filter-section">
            <h4>Favorites</h4>
            <Checkbox
              checked={tempFilters.isFavorite}
              onChange={(e) =>
                handleFilterChange('isFavorite', e.target.checked)
              }
            >
              Show only favorites
            </Checkbox>
          </div>
        </>
      )}

      <div className="filter-actions">
        <Space>
          <Button size="small" onClick={resetFilters}>
            Reset
          </Button>
          <Button type="primary" size="small" onClick={applyFilters}>
            Apply
          </Button>
        </Space>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className={`project-search compact ${className}`}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Search projects..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Dropdown
            overlay={filterDropdownContent}
            trigger={['click']}
            open={showFilters}
            onOpenChange={setShowFilters}
            placement="bottomRight"
          >
            <Button icon={<FilterOutlined />}>
              {getActiveFilterCount() > 0 && (
                <span className="filter-badge">{getActiveFilterCount()}</span>
              )}
            </Button>
          </Dropdown>
        </Space.Compact>
      </div>
    );
  }

  return (
    <div className={`project-search ${className}`}>
      <div className="search-header">
        <div className="search-input-container">
          <Input
            size="large"
            placeholder="Search projects by name, description, or tags..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            prefix={<SearchOutlined />}
            suffix={
              localQuery && (
                <Button
                  type="text"
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={() => setLocalQuery('')}
                />
              )
            }
            allowClear
          />
        </div>

        <Space className="search-controls">
          <Select
            value={filters.sortBy}
            onChange={handleSortChange}
            style={{ width: 140 }}
            placeholder="Sort by"
          >
            {sortOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                <Space>
                  {option.icon}
                  {option.label}
                </Space>
              </Option>
            ))}
          </Select>

          <Button
            icon={
              filters.sortOrder === 'asc' ? (
                <SortAscendingOutlined />
              ) : (
                <SortDescendingOutlined />
              )
            }
            onClick={toggleSortOrder}
            title={`Sort ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          />

          <Dropdown
            overlay={filterDropdownContent}
            trigger={['click']}
            open={showFilters}
            onOpenChange={setShowFilters}
            placement="bottomRight"
          >
            <Button icon={<FilterOutlined />}>
              Filters
              {getActiveFilterCount() > 0 && (
                <span className="filter-badge">{getActiveFilterCount()}</span>
              )}
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="active-filters">
          <Space wrap>
            <span className="filter-label">Active filters:</span>

            {filters.type && (
              <Tag
                closable
                color={
                  projectTypeOptions.find((opt) => opt.value === filters.type)
                    ?.color
                }
                onClose={() => {
                  handleFilterChange('type', undefined);
                  applyFilters();
                }}
              >
                {projectTypeOptions.find((opt) => opt.value === filters.type)
                  ?.label || filters.type}
              </Tag>
            )}

            {filters.isFavorite && (
              <Tag
                closable
                color="gold"
                icon={<StarOutlined />}
                onClose={() => {
                  handleFilterChange('isFavorite', false);
                  applyFilters();
                }}
              >
                Favorites
              </Tag>
            )}

            <Button
              type="link"
              size="small"
              onClick={resetFilters}
              style={{ padding: 0, height: 'auto' }}
            >
              Clear all
            </Button>
          </Space>
        </div>
      )}

      {/* Search Stats */}
      <div className="search-stats">
        <Space>
          <span className="stats-text">
            {stats.totalProjects} projects
            {localQuery && ` • Searching for "${localQuery}"`}
            {getActiveFilterCount() > 0 &&
              ` • ${getActiveFilterCount()} filter${getActiveFilterCount() > 1 ? 's' : ''} active`}
          </span>
        </Space>
      </div>
    </div>
  );
};

export default ProjectSearch;
export type { ProjectSearchProps };
