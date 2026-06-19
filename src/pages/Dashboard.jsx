import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import '../styles/Dashboard.css';

/* ════════════════════════════════════════════════════════
   SVG ICONS
   ════════════════════════════════════════════════════════ */
const IconMsg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ color: 'var(--cyan)', width: 16, height: 16 }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconRoute = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ color: 'var(--purple-bright)', width: 16, height: 16 }}>
    <polyline points="16 3 21 8 16 13"/>
    <line x1="8" y1="8" x2="21" y2="8"/>
    <polyline points="8 21 3 16 8 11"/>
    <line x1="16" y1="16" x2="3" y2="16"/>
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ color: 'var(--green-bright)', width: 16, height: 16 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ArrowUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>
  </svg>
);
const ArrowDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <polyline points="19 12 12 19 5 12"/>
  </svg>
);

/* ════════════════════════════════════════════════════════
   STATIC DATA
   ════════════════════════════════════════════════════════ */
const STATS = [
  {
    label: 'Total Messages', value: '2,847',
    Icon: IconMsg,    accent: 'cyan',
    trend: '+12%', trendDir: 'up',   sub: 'vs last week',
  },
  {
    label: 'Active Routes',  value: '14',
    Icon: IconRoute,  accent: 'purple',
    trend: '+3',   trendDir: 'up',   sub: 'since yesterday',
  },
  {
    label: 'Online Nodes',   value: '391',
    Icon: IconUsers,  accent: 'green',
    trend: '-5%',  trendDir: 'down', sub: 'vs last hour',
  },
];

const ROUTES = [
  { id: 'RTX-07', status: 'active',   traffic: 78, hops: 3, latency: '12ms' },
  { id: 'RTX-02', status: 'active',   traffic: 45, hops: 4, latency: '18ms' },
  { id: 'RTX-11', status: 'active',   traffic: 91, hops: 2, latency: '8ms'  },
  { id: 'RTX-05', status: 'idle',     traffic: 12, hops: 5, latency: '34ms' },
  { id: 'RTX-03', status: 'inactive', traffic: 0,  hops: 0, latency: '--'   },
  { id: 'RTX-09', status: 'active',   traffic: 60, hops: 3, latency: '15ms' },
];

const ACTIVITY = [
  { id:1, initials:'AX', color:'#8b5cf6', ring:'rgba(139,92,246,0.5)',
    name:'anon_x47',  action:'sent a message via RTX-07',      time:'2m ago',  tag:'sent'     },
  { id:2, initials:'GH', color:'#22d3ee', ring:'rgba(34,211,238,0.5)',
    name:'ghost_99',  action:'joined the network',              time:'8m ago',  tag:'system'   },
  { id:3, initials:'SK', color:'#0ea5e9', ring:'rgba(14,165,233,0.5)',
    name:'shadow_k',  action:'received a message on RTX-02',   time:'15m ago', tag:'received' },
  { id:4, initials:'NV', color:'#10b981', ring:'rgba(16,185,129,0.5)',
    name:'nova_v',    action:'sent a message via RTX-11',      time:'23m ago', tag:'sent'     },
  { id:5, initials:'SY', color:'#f59e0b', ring:'rgba(245,158,11,0.4)',
    name:'System',    action:'RTX-05 automatically recycled',  time:'1h ago',  tag:'system'   },
];

/* ════════════════════════════════════════════════════════
   ANIMATED NETWORK NODE GRAPHIC
   ════════════════════════════════════════════════════════ */
