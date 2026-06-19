import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Handle, Position, useNodesState, useEdgesState, MarkerType,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import '../styles/NetworkMonitor.css';

/* ── Icons ──────────────────────────────────────────────── */
const IconStop  = () => <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><rect x="4" y="4" width="16" height="16" rx="1.5"/></svg>;
const IconRoute = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><polyline points="17 3 21 7 17 11"/><path d="M3 11V7a4 4 0 0 1 4-4h14"/><polyline points="7 21 3 17 7 13"/><path d="M21 13v4a4 4 0 0 1-4 4H3"/></svg>;
const IconSend  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="11" height="11"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;

/* ── Helpers ──────────────────────────────────────────── */
function ri(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rl(base, v = 15) { return Math.min(99, Math.max(5, base + (Math.random() - 0.5) * v * 2)); }
function genId() { return 'RT-' + Array.from({length:6}, () => 'ABCDEF0123456789'[ri(0,15)]).join(''); }
function nowT() { return new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'}); }

/* ════════════════════════════════════════════════════════
   NODE METADATA
   Exactly matching the screenshot:
   Ghost_41, Gateway, RTX-01..RTX-14, Nova_88
   ════════════════════════════════════════════════════════ */
const NODE_META = {
  user_ghost41: {id:'user_ghost41', type:'user',    name:'Ghost_41', sub:'User Node',        bl:42, tr:'1.2 GB',  lat:'8ms',  up:'99.7%',  cn:3},
  gw_main:      {id:'gw_main',      type:'gateway', name:'Gateway',  sub:'Gateway Node',     bl:78, tr:'48.3 GB', lat:'4ms',  up:'99.99%', cn:12},
  rtx_01:       {id:'rtx_01',  type:'routing', name:'RTX-01', sub:'Routing Node', bl:52, tr:'7.2 GB',  lat:'11ms', up:'99.6%', cn:5},
  rtx_02:       {id:'rtx_02',  type:'routing', name:'RTX-02', sub:'Routing Node', bl:71, tr:'10.2 GB', lat:'15ms', up:'98.9%', cn:7},
  rtx_03:       {id:'rtx_03',  type:'routing', name:'RTX-03', sub:'Routing Node', bl:44, tr:'4.1 GB',  lat:'19ms', up:'97.8%', cn:3},
  rtx_04:       {id:'rtx_04',  type:'routing', name:'RTX-04', sub:'Routing Node', bl:60, tr:'9.5 GB',  lat:'9ms',  up:'99.8%', cn:6},
  rtx_05:       {id:'rtx_05',  type:'routing', name:'RTX-05', sub:'Routing Node', bl:33, tr:'3.8 GB',  lat:'18ms', up:'97.6%', cn:3},
  rtx_06:       {id:'rtx_06',  type:'routing', name:'RTX-06', sub:'Routing Node', bl:57, tr:'6.7 GB',  lat:'13ms', up:'99.2%', cn:5},
  rtx_07:       {id:'rtx_07',  type:'routing', name:'RTX-07', sub:'Routing Node', bl:65, tr:'8.4 GB',  lat:'12ms', up:'99.4%', cn:6},
  rtx_08:       {id:'rtx_08',  type:'routing', name:'RTX-08', sub:'Routing Node', bl:28, tr:'2.9 GB',  lat:'22ms', up:'96.5%', cn:2},
  rtx_09:       {id:'rtx_09',  type:'routing', name:'RTX-09', sub:'Routing Node', bl:48, tr:'5.5 GB',  lat:'11ms', up:'99.1%', cn:4},
  rtx_10:       {id:'rtx_10',  type:'routing', name:'RTX-10', sub:'Routing Node', bl:68, tr:'7.8 GB',  lat:'16ms', up:'98.4%', cn:6},
  rtx_11:       {id:'rtx_11',  type:'routing', name:'RTX-11', sub:'Routing Node', bl:55, tr:'6.1 GB',  lat:'9ms',  up:'99.8%', cn:5},
  rtx_12:       {id:'rtx_12',  type:'routing', name:'RTX-12', sub:'Routing Node', bl:50, tr:'5.0 GB',  lat:'14ms', up:'99.0%', cn:4},
  rtx_13:       {id:'rtx_13',  type:'routing', name:'RTX-13', sub:'Routing Node', bl:39, tr:'3.2 GB',  lat:'20ms', up:'97.2%', cn:3},
  rtx_14:       {id:'rtx_14',  type:'routing', name:'RTX-14', sub:'Routing Node', bl:62, tr:'8.9 GB',  lat:'10ms', up:'99.7%', cn:7},
  rtx_15:       {id:'rtx_15',  type:'routing', name:'RTX-15', sub:'Routing Node', bl:46, tr:'4.7 GB',  lat:'17ms', up:'98.3%', cn:4},
  dest_nova88:  {id:'dest_nova88', type:'dest', name:'Nova_88', sub:'Destination Node', bl:38, tr:'2.1 GB', lat:'6ms', up:'99.5%', cn:2},
};

const ALL_IDS   = Object.keys(NODE_META);
const RTX_IDS   = ALL_IDS.filter(id => id.startsWith('rtx_'));

/* ════════════════════════════════════════════════════════
   POSITIONS — 5 columns, equally spaced vertical nodes
   Measured from screenshot proportions:
   Col gap ~200px, row gap ~115px
   Canvas: ~1100×700 logical units
   Ghost_41 & Gateway sit on the horizontal midline (y≈310)
   Columns 2-4 fan out symmetrically above and below midline
   Nova_88 sits on midline right
   ════════════════════════════════════════════════════════ */
const CY = 310; // vertical midline

// Col 2: 5 nodes, step=115, centred on CY → tops at CY-230,CY-115,CY,CY+115,CY+230
const C2X = 400, C3X = 590, C4X = 780;
const STEP = 115;

const POS = {
  user_ghost41: {x:  55, y: CY},
  gw_main:      {x: 215, y: CY},

  // Col 2 — RTX-01..05, 5 nodes equally spaced
  rtx_01: {x: C2X, y: CY - STEP*2},
  rtx_02: {x: C2X, y: CY - STEP},
  rtx_03: {x: C2X, y: CY},
  rtx_04: {x: C2X, y: CY + STEP},
  rtx_05: {x: C2X, y: CY + STEP*2},

  // Col 3 — RTX-06..10, 5 nodes equally spaced
  rtx_06: {x: C3X, y: CY - STEP*2},
  rtx_07: {x: C3X, y: CY - STEP},
  rtx_08: {x: C3X, y: CY},
  rtx_09: {x: C3X, y: CY + STEP},
  rtx_10: {x: C3X, y: CY + STEP*2},

  // Col 4 — RTX-11..15, 5 nodes equally spaced (centred on CY)
  rtx_11: {x: C4X, y: CY - STEP*2},
  rtx_12: {x: C4X, y: CY - STEP},
  rtx_13: {x: C4X, y: CY},
  rtx_14: {x: C4X, y: CY + STEP},
  rtx_15: {x: C4X, y: CY + STEP*2},

  dest_nova88: {x: 975, y: CY},
};

/* ════════════════════════════════════════════════════════
   ACTIVE ROUTE — matches the right panel in screenshot:
   Ghost_41 → Gateway → RTX-08 → RTX-09 → RTX-14 → RTX-01 → RTX-03 → Nova_88
   (the panel list shows those 8 nodes in that order)
   ════════════════════════════════════════════════════════ */
const DEFAULT_PATH = [
  'user_ghost41', 'gw_main',
  'rtx_08', 'rtx_09', 'rtx_14',
  'rtx_01', 'rtx_03',
  'dest_nova88',
];

/* ── Route builder (random, picks from RTX pool) ───────── */
function buildRoute() {
  const picks = [...RTX_IDS].sort(() => Math.random() - 0.5).slice(0, ri(4, 7));
  const path  = ['user_ghost41', 'gw_main', ...picks, 'dest_nova88'];
  const lat   = picks.length * ri(8, 18);
  return {
    id: genId(), path, totalLatency: lat, hops: picks.length,
    timestamp: nowT(),
    successRate: `${(97 + Math.random()*2.9).toFixed(1)}%`,
    connections: ri(28, 64), packetsSent: ri(120, 650),
    routeLifetime: `${ri(30, 120)}s`,
  };
}

/* ── Graph builder ─────────────────────────────────────── */
function buildGraph(route) {
  const activePath = route ? route.path : DEFAULT_PATH;
  const activeSet  = new Set(activePath);

  const nodes = Object.values(NODE_META).map(m => ({
    id: m.id, type: m.type,
    position: POS[m.id] ?? {x: 500, y: CY},
    data: { ...m, load: rl(m.bl), active: activeSet.has(m.id) },
  }));

  // Background mesh — all adjacent col pairs get faint edges between all nodes
  const bgPairs = [];
  const cols = [
    ['user_ghost41'],
    ['gw_main'],
    ['rtx_01','rtx_02','rtx_03','rtx_04','rtx_05'],
    ['rtx_06','rtx_07','rtx_08','rtx_09','rtx_10'],
    ['rtx_11','rtx_12','rtx_13','rtx_14','rtx_15'],
    ['dest_nova88'],
  ];
  for (let c = 0; c < cols.length - 1; c++) {
    for (const src of cols[c]) {
      for (const tgt of cols[c + 1]) {
        bgPairs.push([src, tgt]);
      }
    }
  }

  const activeEdgeSet = new Set(
    activePath.slice(0,-1).map((s,i) => `${s}__${activePath[i+1]}`)
  );

  const bgEdges = bgPairs
    .filter(([s,t]) => !activeEdgeSet.has(`${s}__${t}`))
    .map(([s,t], i) => ({
      id: `bg-${i}`, source: s, target: t,
      type: 'bgEdge', zIndex: 1,
    }));

  const routeEdges = activePath.slice(0, -1).map((src, i) => ({
    id: `e${i}`, source: src, target: activePath[i + 1],
    type: 'activeEdge', zIndex: 20,
    markerEnd: {type: MarkerType.ArrowClosed, color: '#22d3ee', width: 11, height: 11},
  }));

  return {nodes, edges: [...bgEdges, ...routeEdges]};
}

/* ════════════════════════════════════════════════════════
   EDGES
   bgEdge    — faint dark mesh (inactive topology)
   activeEdge — glowing bezier + travelling light streak
   ════════════════════════════════════════════════════════ */
function BgEdge({sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition}) {
  const [d] = getBezierPath({sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition});
  return <path d={d} fill="none" stroke="rgba(20,40,120,0.12)" strokeWidth={1} strokeLinecap="round"/>;
}

function ActiveEdge({sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd}) {
  const [d] = getBezierPath({sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition});
  return (
    <g style={{overflow:'visible'}}>
      {/* Subtle glow underlayer — keep it thin, not a neon tube */}
      <path d={d} fill="none" stroke="rgba(34,211,238,0.08)" strokeWidth={6} strokeLinecap="round"/>
      {/* Dotted scanning path — dots flow Ghost_41 → Nova_88 */}
      <path d={d} fill="none"
        stroke="#22d3ee"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeDasharray="4 6"
        markerEnd={markerEnd}
        style={{
          animation: 'nm-dot-flow 2.2s linear infinite',
          filter: 'drop-shadow(0 0 2px rgba(34,211,238,0.7))',
        }}
      />
    </g>
  );
}

/* ════════════════════════════════════════════════════════
   CUSTOM NODE CARD
   ════════════════════════════════════════════════════════ */
function NodeCard({data, variant}) {
  const load      = data.load ?? data.bl ?? 50;
  const isGateway = variant === 'gw';
  const amber     = isGateway || (data.id === 'rtx_14' && data.active);

  const accent =
    variant === 'user' ? '#22d3ee' :
    variant === 'gw'   ? '#f59e0b' :
    variant === 'dest' ? '#34d399' :
    (data.active && !amber) ? '#22d3ee' : '#8b5cf6';

  const dimmed      = !data.active && variant === 'rtx';
  const statusColor = amber ? '#f59e0b' : '#34d399';
  const statusText  = amber ? 'HIGH LOAD' : 'ONLINE';

  /* ── User (Ghost_41) — send icon, cyan sub, pulse badge ── */
  if (variant === 'user') {
    return (
      <div
        className="nmc nmc-user nmc-on"
        style={{
          borderColor: '#22d3ee',
          boxShadow: '0 0 0 1.5px rgba(34,211,238,0.47), 0 0 20px rgba(34,211,238,0.27), 0 2px 12px rgba(0,0,0,0.7)',
        }}
      >
        <Handle type="target" position={Position.Left}   id="l"/>
        <Handle type="target" position={Position.Top}    id="t"/>
        <Handle type="source" position={Position.Right}  id="r"/>
        <Handle type="source" position={Position.Bottom} id="b"/>

        {/* Active sender pulse badge — top-right corner */}
        <span className="nmc-sender-badge"/>

        <div className="nmc-icon" style={{borderColor:'#22d3ee', boxShadow:'0 0 8px rgba(34,211,238,0.4)'}}>
          {/* Send / arrow-up-right icon */}
          <svg viewBox="0 0 20 20" fill="none" stroke="#22d3ee" strokeWidth="1.6" width="12" height="12" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="16" x2="16" y2="4"/>
            <polyline points="8 4 16 4 16 12"/>
          </svg>
        </div>

        <div className="nmc-name">{data.name}</div>
        <div className="nmc-sub" style={{color:'rgba(34,211,238,0.65)'}}>{data.sub}</div>
        <div className="nmc-bar"><div className="nmc-bar-fill" style={{width:`${load}%`, background:'#22d3ee'}}/></div>
        <div className="nmc-status">
          <span className="nmc-dot" style={{background:'#34d399', boxShadow:'0 0 4px #34d399'}}/>
          <span style={{color:'#34d399'}}>ONLINE</span>
        </div>
      </div>
    );
  }

  /* ── Dest (Nova_88) — inbox icon, green sub, pulse ring ── */
  if (variant === 'dest') {
    return (
      <div
        className="nmc nmc-dest nmc-on nmc-dest-pulse"
        style={{
          borderColor: '#34d399',
          borderWidth: '2px',
          boxShadow: '0 0 0 1.5px rgba(52,211,153,0.47), 0 0 20px rgba(52,211,153,0.27), 0 2px 12px rgba(0,0,0,0.7)',
        }}
      >
        <Handle type="target" position={Position.Left}   id="l"/>
        <Handle type="target" position={Position.Top}    id="t"/>
        <Handle type="source" position={Position.Right}  id="r"/>
        <Handle type="source" position={Position.Bottom} id="b"/>

        <div className="nmc-icon" style={{borderColor:'#34d399', boxShadow:'0 0 8px rgba(52,211,153,0.4)'}}>
          {/* Inbox / arrow-down-left icon */}
          <svg viewBox="0 0 20 20" fill="none" stroke="#34d399" strokeWidth="1.6" width="12" height="12" strokeLinecap="round" strokeLinejoin="round">
            <line x1="16" y1="4" x2="4" y2="16"/>
            <polyline points="12 16 4 16 4 8"/>
          </svg>
        </div>

        <div className="nmc-name">{data.name}</div>
        <div className="nmc-sub" style={{color:'rgba(52,211,153,0.65)'}}>{data.sub}</div>
        <div className="nmc-bar"><div className="nmc-bar-fill" style={{width:`${load}%`, background:'#34d399'}}/></div>
        <div className="nmc-status">
          <span className="nmc-dot" style={{background:'#34d399', boxShadow:'0 0 4px #34d399'}}/>
          <span style={{color:'#34d399'}}>ONLINE</span>
        </div>
      </div>
    );
  }

  /* ── Gateway + Routing nodes (unchanged) ─────────────── */
  return (
    <div
      className={`nmc nmc-${variant}${data.active ? ' nmc-on' : ''}${dimmed ? ' nmc-dim' : ''}`}
      style={data.active ? {
        borderColor: accent,
        boxShadow: `0 0 0 1.5px ${accent}77, 0 0 20px ${accent}44, 0 0 40px ${accent}18, 0 2px 12px rgba(0,0,0,0.7)`,
      } : {}}
    >
      <Handle type="target" position={Position.Left}   id="l"/>
      <Handle type="target" position={Position.Top}    id="t"/>
      <Handle type="source" position={Position.Right}  id="r"/>
      <Handle type="source" position={Position.Bottom} id="b"/>

      <div className="nmc-icon" style={{
        borderColor: accent,
        boxShadow: data.active ? `0 0 8px ${accent}66` : 'none',
      }}>
        <svg viewBox="0 0 20 20" fill="none" stroke={accent} strokeWidth="1.4" width="12" height="12">
          <circle cx="10" cy="10" r="6"/>
        </svg>
      </div>

      <div className="nmc-name">{data.name}</div>
      <div className="nmc-sub">{data.sub}</div>
      <div className="nmc-bar"><div className="nmc-bar-fill" style={{width:`${load}%`, background:accent}}/></div>
      <div className="nmc-status">
        <span className="nmc-dot" style={{background:statusColor, boxShadow:`0 0 4px ${statusColor}`}}/>
        <span style={{color:statusColor}}>{statusText}</span>
      </div>
    </div>
  );
}

function UserNode({data})    { return <NodeCard data={data} variant="user"/>; }
function GatewayNode({data}) { return <NodeCard data={data} variant="gw"/>; }
function RoutingNode({data}) { return <NodeCard data={data} variant="rtx"/>; }
function DestNode({data})    { return <NodeCard data={data} variant="dest"/>; }

const NODE_TYPES = {user: UserNode, gateway: GatewayNode, routing: RoutingNode, dest: DestNode};
const EDGE_TYPES = {bgEdge: BgEdge, activeEdge: ActiveEdge};

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */
export default function NetworkMonitor() {
  const [simRunning,   setSimRunning]   = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [nodeLoads,    setNodeLoads]    = useState({});
  const [drawerNode,   setDrawerNode]   = useState(null);
  const [stats, setStats] = useState({
    routeId:'—', totalHops:0, estLatency:'—',
    successRate:'—', connections:'—', packetsSent:0, routeLifetime:'—',
  });

  const {nodes:iN, edges:iE} = useMemo(() => buildGraph(null), []);
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(iN);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(iE);

  const syncGraph = useCallback((route, loads) => {
    const {nodes, edges} = buildGraph(route);
    setRfNodes(nodes.map(n => ({...n, data:{...n.data, load: loads[n.id] ?? n.data.load}})));
    setRfEdges(edges);
  }, [setRfNodes, setRfEdges]);

  const generateRoute = useCallback(() => {
    const route = buildRoute();
    const loads = {};
    ALL_IDS.forEach(id => { loads[id] = rl(NODE_META[id].bl); });
    setCurrentRoute(route);
    setNodeLoads(loads);
    setStats({
      routeId: route.id, totalHops: route.hops,
      estLatency: `${route.totalLatency}ms`,
      successRate: route.successRate, connections: route.connections,
      packetsSent: route.packetsSent, routeLifetime: route.routeLifetime,
    });
    syncGraph(route, loads);
  }, [syncGraph]);

  const stopSim = useCallback(() => {
    setSimRunning(false);
    setCurrentRoute(null);
    const loads = {};
    ALL_IDS.forEach(id => { loads[id] = rl(NODE_META[id].bl); });
    setNodeLoads(loads);
    syncGraph(null, loads);
    setStats({routeId:'—', totalHops:0, estLatency:'—', successRate:'—', connections:'—', packetsSent:0, routeLifetime:'—'});
  }, [syncGraph]);

  useEffect(() => {
    if (!simRunning) return;
    const iv = setInterval(() => {
      const loads = {};
      ALL_IDS.forEach(id => { loads[id] = rl(NODE_META[id].bl); });
      setNodeLoads(loads);
      setRfNodes(prev => prev.map(n => ({...n, data:{...n.data, load: loads[n.id] ?? n.data.load}})));
      setStats(p => ({...p, packetsSent: (p.packetsSent || 0) + ri(1, 8)}));
    }, 1800);
    return () => clearInterval(iv);
  }, [simRunning, setRfNodes]);

  const onNodeClick = useCallback((_, node) => {
    const m = NODE_META[node.id];
    if (m) setDrawerNode({meta: m, load: nodeLoads[node.id] ?? m.bl});
  }, [nodeLoads]);

  // right-panel route list — default path when no route generated yet
  const displayPath = currentRoute ? currentRoute.path : DEFAULT_PATH;
  const routeNodes  = displayPath.map(id => NODE_META[id]).filter(Boolean);

  // right-panel stats for default route
  const displayStats = currentRoute ? stats : {
    routeId: 'RT-3AB983', totalHops: 6, estLatency: '73ms',
    successRate: '97%', connections: 51, packetsSent: 328, routeLifetime: '59s',
  };

  return (
    <div className="nm-page">
      <Sidebar/>
      <div className="nm-main">

        {/* Header */}
        <div className="nm-header">
          <div className="nm-header-left">
            <span className="nm-title">Network Monitor</span>
            <span className={`nm-badge${simRunning ? ' nm-badge-active' : ''}`}>
              <span className="nm-badge-dot"/>
              {simRunning ? 'SIMULATION ACTIVE' : 'SIMULATION ACTIVE'}
            </span>
          </div>
          <div className="nm-controls">
            {simRunning
              ? <button className="nm-btn nm-stop"  onClick={stopSim}><IconStop/> STOP</button>
              : <button className="nm-btn nm-stop"  onClick={stopSim}><IconStop/> STOP</button>
            }
            <button className="nm-btn nm-new"  onClick={generateRoute}><IconRoute/> NEW ROUTE</button>
            <button className="nm-btn nm-send" onClick={generateRoute}><IconSend/> SEND PACKET</button>
          </div>
        </div>

        {/* Body */}
        <div className="nm-body">

          {/* React Flow canvas */}
          <div className="nm-canvas">
            <ReactFlow
              nodes={rfNodes} edges={rfEdges}
              onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={NODE_TYPES} edgeTypes={EDGE_TYPES}
              fitView fitViewOptions={{padding: 0.10}}
              minZoom={0.25} maxZoom={2.5}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              panOnDrag={false}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              proOptions={{hideAttribution: true}}
            >
              {/* No background — pure dark gradient from CSS */}
            </ReactFlow>
          </div>

          {/* Right panel */}
          <div className="nm-panel">

            {/* Live Metrics */}
            <div className="nm-section">
              <div className="nm-section-head"><span className="nm-bar nm-bar-purple"/>LIVE METRICS</div>
              <div className="nm-grid">
                <div className="nm-card">
                  <div className="nm-card-lbl">ROUTE ID</div>
                  <div className="nm-card-val nm-c-cyan nm-sm">{displayStats.routeId}</div>
                </div>
                <div className="nm-card">
                  <div className="nm-card-lbl">TOTAL HOPS</div>
                  <div className="nm-card-val nm-c-purple">{displayStats.totalHops}</div>
                  <div className="nm-card-hint">relay nodes</div>
                </div>
                <div className="nm-card">
                  <div className="nm-card-lbl">ENCRYPTION</div>
                  <div className="nm-card-val nm-c-cyan nm-sm2">AES-256</div>
                  <div className="nm-card-hint">end-to-end</div>
                </div>
                <div className="nm-card">
                  <div className="nm-card-lbl">EST. LATENCY</div>
                  <div className="nm-card-val nm-c-amber">{displayStats.estLatency}</div>
                </div>
                <div className="nm-card">
                  <div className="nm-card-lbl">SUCCESS RATE</div>
                  <div className="nm-card-val nm-c-dim">{displayStats.successRate}</div>
                </div>
                <div className="nm-card">
                  <div className="nm-card-lbl">CONNECTIONS</div>
                  <div className="nm-card-val nm-c-dim">{displayStats.connections}</div>
                </div>
                <div className="nm-card">
                  <div className="nm-card-lbl">PACKETS SENT</div>
                  <div className="nm-card-val nm-c-cyan">{displayStats.packetsSent}</div>
                </div>
                <div className="nm-card">
                  <div className="nm-card-lbl">ROUTE LIFETIME</div>
                  <div className="nm-card-val nm-c-amber">{displayStats.routeLifetime}</div>
                  <div className="nm-card-nominal">✓ Nominal</div>
                </div>
              </div>
            </div>

            {/* Active Route list */}
            <div className="nm-section">
              <div className="nm-section-head">
                <span className="nm-bar nm-bar-cyan"/>
                ACTIVE ROUTE{currentRoute ? ` — ${currentRoute.timestamp}` : ' — 05:42:31 PM'}
              </div>
              <div className="nm-route-list">
                {routeNodes.map(node => {
                  const c = node.type==='user' ? '#22d3ee' : node.type==='gateway' ? '#f59e0b' : node.type==='dest' ? '#34d399' : '#a78bfa';
                  const l = node.type==='user' ? 'User' : node.type==='gateway' ? 'Gateway' : node.type==='dest' ? 'Destination' : 'Routing';
                  return (
                    <div key={node.id} className="nm-route-row">
                      <span className="nm-route-dot" style={{background:c, boxShadow:`0 0 5px ${c}`}}/>
                      <span className="nm-route-name">{node.name}</span>
                      <span className="nm-route-type">{l}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {drawerNode && (
          <>
            <motion.div className="nm-backdrop"
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={() => setDrawerNode(null)}/>
            <motion.div className="nm-drawer"
              initial={{x:360}} animate={{x:0}} exit={{x:360}}
              transition={{type:'spring', stiffness:320, damping:32}}>
              <div className="nm-drawer-head">
                <div>
                  <div className="nm-drawer-name">{drawerNode.meta.name}</div>
                  <div className="nm-drawer-type">{drawerNode.meta.sub}</div>
                </div>
                <button className="nm-drawer-close" onClick={() => setDrawerNode(null)}>✕</button>
              </div>
              <div className="nm-drawer-body">
                {[['Traffic', drawerNode.meta.tr],['Avg Latency', drawerNode.meta.lat],
                  ['Uptime', drawerNode.meta.up],['Connections', drawerNode.meta.cn]
                ].map(([k,v]) => (
                  <div key={k} className="nm-drawer-row">
                    <span className="nm-drawer-k">{k}</span>
                    <span className="nm-drawer-v">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
