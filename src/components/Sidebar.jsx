import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Sidebar.css';

/* ── SVG nav icons ────────────────────────────────────── */
const IconGrid = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconChat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconPower = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>
  </svg>
);
const IconChevron = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const IconNetwork = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"/>
    <circle cx="19" cy="19" r="3"/>
    <circle cx="5"  cy="19" r="3"/>
    <line x1="12" y1="8"  x2="5"  y2="16"/>
    <line x1="12" y1="8"  x2="19" y2="16"/>
    <line x1="5"  y1="19" x2="19" y2="19"/>
  </svg>
);

const NAV_ITEMS = [
  { Icon: IconGrid,    label: 'Dashboard',   to: '/dashboard' },
  { Icon: IconChat,    label: 'Secure Chat', to: '/chat'      },
  { Icon: IconNetwork, label: 'Network',     to: '/network'   },
];

const itemVariants = {
  hidden:  { opacity: 0, x: -18 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.08 + i * 0.08, duration: 0.32, ease: 'easeOut' },
  }),
};

function Sidebar() {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`app-sidebar${collapsed ? ' collapsed' : ''}`}>

      {/* ── Logo ──────────────────────────────────── */}
      <motion.div
        className="app-sidebar-logo"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38 }}
      >
        <div className="app-sidebar-logo-icon">🔐</div>

        <div className="sidebar-brand">
          <span className="app-sidebar-logo-text">AnonChat</span>
          <span className="app-sidebar-logo-tag">v2.0 // secure</span>
        </div>

        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <IconChevron />
        </button>
      </motion.div>

      {/* ── Nav ───────────────────────────────────── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            className="sidebar-section-label"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            Navigation
          </motion.span>
        )}
      </AnimatePresence>

      <nav className="app-sidebar-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ Icon, label, to }, i) => {
          const isActive = pathname === to;
          return (
            <motion.div
              key={to}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <Link
                to={to}
                className={`app-nav-item${isActive ? ' active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                data-tooltip={label}
              >
                {/* Active pill background animated */}
                {isActive && (
                  <motion.span
                    className="nav-active-bg"
                    layoutId="active-pill"
                    style={{
                      position: 'absolute', inset: 0,
                      borderRadius: 11,
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.22), rgba(34,211,238,0.06))',
                      boxShadow: '0 0 0 1px rgba(139,92,246,0.25), 0 4px 16px rgba(139,92,246,0.18)',
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
                  />
                )}
                <span className="app-nav-icon"><Icon /></span>
                <span className="app-nav-label">{label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="app-sidebar-spacer" />

      {/* ── Footer ────────────────────────────────── */}
      <div className="app-sidebar-footer">

        {/* Network status */}
        <div className="sidebar-status">
          <span className="sidebar-status-dot" />
          <span>Network Online</span>
        </div>

        {/* User row */}
        <div className="app-sidebar-user">
          <div className="app-sidebar-avatar">U</div>
          <div className="app-sidebar-user-info">
            <span className="app-sidebar-username">username</span>
            <span className="app-sidebar-role">Member</span>
          </div>
        </div>

        {/* Logout */}
        <motion.button
          className="app-nav-item logout"
          onClick={() => navigate('/login')}
          aria-label="Disconnect"
          data-tooltip="Disconnect"
          whileTap={{ scale: 0.96 }}
        >
          <span className="app-nav-icon"><IconPower /></span>
          <span className="app-nav-label">Disconnect</span>
        </motion.button>
      </div>
    </aside>
  );
}

export default Sidebar;
