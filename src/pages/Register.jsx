import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Register.css';

/* ── SVG icons ────────────────────────────────────────── */
const IconUser = () => (
  <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconLock = () => (
  <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconShield = () => (
  <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

/* ── Validation ───────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(fields) {
  const errors = {};
  if (!fields.username.trim())              errors.username = 'IDENTIFIER_REQUIRED';
  if (!fields.email.trim())                 errors.email    = 'EMAIL_REQUIRED';
  else if (!EMAIL_RE.test(fields.email))    errors.email    = 'INVALID_EMAIL_FORMAT';
  if (!fields.password)                     errors.password = 'AUTH_KEY_REQUIRED';
  else if (fields.password.length < 8)      errors.password = 'MIN_8_CHARACTERS';
  if (!fields.confirm)                      errors.confirm  = 'CONFIRM_REQUIRED';
  else if (fields.confirm !== fields.password) errors.confirm = 'KEYS_DO_NOT_MATCH';
  return errors;
}

/* ── Strength ─────────────────────────────────────────── */
function getStrength(pw) {
  if (!pw || pw.length === 0) return null;
  if (pw.length < 8)          return 'weak';
  if (pw.length < 12)         return 'fair';
  return 'strong';
}
const STRENGTH_META = {
  weak:   { label: 'WEAK',   req: '8+ chars required' },
  fair:   { label: 'FAIR',   req: 'Add symbols or numbers' },
  strong: { label: 'STRONG', req: 'Excellent entropy' },
};

/* ── Step indicator data ──────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Account' },
  { id: 2, label: 'Security' },
  { id: 3, label: 'Confirm' },
];

/* ── Animation variants ───────────────────────────────── */
const cardV = {
  hidden:  { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};
const fieldV = {
  hidden:  { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.22 + i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
};
const errorV = {
  hidden:  { opacity: 0, y: -6, height: 0 },
  visible: { opacity: 1, y: 0,  height: 'auto',
    transition: { duration: 0.22 } },
  exit:    { opacity: 0, y: -4, height: 0,
    transition: { duration: 0.15 } },
};

/* ── Component ────────────────────────────────────────── */
function Register() {
  const navigate = useNavigate();
  const [fields,    setFields]    = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors,    setErrors]    = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  /* Derive visual step from fill state */
  const filledAccount  = fields.username.trim().length > 0 && fields.email.trim().length > 0;
  const filledSecurity = fields.password.length >= 8;
  const filledConfirm  = fields.confirm.length > 0 && fields.confirm === fields.password;

  const activeStep = filledConfirm ? 3 : filledSecurity ? 3 : filledAccount ? 2 : 1;

  function stepState(n) {
    if (n < activeStep)  return 'done';
    if (n === activeStep) return 'active';
    return 'inactive';
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const updated = { ...fields, [name]: value };
    setFields(updated);
    if (submitted) setErrors(validate(updated));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 950));
    setLoading(false);
    navigate('/login');
  }

  const strength = getStrength(fields.password);

  return (
    <div className="register-page">
      {/* Ambient orbs */}
      <div className="register-orb register-orb-1" />
      <div className="register-orb register-orb-2" />
      <div className="register-orb register-orb-3" />
      <div className="register-scanline" />

      <motion.div
        className="register-card"
        variants={cardV}
        initial="hidden"
        animate="visible"
      >
        {/* Bottom-left bracket decorator */}
        <div className="register-corner-bl" />

        {/* Shield icon */}
        <motion.div
          className="register-icon-wrap"
          initial={{ opacity: 0, scale: 0.65 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="register-icon">🛡️</div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="register-heading"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.38 }}
        >
          Create Account
        </motion.h2>
        <motion.p
          className="register-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.35 }}
        >
          Initialize your anonymous identity
        </motion.p>

        {/* ── Step indicator ──────────────────────────── */}
        <motion.div
          className="reg-steps"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.4 }}
          aria-label="Registration progress"
        >
          {STEPS.map((step, i) => (
            <>
              <div key={step.id} className={`reg-step ${stepState(step.id)}`}>
                <motion.div
                  className="reg-step-circle"
                  animate={
                    stepState(step.id) === 'active'
                      ? { boxShadow: ['0 0 10px rgba(34,211,238,0.3)', '0 0 18px rgba(34,211,238,0.6)', '0 0 10px rgba(34,211,238,0.3)'] }
                      : {}
                  }
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                >
                  {stepState(step.id) === 'done' ? '✓' : step.id}
                </motion.div>
                <span className="reg-step-label">{step.label}</span>
              </div>

              {/* Connector between steps */}
              {i < STEPS.length - 1 && (
                <div
                  key={`conn-${i}`}
                  className={`reg-step-connector${
                    stepState(step.id) === 'done' ? ' filled' : ''
                  }`}
                />
              )}
            </>
          ))}
        </motion.div>

        {/* ── Form ──────────────────────────────────── */}
        <form noValidate onSubmit={handleSubmit}>
          <div className="register-field">

            {/* Username */}
            <motion.div
              className="field-group"
              custom={0} variants={fieldV}
              initial="hidden" animate="visible"
            >
              <label className="field-label" htmlFor="reg-username">
                User Identifier
              </label>
              <div className="input-wrap">
                <IconUser />
                <input
                  id="reg-username"
                  className={`register-input${errors.username ? ' invalid' : ''}`}
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  autoComplete="username"
                  value={fields.username}
                  onChange={handleChange}
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'err-username' : undefined}
                />
              </div>
              <AnimatePresence>
                {errors.username && (
                  <motion.span
                    id="err-username" className="field-error" role="alert"
                    variants={errorV} initial="hidden" animate="visible" exit="exit"
                  >
                    {errors.username}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Email */}
            <motion.div
              className="field-group"
              custom={1} variants={fieldV}
              initial="hidden" animate="visible"
            >
              <label className="field-label" htmlFor="reg-email">
                Email Address
              </label>
              <div className="input-wrap">
                <IconMail />
                <input
                  id="reg-email"
                  className={`register-input${errors.email ? ' invalid' : ''}`}
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  value={fields.email}
                  onChange={handleChange}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'err-email' : undefined}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.span
                    id="err-email" className="field-error" role="alert"
                    variants={errorV} initial="hidden" animate="visible" exit="exit"
                  >
                    {errors.email}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password */}
            <motion.div
              className="field-group"
              custom={2} variants={fieldV}
              initial="hidden" animate="visible"
            >
              <label className="field-label" htmlFor="reg-password">
                Auth Key (Password)
              </label>
              <div className="input-wrap">
                <IconLock />
                <input
                  id="reg-password"
                  className={`register-input${errors.password ? ' invalid' : ''}`}
                  type="password"
                  name="password"
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  value={fields.password}
                  onChange={handleChange}
                  aria-invalid={!!errors.password}
                  aria-describedby="pw-strength-label"
                />
              </div>

              {/* Strength bar */}
              <AnimatePresence>
                {strength && (
                  <motion.div
                    className="strength-wrap"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="strength-track" role="progressbar"
                      aria-label="Password strength" aria-valuenow={
                        strength === 'weak' ? 33 : strength === 'fair' ? 66 : 100
                      }
                      aria-valuemin={0} aria-valuemax={100}
                    >
                      <motion.div
                        className={`strength-fill ${strength}`}
                        initial={{ width: 0 }}
                        animate={{ width: strength === 'weak' ? '33%' : strength === 'fair' ? '66%' : '100%' }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      />
                    </div>
                    <div className="strength-meta">
                      <span
                        id="pw-strength-label"
                        className={`strength-label ${strength}`}
                      >
                        {STRENGTH_META[strength].label}
                      </span>
                      <span className="strength-req">
                        {STRENGTH_META[strength].req}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {errors.password && (
                  <motion.span
                    id="err-password" className="field-error" role="alert"
                    variants={errorV} initial="hidden" animate="visible" exit="exit"
                  >
                    {errors.password}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Confirm password */}
            <motion.div
              className="field-group"
              custom={3} variants={fieldV}
              initial="hidden" animate="visible"
            >
              <label className="field-label" htmlFor="reg-confirm">
                Confirm Auth Key
              </label>
              <div className="input-wrap">
                <IconShield />
                <input
                  id="reg-confirm"
                  className={`register-input${errors.confirm ? ' invalid' : ''}`}
                  type="password"
                  name="confirm"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  value={fields.confirm}
                  onChange={handleChange}
                  aria-invalid={!!errors.confirm}
                  aria-describedby={errors.confirm ? 'err-confirm' : undefined}
                />
              </div>
              <AnimatePresence>
                {errors.confirm && (
                  <motion.span
                    id="err-confirm" className="field-error" role="alert"
                    variants={errorV} initial="hidden" animate="visible" exit="exit"
                  >
                    {errors.confirm}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

          </div>

          {/* Submit button */}
          <motion.button
            className="register-btn"
            type="submit"
            disabled={loading}
            custom={4} variants={fieldV}
            initial="hidden" animate="visible"
            whileHover={!loading ? { scale: 1.01 } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
          >
            <span className="register-btn-inner">
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
                    style={{ display: 'inline-block', fontSize: 16 }}
                  >
                    ⟳
                  </motion.span>
                  Initializing...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Create Account
                </>
              )}
            </span>
          </motion.button>
        </form>

        {/* Footer — purple link */}
        <motion.p
          className="register-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.35 }}
        >
          Already have an account?{' '}
          <Link to="/login">Login</Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default Register;
