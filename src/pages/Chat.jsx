import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import '../styles/Chat.css';

/* ════════════════════════════════════════════════════════
   SVG ICONS
   ════════════════════════════════════════════════════════ */
const IconLock = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconShield = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconAttach = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19
      a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconMore = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/>
    <circle cx="12" cy="19" r="1"/>
  </svg>
);
const IconMsgEmpty = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <line x1="9" y1="10" x2="15" y2="10"/>
    <line x1="9" y1="14" x2="13" y2="14"/>
  </svg>
);

/* ── Route Inspector icons ────────────────────────────── */
const IconRoute = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 3 21 7 17 11"/>
    <path d="M3 11V7a4 4 0 0 1 4-4h14"/>
    <polyline points="7 21 3 17 7 13"/>
    <path d="M21 13v4a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IconClose = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconShieldFill = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconClock = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconNode = () => (
  <svg width="10" height="10" viewBox="0 0 20 20" fill="none"
    stroke="currentColor" strokeWidth="1.6">
    <circle cx="10" cy="10" r="6"/>
  </svg>
);

/* ════════════════════════════════════════════════════════
   ROUTE INSPECTOR — per-message metadata
   ════════════════════════════════════════════════════════ */

/* Deterministic-but-varied route data seeded from msg.id */
const RTX_POOL = ['RTX-01','RTX-02','RTX-03','RTX-04','RTX-05',
                  'RTX-06','RTX-07','RTX-08','RTX-09','RTX-10'];

function getMsgRoute(msg) {
  // Seed from msg.id so the same message always shows the same route
  const seed   = (typeof msg.id === 'number' ? msg.id : 0) + msg.text.length;
  const hops   = 2 + (seed % 4);                          // 2–5 relay hops
  const relays = [];
  for (let i = 0; i < hops; i++) {
    relays.push(RTX_POOL[(seed * (i + 3)) % RTX_POOL.length]);
  }
  const latency = 18 + (seed % 80);                       // 18–97ms
  const route   = ['Ghost_41', 'Gateway', ...relays, 'Nova_88'];
  return { hops, latency, route };
}

/* Node colour by position in route */
function routeNodeColor(index, total) {
  if (index === 0)         return '#22d3ee'; // sender  — cyan
  if (index === total - 1) return '#34d399'; // dest    — green
  if (index === 1)         return '#f59e0b'; // gateway — amber
  return '#a78bfa';                          // relay   — purple
}