function NetworkNodes() {
  // Static node positions — no randomness so SSR/hydration safe
  const nodes = [
    { cx: 130, cy: 30,  r: 4, cls: 'net-node',       delay: 0    },
    { cx: 50,  cy: 55,  r: 3, cls: 'net-node cyan',   delay: 0.6  },
    { cx: 145, cy: 75,  r: 3, cls: 'net-node',        delay: 1.1  },
    { cx: 80,  cy: 100, r: 4, cls: 'net-node green',  delay: 0.3  },
    { cx: 20,  cy: 25,  r: 2.5, cls:'net-node cyan',  delay: 0.9  },
    { cx: 110, cy: 110, r: 2.5, cls:'net-node',       delay: 1.5  },
  ];
  const edges = [
    { x1:130, y1:30,  x2:50,  y2:55,  cls:'net-edge'      },
    { x1:50,  y1:55,  x2:80,  y2:100, cls:'net-edge cyan'  },
    { x1:130, y1:30,  x2:145, y2:75,  cls:'net-edge'       },
    { x1:145, y1:75,  x2:80,  y2:100, cls:'net-edge cyan'  },
    { x1:20,  y1:25,  x2:50,  y2:55,  cls:'net-edge'       },
    { x1:80,  y1:100, x2:110, y2:110, cls:'net-edge cyan'  },
    { x1:110, y1:110, x2:145, y2:75,  cls:'net-edge'       },
  ];

  return (
    <div className="welcome-network" aria-hidden="true">
      <svg className="network-svg" viewBox="0 0 165 125">
        {/* Edges */}
        {edges.map((e, i) => (
          <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            className={e.cls}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
        {/* Pulse rings */}
        {nodes.map((n, i) => (
          <circle key={`ring-${i}`} cx={n.cx} cy={n.cy} r={n.r}
            className={`net-pulse ${n.cls.includes('cyan') ? 'cyan' : n.cls.includes('green') ? 'green' : ''}`}
            style={{ animationDelay: `${n.delay}s` }}
          />
        ))}
        {/* Node dots */}
        {nodes.map((n, i) => (
          <circle key={`node-${i}`} cx={n.cx} cy={n.cy} r={n.r}
            className={n.cls}
          />
        ))}
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════ */
const cardV = {
  hidden:  { opacity: 0, y: 22 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.42, ease: 'easeOut' },
  }),
};

function StatCard({ label, value, Icon, accent, trend, trendDir, sub }, i) {
  return (
    <motion.div
      className={`stat-card accent-${accent}`}
      custom={i}
      variants={cardV}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
    >
      <div className="stat-card-header">
        <span className="stat-label">{label}</span>
        <div className={`stat-icon-badge ${accent}`}>
          <Icon />
        </div>
      </div>

      <motion.div
        className="stat-value"
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.28 + i * 0.07, duration: 0.44, ease: [0.34,1.56,0.64,1] }}
      >
        {value}
      </motion.div>

      <div className="stat-footer">
        <span className={`stat-trend ${trendDir}`}>
          {trendDir === 'up' ? <ArrowUp /> : <ArrowDown />}
          {trend}
        </span>
        <span className="stat-sub">{sub}</span>
      </div>
    </motion.div>
  );
}

function RouteCard({ id, status, traffic, hops, latency }, i) {
  return (
    <motion.div
      className="route-card"
      custom={i} variants={cardV}
      initial="hidden" animate="visible"
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
    >
      <div className="route-id">{id}</div>
      <div className="route-status-row">
        <span className={`route-badge ${status}`}>{status}</span>
        <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-muted)' }}>
          {latency}
        </span>
      </div>
      <div className="route-traffic-label">Traffic Load</div>
      <div className="route-traffic-bar">
        <motion.div
          className="route-traffic-fill"
          initial={{ width: 0 }}
          animate={{ width: `${traffic}%` }}
          transition={{ delay: 0.3 + i * 0.05, duration: 0.75, ease: 'easeOut' }}
        />
      </div>
      <div className="route-hops">{hops > 0 ? `${hops} hops` : 'Inactive'}</div>
    </motion.div>
  );
}

/* Tag label text */
const TAG_LABELS = { sent: 'Sent', received: 'Recv', system: 'Sys' };

function ActivityItem({ initials, color, ring, name, action, time, tag }, i) {
  return (
    <motion.div
      className="activity-item"
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 + i * 0.07, duration: 0.32 }}
    >
      {/* Avatar with glowing ring */}
      <div className="activity-avatar-wrap">
        <div
          className="activity-avatar"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <div
          className="activity-avatar-ring"
          style={{ borderColor: ring, boxShadow: `0 0 8px ${ring}` }}
        />
      </div>

      <div className="activity-body">
        <strong>{name}</strong>
        <span>{action}</span>
      </div>

      <span className="activity-time">{time}</span>

      <span className={`activity-tag ${tag}`}>
        {TAG_LABELS[tag] ?? tag}
      </span>
    </motion.div>
  );
}

/* ── Live clock ───────────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="header-time">{time}</span>;
}

/* ════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════ */
function Dashboard() {
  const activeRoutes = ROUTES.filter((r) => r.status === 'active').length;

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-main">
        {/* ── Header ──────────────────────────────── */}
        <motion.header
          className="dashboard-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>Command Center</h1>
          <div className="header-right">
            <LiveClock />
            <div className="header-badge">
              <span className="badge-dot" />
              All Systems Nominal
            </div>
          </div>
        </motion.header>

        <div className="dashboard-content">

          {/* ── Welcome banner ──────────────────────── */}
          <motion.div
            className="welcome-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: 'easeOut' }}
          >
            <div className="welcome-text">
              <h2>Welcome back, username //</h2>
              <p>
                {activeRoutes} active routes operating within normal parameters.
                <br />
                Network integrity:{' '}
                <span className="highlight">100%</span>
                {' '}— all nodes reachable.
              </p>
            </div>
            <NetworkNodes />
          </motion.div>

          {/* ── Stat cards ──────────────────────────── */}
          <div className="stats-grid">
            {STATS.map((s, i) => StatCard(s, i))}
          </div>

          {/* ── Route visualization ──────────────────── */}
          <section>
            <h3 className="section-heading cyan-accent">Active Routes</h3>
            <div className="routes-grid">
              {ROUTES.map((r, i) => RouteCard(r, i))}
            </div>
          </section>

          {/* ── Recent activity ──────────────────────── */}
          <section>
            <h3 className="section-heading purple-accent">Recent Activity</h3>
            <div className="activity-list">
              {ACTIVITY.map((a, i) => ActivityItem(a, i))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
