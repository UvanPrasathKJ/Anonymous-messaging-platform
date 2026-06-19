import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Login.css';

/* ── Validation ───────────────────────────────────────── */
function validate(fields) {
  const errors = {};
  if (!fields.username.trim()) errors.username = 'IDENTIFIER_REQUIRED';
  if (!fields.password)        errors.password = 'AUTH_KEY_REQUIRED';
  return errors;
}

/* ── Animation variants ───────────────────────────────── */
const cardVariants = {
  hidden:  { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
const fieldVariants = {
  hidden:  { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.25 + i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
};
const errorVariants = {
  hidden:  { opacity: 0, y: -6, height: 0 },
  visible: { opacity: 1, y: 0,  height: 'auto',
    transition: { duration: 0.2 } },
  exit:    { opacity: 0, y: -4, height: 0,
    transition: { duration: 0.15 } },
};

/* ── Component ────────────────────────────────────────── */
function Login() {
  const navigate = useNavigate();
  const [fields,    setFields]    = useState({ username: '', password: '' });
  const [errors,    setErrors]    = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

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
    await new Promise((r) => setTimeout(r, 800)); // simulate auth
    setLoading(false);
    navigate('/dashboard');
  }

  return (
    <div className="login-page">
      {/* Animated ambient orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />
      <div className="login-scanline" />

      <motion.div
        className="login-card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Encrypted connection badge */}
        <motion.div
          className="login-enc-badge"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <span className="enc-dot" />
          Encrypted Connection
        </motion.div>

        {/* Lock icon */}
        <motion.div
          className="login-icon-wrap"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="login-icon">🔐</div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="login-heading"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.35 }}
        >
          Welcome Back<span className="cursor" />
        </motion.h2>
        <motion.p
          className="login-subheading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34, duration: 0.35 }}
        >
          Secure Anonymous Network
        </motion.p>

        {/* Form */}
        <form noValidate onSubmit={handleSubmit}>
          <div className="login-field">

            {/* Username */}
            <motion.div
              className="field-group"
              custom={0} variants={fieldVariants}
              initial="hidden" animate="visible"
            >
              <label className="field-label" htmlFor="username">
                User Identifier
              </label>
              <div className="input-wrap">
                <span className="input-icon">👤</span>
                <input
                  id="username"
                  className={`login-input${errors.username ? ' invalid' : ''}`}
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  autoComplete="username"
                  value={fields.username}
                  onChange={handleChange}
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                />
              </div>
              <AnimatePresence>
                {errors.username && (
                  <motion.span
                    className="field-error"
                    id="username-error"
                    role="alert"
                    variants={errorVariants}
                    initial="hidden" animate="visible" exit="exit"
                  >
                    {errors.username}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password */}
            <motion.div
              className="field-group"
              custom={1} variants={fieldVariants}
              initial="hidden" animate="visible"
            >
              <label className="field-label" htmlFor="password">
                Auth Key
              </label>
              <div className="input-wrap">
                <span className="input-icon">🔑</span>
                <input
                  id="password"
                  className={`login-input${errors.password ? ' invalid' : ''}`}
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  value={fields.password}
                  onChange={handleChange}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.span
                    className="field-error"
                    id="password-error"
                    role="alert"
                    variants={errorVariants}
                    initial="hidden" animate="visible" exit="exit"
                  >
                    {errors.password}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

          </div>

          {/* Submit */}
          <motion.button
            className="login-btn"
            type="submit"
            disabled={loading}
            custom={2} variants={fieldVariants}
            initial="hidden" animate="visible"
            whileTap={{ scale: 0.97 }}
          >
            <span className="login-btn-text">
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    style={{ display: 'inline-block' }}
                  >
                    ⟳
                  </motion.span>
                  Authenticating...
                </>
              ) : (
                <>🔓 Access Network</>
              )}
            </span>
          </motion.button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>AnonChat v2.0</span>
        </div>

        {/* Footer */}
        <motion.p
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.35 }}
        >
          No account?{' '}
          <Link to="/register">Create Identity</Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default Login;
