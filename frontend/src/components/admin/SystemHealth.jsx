import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  Users,
  FileText
} from 'lucide-react';
import Button from '../common/Button';
import Loading from '../common/Loading';

const SystemHealth = () => {
  const [systemData, setSystemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchSystemHealth();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSystemData({
        server: {
          status: 'healthy',
          uptime: '15 days, 3 hours',
          cpu_usage: 45,
          memory_usage: 62,
          disk_usage: 38,
          response_time: 120
        },
        database: {
          status: 'healthy',
          connections: 45,
          max_connections: 100,
          query_time: 15,
          storage_used: 2.4,
          storage_total: 10
        },
        services: [
          { name: 'Web Server', status: 'healthy', port: 3000 },
          { name: 'API Server', status: 'healthy', port: 8000 },
          { name: 'File Storage', status: 'healthy', port: 9000 },
          { name: 'Email Service', status: 'warning', port: 587 },
          { name: 'Backup Service', status: 'healthy', port: null }
        ],
        metrics: {
          active_users: 127,
          total_requests_today: 15420,
          error_rate: 0.2,
          avg_response_time: 150
        },
        alerts: [
          {
            id: 1,
            type: 'warning',
            message: 'Email service connection timeout increased',
            timestamp: new Date(Date.now() - 300000), // 5 minutes ago
            resolved: false
          },
          {
            id: 2,
            type: 'info',
            message: 'Scheduled maintenance completed successfully',
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            resolved: true
          }
        ]
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatUptime = (uptime) => {
    return uptime;
  };

  if (loading && !systemData) {
    return <Loading fullScreen text="Loading system health..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600">Monitor system performance and status</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <Clock className="w-4 h-4 inline mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            onClick={fetchSystemHealth}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Server Status */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Server className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-medium">Server</h3>
            </div>
            {getStatusIcon(systemData?.server.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Uptime:</span>
              <span className="font-medium">{systemData?.server.uptime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Response:</span>
              <span className="font-medium">{systemData?.server.response_time}ms</span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-medium">Database</h3>
            </div>
            {getStatusIcon(systemData?.database.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Connections:</span>
              <span className="font-medium">
                {systemData?.database.connections}/{systemData?.database.max_connections}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Query Time:</span>
              <span className="font-medium">{systemData?.database.query_time}ms</span>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-medium">Active Users</h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">
              {systemData?.metrics.active_users}
            </div>
            <div className="text-sm text-gray-600">Currently online</div>
          </div>
        </div>

        {/* Requests Today */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-orange-600 mr-3" />
              <h3 className="text-lg font-medium">Requests</h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">
              {systemData?.metrics.total_requests_today.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Today</div>
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Server Resources */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium mb-4">Server Resources</h3>
          <div className="space-y-4">
            {/* CPU Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Cpu className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">CPU Usage</span>
                </div>
                <span className="text-sm font-medium">{systemData?.server.cpu_usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemData?.server.cpu_usage}%` }}
                ></div>
              </div>
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <MemoryStick className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium">Memory Usage</span>
                </div>
                <span className="text-sm font-medium">{systemData?.server.memory_usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemData?.server.memory_usage}%` }}
                ></div>
              </div>
            </div>

            {/* Disk Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <HardDrive className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium">Disk Usage</span>
                </div>
                <span className="text-sm font-medium">{systemData?.server.disk_usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemData?.server.disk_usage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Storage */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium mb-4">Database Storage</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {systemData?.database.storage_used} GB
              </div>
              <div className="text-sm text-gray-600">
                of {systemData?.database.storage_total} GB used
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(systemData?.database.storage_used / systemData?.database.storage_total) * 100}%` 
                }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-900">Connections</div>
                <div className="text-gray-600">
                  {systemData?.database.connections}/{systemData?.database.max_connections}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">Avg Query Time</div>
                <div className="text-gray-600">{systemData?.database.query_time}ms</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Services Status</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {systemData?.services.map((service, index) => (
            <div key={index} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(service.status)}
                <div className="ml-3">
                  <div className="font-medium text-gray-900">{service.name}</div>
                  {service.port && (
                    <div className="text-sm text-gray-600">Port: {service.port}</div>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(service.status)}`}>
                {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Recent Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {systemData?.alerts.map((alert) => (
            <div key={alert.id} className="px-6 py-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {alert.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  ) : alert.type === 'error' ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${alert.resolved ? 'text-gray-600' : 'text-gray-900'}`}>
                      {alert.message}
                    </p>
                    {alert.resolved && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;