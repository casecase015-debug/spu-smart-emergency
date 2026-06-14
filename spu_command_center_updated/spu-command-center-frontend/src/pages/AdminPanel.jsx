import { Link } from 'react-router-dom';
import { AlertCircle, BarChart3, ChevronRight, Database, MapPin, ShieldCheck, Users } from 'lucide-react';
import './AdminPanel.css';

function AdminPanel() {
  const adminMenus = [
    {
      title: 'Callsign Management',
      description: 'Manage radio callsigns and operators',
      icon: Users,
      link: '/admin/callsigns',
      metric: 'Directory',
    },
    {
      title: 'Event Management',
      description: 'View and manage emergency events',
      icon: AlertCircle,
      link: '/admin/events',
      metric: 'Response',
    },
    {
      title: 'Incident Management',
      description: 'Manage tactical map incidents',
      icon: MapPin,
      link: '/admin/incidents',
      metric: 'Tactical map',
    },
    {
      title: 'System Analytics',
      description: 'View system statistics and reports',
      icon: BarChart3,
      link: '#',
      metric: 'Coming soon',
    },
  ];

  return (
    <div className="admin-panel">
      <section className="admin-hero">
        <div>
          <span className="eyebrow"><ShieldCheck size={16} /> Admin Panel</span>
          <h1>Admin Dashboard</h1>
          <p className="subtitle">Manage command-center data, resources, and configurations.</p>
        </div>
        <div className="admin-health-card">
          <Database size={24} />
          <div>
            <strong>API Console</strong>
            <span>Ready for live data updates</span>
          </div>
        </div>
      </section>

      <div className="admin-menu-grid">
        {adminMenus.map((menu, index) => {
          const Icon = menu.icon;
          return (
            <Link
              key={index}
              to={menu.link}
              className="admin-menu-card"
              onClick={(e) => menu.link === '#' && e.preventDefault()}
            >
              <div className="menu-icon">
                <Icon size={28} />
              </div>
              <span className="menu-metric">{menu.metric}</span>
              <h3>{menu.title}</h3>
              <p>{menu.description}</p>
              <span className="menu-action">
                Open <ChevronRight size={16} />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default AdminPanel;
