import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/store';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

// ── Measure caret X position inside an input using canvas ────────────────────
function getCaretClientX(input: HTMLInputElement): number {
  const sel = input.selectionStart ?? input.value.length;
  const textBefore = input.value.slice(0, sel);
  const style = window.getComputedStyle(input);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const textWidth = ctx.measureText(textBefore).width;
  const rect = input.getBoundingClientRect();
  const paddingLeft = parseFloat(style.paddingLeft);
  return rect.left + paddingLeft + textWidth;
}

// ── Fox mascot ────────────────────────────────────────────────────────────────
const FoxMascot: React.FC<{
  isHiding: boolean;
  isWatching: boolean;
  isPeeking: boolean;
  targetPoint: { x: number; y: number } | null;
}> = ({ isHiding, isWatching, isPeeking, targetPoint }) => {
  const foxRef = useRef<HTMLDivElement>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [head,  setHead]  = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    if (!foxRef.current || !targetPoint) return;
    const rect = foxRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = targetPoint.x - cx;
    const dy = targetPoint.y - cy;
    const dist  = Math.sqrt(dx * dx + dy * dy) || 1;
    const norm  = Math.min(dist / 400, 1);
    const pNorm = Math.min(dist / 300, 1);
    setHead({ rx: -(dy / dist) * 12 * norm, ry: (dx / dist) * 18 * norm });
    setPupil({ x: (dx / dist) * 4 * pNorm,  y: (dy / dist) * 4 * pNorm });
  }, [targetPoint]);

  const headStyle: React.CSSProperties = isHiding
    ? { transform: 'translateX(-50%) rotateX(0deg) rotateY(0deg)' }
    : { transform: `translateX(-50%) rotateX(${head.rx}deg) rotateY(${head.ry}deg)` };

  // Pupils always track — even when paws are up
  const pupilStyle: React.CSSProperties = {
    transform: `translate(calc(-50% + ${pupil.x}px), calc(-50% + ${pupil.y}px))`,
  };

  return (
    <div className="fox-wrap" ref={foxRef}>
      <div className="fox-body">
        <div className={`fox-tail ${isPeeking ? 'fox-tail-wag' : ''}`} />
        <div className="fox-belly" />
        <div className="fox-head" style={headStyle}>
          <div className="fox-ear fox-ear-left"><div className="fox-ear-inner" /></div>
          <div className="fox-ear fox-ear-right"><div className="fox-ear-inner" /></div>
          <div className="fox-face">
            <div className="fox-eye fox-eye-left">
              <div className="fox-pupil" style={pupilStyle} />
              <div className={`fox-eyelid${isHiding ? ' fox-eyelid-closed' : ''}`} />
            </div>
            <div className="fox-eye fox-eye-right">
              <div className="fox-pupil" style={pupilStyle} />
              <div className={`fox-eyelid${isHiding ? ' fox-eyelid-closed' : ''}`} />
            </div>
            <div className="fox-nose" />
            <div className="fox-muzzle">
              <div className={`fox-mouth${isWatching ? ' fox-mouth-smile' : ''}`} />
            </div>
            <div className={`fox-paw fox-paw-left${isHiding  ? ' fox-paw-up' : ''}`} />
            <div className={`fox-paw fox-paw-right${isHiding ? ' fox-paw-up' : ''}`} />
          </div>
        </div>
        <div className="fox-legs">
          <div className="fox-leg" />
          <div className="fox-leg" />
        </div>
      </div>
    </div>
  );
};