/* ── Route Inspector Drawer ───────────────────────────── */
function RouteInspector({ msg, onClose }) {
  const { hops, latency, route } = getMsgRoute(msg);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="ri-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <motion.aside
        className="ri-drawer"
        role="complementary"
        aria-label="Message Route Inspector"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      >
        {/* ── Header ────────────────────────────────── */}
        <div className="ri-header">
          <div className="ri-header-left">
            <span className="ri-header-icon"><IconRoute /></span>
            <div>
              <div className="ri-title">Route Inspector</div>
              <div className="ri-subtitle">Message trace · AES-256</div>
            </div>
          </div>
          <button className="ri-close" onClick={onClose} aria-label="Close inspector">
            <IconClose />
          </button>
        </div>

        {/* ── Message preview ───────────────────────── */}
        <div className="ri-section">
          <div className="ri-section-label">MESSAGE</div>
          <div className="ri-msg-preview">
            <span className="ri-msg-text">"{msg.text}"</span>
            <span className="ri-msg-time">{msg.time}</span>
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────── */}
        <div className="ri-section">
          <div className="ri-section-label">TRANSMISSION DETAILS</div>
          <div className="ri-stats">
            <div className="ri-stat">
              <span className="ri-stat-icon ri-stat-cyan"><IconShieldFill /></span>
              <div>
                <div className="ri-stat-val">AES-256</div>
                <div className="ri-stat-lbl">Encryption</div>
              </div>
            </div>
            <div className="ri-stat">
              <span className="ri-stat-icon ri-stat-purple"><IconRoute /></span>
              <div>
                <div className="ri-stat-val">{hops}</div>
                <div className="ri-stat-lbl">Hop Count</div>
              </div>
            </div>
            <div className="ri-stat">
              <span className="ri-stat-icon ri-stat-amber"><IconClock /></span>
              <div>
                <div className="ri-stat-val">{latency}ms</div>
                <div className="ri-stat-lbl">Latency</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Route chain ───────────────────────────── */}
        <div className="ri-section ri-section-grow">
          <div className="ri-section-label">ACTIVE ROUTE</div>
          <div className="ri-route-chain">
            {route.map((node, i) => {
              const color = routeNodeColor(i, route.length);
              const isLast = i === route.length - 1;
              return (
                <div key={i} className="ri-route-step">
                  {/* Node card */}
                  <div className="ri-node" style={{ borderColor: `${color}55` }}>
                    <span className="ri-node-dot" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                    <span className="ri-node-name" style={{ color }}>{node}</span>
                    <span className="ri-node-type">
                      {i === 0 ? 'Sender' : i === route.length - 1 ? 'Receiver' : i === 1 ? 'Gateway' : 'Relay'}
                    </span>
                  </div>
                  {/* Connector arrow */}
                  {!isLast && (
                    <div className="ri-connector">
                      <div className="ri-connector-line" />
                      <div className="ri-connector-arrow">↓</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer badge ──────────────────────────── */}
        <div className="ri-footer">
          <span className="ri-footer-dot" />
          <span>End-to-end encrypted · {route.length - 2} relay node{hops !== 1 ? 's' : ''}</span>
        </div>
      </motion.aside>
    </>
  );
}

/* ════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════ */
const CONTACTS = [
  { id:1, name:'anon_x47',  initials:'AX', color:'#8b5cf6', status:'online',  lastMsg:'Hey, are you there?',  time:'2m',        unread:3 },
  { id:2, name:'ghost_99',  initials:'GH', color:'#22d3ee', status:'online',  lastMsg:'Message received ✓',   time:'14m',       unread:0 },
  { id:3, name:'shadow_k',  initials:'SK', color:'#0ea5e9', status:'away',    lastMsg:'Will be back soon',     time:'1h',        unread:1 },
  { id:4, name:'nova_v',    initials:'NV', color:'#10b981', status:'online',  lastMsg:'Got it, thanks!',       time:'3h',        unread:0 },
  { id:5, name:'cipher_z',  initials:'CZ', color:'#f59e0b', status:'offline', lastMsg:'See you around',        time:'Yesterday', unread:0 },
  { id:6, name:'wraith_00', initials:'W0', color:'#f43f5e', status:'offline', lastMsg:'Route #3 is down',      time:'Yesterday', unread:0 },
];

const HISTORY = {
  1: [
    { id:1,  from:'them', text:'Hey, are you there?',                         time:'10:42', date:'Today' },
    { id:2,  from:'me',   text:"Yeah, what's up?",                            time:'10:43', date:'Today' },
    { id:3,  from:'them', text:'Just checking in. The new route is working.',  time:'10:43', date:'Today' },
    { id:4,  from:'me',   text:'Nice, which one?',                             time:'10:44', date:'Today' },
    { id:5,  from:'them', text:'RTX-07 — latency dropped by 40ms.',            time:'10:44', date:'Today' },
    { id:6,  from:'them', text:'Cut the hops from 5 to 3.',                    time:'10:44', date:'Today' },
    { id:7,  from:'me',   text:"That's solid. Keep an eye on it tonight.",     time:'10:46', date:'Today' },
    { id:8,  from:'them', text:'Will do 👍',                                   time:'10:48', date:'Today' },
  ],
  2: [
    { id:1, from:'me',   text:'Hey ghost, any updates?',  time:'09:10', date:'Today' },
    { id:2, from:'them', text:'All clear on my end.',     time:'09:12', date:'Today' },
    { id:3, from:'them', text:'Message received ✓',       time:'09:14', date:'Today' },
  ],
  3: [
    { id:1, from:'them', text:'Going offline for a bit.', time:'Yesterday', date:'Yesterday' },
    { id:2, from:'them', text:'Will be back soon',        time:'Yesterday', date:'Yesterday' },
  ],
  4: [
    { id:1, from:'me',   text:'Did the patch go through?', time:'07:30', date:'Today' },
    { id:2, from:'them', text:'Got it, thanks!',            time:'07:35', date:'Today' },
  ],
  5: [{ id:1, from:'them', text:'See you around',            time:'Yesterday', date:'Yesterday' }],
  6: [
    { id:1, from:'them', text:'Route #3 is down',            time:'Yesterday', date:'Yesterday' },
    { id:2, from:'me',   text:'On it, switching to #4.',     time:'Yesterday', date:'Yesterday' },
  ],
};

let nextId = 100;
function uid() { return nextId++; }

const REPLIES = ['Got it 👍', 'Understood.', 'Roger that.', 'Noted.', 'On it.', '✓', 'Copy that.', '10-4.'];

/* ════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════ */

/* ── Contact list item ────────────────────────────────── */
function ContactItem({ contact, active, onClick }) {
  return (
    <motion.div
      className={`contact-item${active ? ' active' : ''}`}
      onClick={onClick}
      role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Open conversation with ${contact.name}`}
      whileHover={{ x: 3 }}
      transition={{ duration: 0.14 }}
    >
      <div className="contact-avatar-wrap">
        <div className="contact-avatar" style={{ backgroundColor: contact.color }}>
          {contact.initials}
        </div>
        <span className={`contact-status-dot ${contact.status}`} />
      </div>

      <div className="contact-info">
        <div className="contact-info-row">
          <span className="contact-name">{contact.name}</span>
          <span className="contact-time">{contact.time}</span>
        </div>
        <div className="contact-preview-row">
          <span className="contact-preview">{contact.lastMsg}</span>
          {contact.unread > 0 && (
            <motion.span
              className="contact-unread"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              {contact.unread}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Message bubble row ───────────────────────────────── */
function MessageRow({ msg, prevMsg, contact, onInspect }) {
  const isOut       = msg.from === 'me';
  const consecutive = prevMsg && prevMsg.from === msg.from;

  return (
    <motion.div
      className={`message-row ${isOut ? 'outgoing' : 'incoming'}${consecutive ? ' consecutive' : ''}`}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Avatar — incoming only */}
      {!isOut && (
        <div
          className="message-row-avatar"
          style={{ backgroundColor: contact.color }}
        >
          {contact.initials}
        </div>
      )}

      <div className="message-group">
        <div
          className="message-bubble"
          onClick={() => onInspect(msg)}
          title="Click to inspect route"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onInspect(msg)}
          aria-label="Inspect message route"
        >
          {msg.text}
          <span className="message-bubble-hint">🔍</span>
        </div>

        {/* Meta: time + lock + read receipt */}
        <div className="message-meta">
          <span className="message-time">{msg.time}</span>
          <span className="message-lock" aria-label="End-to-end encrypted">
            <IconLock />
          </span>
          {isOut && <span className="message-status">✓✓</span>}
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════ */
function Chat() {
  const [activeId, setActiveId]  = useState(1);
  const [search,   setSearch]    = useState('');
  const [messages, setMessages]  = useState(HISTORY);
  const [draft,    setDraft]     = useState('');
  const [isTyping, setIsTyping]  = useState(false);
  const [inspectedMsg, setInspectedMsg] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const typingTimer    = useRef(null);

  const openInspector  = useCallback((msg) => setInspectedMsg(msg), []);
  const closeInspector = useCallback(() => setInspectedMsg(null), []);

  const activeContact = CONTACTS.find((c) => c.id === activeId);
  const thread        = messages[activeId] ?? [];
  const filtered      = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  /* Scroll to bottom on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread, isTyping]);

  /* Simulated reply */
  function simulateReply(cid) {
    clearTimeout(typingTimer.current);
    setIsTyping(true);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      const text = REPLIES[Math.floor(Math.random() * REPLIES.length)];
      const now  = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => ({
        ...prev,
        [cid]: [...(prev[cid] ?? []), { id: uid(), from: 'them', text, time: now, date: 'Today' }],
      }));
    }, 1400 + Math.random() * 1000);
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), { id: uid(), from: 'me', text, time: now, date: 'Today' }],
    }));
    setDraft('');
    inputRef.current?.focus();
    simulateReply(activeId);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function selectContact(id) {
    setActiveId(id);
    setIsTyping(false);
    clearTimeout(typingTimer.current);
  }

  /* Build message list with date dividers */
  function renderThread() {
    const items = [];
    let lastDate = null;
    thread.forEach((msg, i) => {
      if (msg.date !== lastDate) {
        lastDate = msg.date;
        items.push(
          <div key={`divider-${msg.id}`} className="date-divider">
            <span>{msg.date}</span>
          </div>
        );
      }
      items.push(
        <MessageRow
          key={msg.id}
          msg={msg}
          prevMsg={thread[i - 1] ?? null}
          contact={activeContact}
          onInspect={openInspector}
        />
      );
    });
    return items;
  }

  const statusLabel = {
    online:  '● Online',
    away:    '◐ Away',
    offline: '○ Offline',
  }[activeContact.status];

  return (
    <div className="chat-page">
      <Sidebar />

      {/* ════════════════════════════════════════════
          CONTACTS PANEL
          ════════════════════════════════════════════ */}
      <aside className="contacts-panel">
        <div className="contacts-header">
          <div className="contacts-header-top">
            <span className="contacts-title">Secure Channels</span>
            <button className="contacts-new-btn" aria-label="New conversation">＋</button>
          </div>
          <div className="contacts-search-wrap">
            <span className="contacts-search-icon">
              <IconSearch />
            </span>
            <input
              className="contacts-search"
              type="text"
              placeholder="Search nodes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search contacts"
            />
          </div>
        </div>

        <div className="contacts-list" role="list">
          <AnimatePresence>
            {filtered.map((c) => (
              <ContactItem
                key={c.id}
                contact={c}
                active={c.id === activeId}
                onClick={() => selectContact(c.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </aside>

      {/* ════════════════════════════════════════════
          CHAT AREA
          ════════════════════════════════════════════ */}
      <section
        className="chat-area"
        aria-label={`Conversation with ${activeContact.name}`}
      >
        {/* ── Header ──────────────────────────────── */}
        <header className="chat-header">
          <div className="chat-header-left">
            {/* Avatar with glowing status ring */}
            <div className="chat-header-avatar-wrap">
              <div
                className="chat-header-avatar"
                style={{ backgroundColor: activeContact.color }}
              >
                {activeContact.initials}
              </div>
              <div className={`chat-header-avatar-ring ${activeContact.status}`} />
            </div>

            <div>
              <div className="chat-header-name-row">
                <span className="chat-header-name">{activeContact.name}</span>
                {/* Encrypted badge with shield icon */}
                <span className="encrypted-badge">
                  <IconShield size={9} />
                  Encrypted
                </span>
              </div>
              <span className={`chat-header-status ${activeContact.status}`}>
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="chat-header-actions">
            <button className="chat-action-btn" aria-label="Search in conversation">
              <IconSearch />
            </button>
            <button className="chat-action-btn" aria-label="More options">
              <IconMore />
            </button>
          </div>
        </header>

        {/* ── Encryption info bar ──────────────────── */}
        <div className="chat-route-bar">
          <span className="route-bar-dot" />
          <span>E2E Encrypted via</span>
          <span className="route-bar-tag">RTX-07</span>
          <span>·</span>
          <span>3 Hops</span>
          <span>·</span>
          <span style={{ color: 'var(--green-bright)' }}>AES-256</span>
        </div>

        {/* ── Message history ───────────────────────── */}
        <div className="chat-messages" role="log" aria-live="polite">
          {thread.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">
                <IconMsgEmpty />
              </div>
              <p>// No messages. Initiate secure channel.</p>
            </div>
          ) : (
            renderThread()
          )}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                className="message-row incoming"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.22 }}
              >
                <div
                  className="message-row-avatar"
                  style={{ backgroundColor: activeContact.color }}
                >
                  {activeContact.initials}
                </div>
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* ── Floating input bar ────────────────────── */}
        <div className="chat-input-outer">
          <div className="chat-input-bar">
            {/* Attach button */}
            <motion.button
              className="input-attach-btn"
              aria-label="Attach file"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
            >
              <IconAttach />
            </motion.button>

            {/* Text area */}
            <div className="chat-input-wrap">
              <textarea
                ref={inputRef}
                className="chat-input"
                rows={1}
                placeholder={`Encrypted message to ${activeContact.name}…`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Message input"
              />
            </div>

            {/* Send button — gradient circle */}
            <motion.button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!draft.trim()}
              aria-label="Send encrypted message"
              whileHover={draft.trim() ? { scale: 1.08 } : {}}
              whileTap={draft.trim() ? { scale: 0.90 } : {}}
            >
              <IconSend />
            </motion.button>
          </div>
        </div>
      </section>
      {/* ════════════════════════════════════════════
          MESSAGE ROUTE INSPECTOR DRAWER
          ════════════════════════════════════════════ */}
      <AnimatePresence>
        {inspectedMsg && (
          <RouteInspector
            msg={inspectedMsg}
            onClose={closeInspector}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Chat;