// ── Login page ────────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [error,        setError]        = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused,  setPassFocused]  = useState(false);

  // Single source of truth for where the fox looks
  const [targetPoint, setTargetPoint] = useState<{ x: number; y: number } | null>(null);

  const emailRef = useRef<HTMLInputElement | null>(null);
  const passRef  = useRef<HTMLInputElement | null>(null);

  // Mouse pointer tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => setTargetPoint({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Caret tracking — fires on every keystroke / selection change
  const trackCaret = useCallback((input: HTMLInputElement) => {
    const rect = input.getBoundingClientRect();
    const caretX = getCaretClientX(input);
    // Aim at the vertical center of the input
    setTargetPoint({ x: caretX, y: rect.top + rect.height / 2 });
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  // Wire react-hook-form refs + our own ref together
  const emailReg = register('email');
  const passReg  = register('password');

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await dispatch(loginUser({
        email: data.email.toLowerCase().trim(),
        password: data.password,
      }));
      if (loginUser.fulfilled.match(result)) {
        const role = result.payload.user?.role?.toUpperCase();
        if      (role === 'SUPERADMIN')    navigate('/superadmin');
        else if (role === 'TENANT_ADMIN')  navigate('/admin');
        else if (role === 'SALES_MANAGER') navigate('/manager');
        else if (role === 'AGENT')         navigate('/agent');
        else if (role === 'HR')            navigate('/hr');
        else if (role === 'FINANCE')       navigate('/finance');
        else                               navigate('/dashboard');
      } else {
        setError(result.payload as string || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* ── Background ── */}
      <div className="login-bg">
        <div className="bg-gradient" />
        {/* Stars */}
        <div className="stars-layer">
          {[...Array(60)].map((_, i) => (
            <div key={i} className={`star star-${(i % 4) + 1}`} style={{ left: `${(i * 17 + 3) % 100}%`, top: `${(i * 13 + 7) % 65}%`, animationDelay: `${(i * 0.3) % 5}s` }} />
          ))}
        </div>
        {/* Moon */}
        <div className="moon">
          <div className="moon-glow" />
        </div>
        {/* Cityscape SVG */}
        <svg className="cityscape" viewBox="0 0 1440 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bldBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a2744" />
              <stop offset="100%" stopColor="#0d1a33" />
            </linearGradient>
            <linearGradient id="bldFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f1e38" />
              <stop offset="100%" stopColor="#080f1e" />
            </linearGradient>
            <linearGradient id="bldMid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#152035" />
              <stop offset="100%" stopColor="#0a1525" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <g fill="url(#bldBack)">
            <rect x="0"    y="200" width="55"  height="200" rx="2"/>
            <rect x="10"   y="175" width="35"  height="25"  rx="1"/>
            <rect x="65"   y="220" width="70"  height="180" rx="2"/>
            <rect x="145"  y="160" width="45"  height="240" rx="2"/>
            <rect x="152"  y="140" width="30"  height="22"  rx="1"/>
            <rect x="200"  y="210" width="60"  height="190" rx="2"/>
            <rect x="270"  y="175" width="50"  height="225" rx="2"/>
            <rect x="278"  y="155" width="34"  height="22"  rx="1"/>
            <rect x="330"  y="195" width="80"  height="205" rx="2"/>
            <rect x="420"  y="165" width="55"  height="235" rx="2"/>
            <rect x="428"  y="145" width="38"  height="22"  rx="1"/>
            <rect x="485"  y="205" width="65"  height="195" rx="2"/>
            <rect x="560"  y="155" width="48"  height="245" rx="2"/>
            <rect x="567"  y="133" width="32"  height="24"  rx="1"/>
            <rect x="618"  y="185" width="75"  height="215" rx="2"/>
            <rect x="703"  y="170" width="58"  height="230" rx="2"/>
            <rect x="711"  y="148" width="40"  height="24"  rx="1"/>
            <rect x="771"  y="200" width="65"  height="200" rx="2"/>
            <rect x="846"  y="160" width="52"  height="240" rx="2"/>
            <rect x="853"  y="138" width="36"  height="24"  rx="1"/>
            <rect x="908"  y="190" width="72"  height="210" rx="2"/>
            <rect x="990"  y="175" width="55"  height="225" rx="2"/>
            <rect x="998"  y="153" width="38"  height="24"  rx="1"/>
            <rect x="1055" y="205" width="68"  height="195" rx="2"/>
            <rect x="1133" y="165" width="50"  height="235" rx="2"/>
            <rect x="1140" y="143" width="34"  height="24"  rx="1"/>
            <rect x="1193" y="195" width="78"  height="205" rx="2"/>
            <rect x="1281" y="180" width="55"  height="220" rx="2"/>
            <rect x="1289" y="158" width="38"  height="24"  rx="1"/>
            <rect x="1346" y="210" width="65"  height="190" rx="2"/>
            <rect x="1421" y="170" width="19"  height="230" rx="2"/>
          </g>
          <g fill="url(#bldMid)">
            <rect x="0"    y="240" width="42"  height="160" rx="2"/>
            <rect x="52"   y="225" width="58"  height="175" rx="2"/>
            <rect x="120"  y="248" width="46"  height="152" rx="2"/>
            <rect x="176"  y="230" width="72"  height="170" rx="2"/>
            <rect x="258"  y="242" width="50"  height="158" rx="2"/>
            <rect x="318"  y="222" width="64"  height="178" rx="2"/>
            <rect x="392"  y="250" width="44"  height="150" rx="2"/>
            <rect x="446"  y="232" width="76"  height="168" rx="2"/>
            <rect x="532"  y="244" width="52"  height="156" rx="2"/>
            <rect x="594"  y="226" width="68"  height="174" rx="2"/>
            <rect x="672"  y="246" width="46"  height="154" rx="2"/>
            <rect x="728"  y="228" width="72"  height="172" rx="2"/>
            <rect x="810"  y="240" width="54"  height="160" rx="2"/>
            <rect x="874"  y="222" width="66"  height="178" rx="2"/>
            <rect x="950"  y="248" width="44"  height="152" rx="2"/>
            <rect x="1004" y="230" width="78"  height="170" rx="2"/>
            <rect x="1092" y="242" width="52"  height="158" rx="2"/>
            <rect x="1154" y="224" width="66"  height="176" rx="2"/>
            <rect x="1230" y="246" width="46"  height="154" rx="2"/>
            <rect x="1286" y="228" width="74"  height="172" rx="2"/>
            <rect x="1370" y="238" width="70"  height="162" rx="2"/>
          </g>
          <g fill="url(#bldFront)">
            <rect x="0"    y="268" width="38"  height="132" rx="2"/>
            <rect x="48"   y="252" width="54"  height="148" rx="2"/>
            <rect x="112"  y="272" width="42"  height="128" rx="2"/>
            <rect x="164"  y="255" width="68"  height="145" rx="2"/>
            <rect x="242"  y="265" width="48"  height="135" rx="2"/>
            <rect x="300"  y="248" width="62"  height="152" rx="2"/>
            <rect x="372"  y="270" width="40"  height="130" rx="2"/>
            <rect x="422"  y="253" width="74"  height="147" rx="2"/>
            <rect x="506"  y="267" width="50"  height="133" rx="2"/>
            <rect x="566"  y="250" width="66"  height="150" rx="2"/>
            <rect x="642"  y="264" width="44"  height="136" rx="2"/>
            <rect x="696"  y="247" width="70"  height="153" rx="2"/>
            <rect x="776"  y="268" width="52"  height="132" rx="2"/>
            <rect x="838"  y="251" width="64"  height="149" rx="2"/>
            <rect x="912"  y="266" width="42"  height="134" rx="2"/>
            <rect x="964"  y="249" width="76"  height="151" rx="2"/>
            <rect x="1050" y="270" width="50"  height="130" rx="2"/>
            <rect x="1110" y="253" width="64"  height="147" rx="2"/>
            <rect x="1184" y="264" width="44"  height="136" rx="2"/>
            <rect x="1238" y="247" width="72"  height="153" rx="2"/>
            <rect x="1320" y="262" width="48"  height="138" rx="2"/>
            <rect x="1378" y="252" width="62"  height="148" rx="2"/>
          </g>
          <g filter="url(#glow)">
            {[
              [18,210],[18,225],[18,240],[28,210],[28,225],
              [78,230],[78,245],[88,230],[88,245],[98,230],
              [158,170],[158,185],[158,200],[168,170],[168,185],
              [212,220],[212,235],[222,220],[222,235],
              [282,185],[282,200],[292,185],[292,200],[302,185],
              [342,205],[342,220],[352,205],[352,220],[362,205],
              [432,175],[432,190],[442,175],[442,190],[452,175],
              [498,215],[498,230],[508,215],[508,230],
              [572,165],[572,180],[572,195],[582,165],[582,180],
              [630,195],[630,210],[640,195],[640,210],[650,195],
              [715,180],[715,195],[725,180],[725,195],[735,180],
              [783,210],[783,225],[793,210],[793,225],
              [858,170],[858,185],[858,200],[868,170],[868,185],
              [920,200],[920,215],[930,200],[930,215],[940,200],
              [1002,185],[1002,200],[1012,185],[1012,200],[1022,185],
              [1067,215],[1067,230],[1077,215],[1077,230],
              [1145,175],[1145,190],[1145,205],[1155,175],[1155,190],
              [1205,205],[1205,220],[1215,205],[1215,220],[1225,205],
              [1293,190],[1293,205],[1303,190],[1303,205],[1313,190],
              [1358,220],[1358,235],[1368,220],[1368,235],
            ].map(([x, y], i) => (
              <rect key={`w${i}`} x={x} y={y} width="7" height="9" rx="1"
                fill={i % 5 === 0 ? 'rgba(255,200,60,0.9)' : i % 3 === 0 ? 'rgba(255,220,100,0.7)' : 'rgba(255,240,160,0.5)'}
                className={`win win-${(i % 3) + 1}`}
              />
            ))}
          </g>
          <rect x="0" y="340" width="1440" height="60" fill="url(#fogGrad)" opacity="0.6"/>
          <defs>
            <linearGradient id="fogGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a1525" stopOpacity="0"/>
              <stop offset="100%" stopColor="#060d1a" stopOpacity="1"/>
            </linearGradient>
          </defs>
        </svg>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>

      {/* ── Card ── */}
      <div className="login-card-wrap">
        <div className="login-card">

          <FoxMascot
            isHiding={passFocused && !showPassword}
            isWatching={passFocused && showPassword}
            isPeeking={emailFocused && !passFocused}
            targetPoint={targetPoint}
          />

          <div className="login-brand">
            <div className="brand-icon">
              <svg viewBox="0 0 32 32" fill="none">
                <path d="M16 3L2 14h4v15h8v-9h4v9h8V14h4L16 3z" fill="currentColor" />
              </svg>
            </div>
            <span className="brand-name">Realesso</span>
          </div>
          <p className="login-subtitle">Welcome back — sign in to continue</p>

          {error && (
            <div className="login-error">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email */}
            <div className={`field-group${emailFocused ? ' focused' : ''}${errors.email ? ' has-error' : ''}`}>
              <label className="field-label">Email Address</label>
              <div className="field-inner">
                <span className="field-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
                <input
                  type="email"
                  className="field-input"
                  placeholder="you@company.com"
                  autoComplete="email"
                  {...emailReg}
                  ref={(el) => {
                    emailReg.ref(el);
                    emailRef.current = el;
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  onInput={(e) => trackCaret(e.currentTarget)}
                  onKeyUp={(e) => trackCaret(e.currentTarget)}
                  onClick={(e) => trackCaret(e.currentTarget)}
                />
              </div>
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className={`field-group${passFocused ? ' focused' : ''}${errors.password ? ' has-error' : ''}`}>
              <label className="field-label">Password</label>
              <div className="field-inner">
                <span className="field-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="field-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...passReg}
                  ref={(el) => {
                    passReg.ref(el);
                    passRef.current = el;
                  }}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  onInput={(e) => trackCaret(e.currentTarget)}
                  onKeyUp={(e) => trackCaret(e.currentTarget)}
                  onClick={(e) => trackCaret(e.currentTarget)}
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </div>

            <div className="login-meta">
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : (
                <>
                  <span>Sign In</span>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="login-footer">
            Realesso &copy; {new Date().getFullYear()} &mdash; Real Estate Operating System
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
