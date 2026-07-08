import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, configReady, db, googleProvider } from './firebase';
import { catalog, featuredTitle } from './data/catalog';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    badge: 'Fast launch',
    price: '$7',
    cadence: '/month',
    quality: 'HD',
    devices: '2 devices',
    detail: 'A fast entry plan for casual viewing.',
    features: ['Ad-light playback', 'Mobile and TV access', 'Personal watchlist sync'],
  },
  {
    id: 'plus',
    name: 'Plus',
    badge: 'Most popular',
    price: '$14',
    cadence: '/month',
    quality: 'Full HD',
    devices: '4 devices',
    detail: 'The balanced plan for shared accounts and weekend marathons.',
    features: ['Sharper picture quality', 'Shared household profiles', 'Priority release access'],
  },
  {
    id: 'ultra',
    name: 'Ultra',
    badge: 'Cinematic',
    price: '$21',
    cadence: '/month',
    quality: '4K + HDR',
    devices: '6 devices',
    detail: 'Premium picture quality with simultaneous viewing for the whole house.',
    features: ['Dolby-style presentation', 'Largest simultaneous device pool', 'Early access event drops'],
  },
];

const rails = [
  { title: 'Trending Now', filter: () => true },
  { title: 'Future Noir', filter: (item) => item.category === 'Sci-Fi' || item.category === 'Thriller' },
  { title: 'Weekend Escape', filter: (item) => item.category === 'Adventure' || item.category === 'Drama' || item.category === 'Romance' },
  { title: 'Light Watch', filter: (item) => item.category === 'Comedy' || item.category === 'Documentary' || item.category === 'Music' },
];

const browseTabs = ['Home', 'Series', 'Films', 'New & Popular', 'My List'];

const stripeLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK?.trim() ?? '';
const paypalLink = import.meta.env.VITE_PAYPAL_CHECKOUT_URL?.trim() ?? '';
const demoUserKey = 'stellarstream-demo-user';
const watchlistKey = 'stellarstream-watchlist';

function App() {
  const [hero, setHero] = useState(featuredTitle);
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem(demoUserKey);
    return cached ? JSON.parse(cached) : null;
  });
  const [watchlist, setWatchlist] = useState(() => {
    const cached = localStorage.getItem(watchlistKey);
    return cached ? JSON.parse(cached) : [];
  });
  const [selectedTitle, setSelectedTitle] = useState(featuredTitle);
  const [selectedPlan, setSelectedPlan] = useState(plans[1]);
  const [authMode, setAuthMode] = useState('signin');
  const [authOpen, setAuthOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authPending, setAuthPending] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const featuredRotation = window.setInterval(() => {
      setHero((current) => {
        const currentIndex = catalog.findIndex((item) => item.id === current.id);
        return catalog[(currentIndex + 1) % catalog.length];
      });
    }, 7000);

    return () => window.clearInterval(featuredRotation);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.18 },
    );

    const nodes = document.querySelectorAll('.reveal');
    nodes.forEach((node) => observer.observe(node));

    return () => {
      nodes.forEach((node) => observer.unobserve(node));
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!configReady || !auth) {
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!nextUser) {
        return;
      }

      setUser(nextUser);
      localStorage.removeItem(demoUserKey);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    if (!configReady || !db || user.demo) {
      localStorage.setItem(watchlistKey, JSON.stringify(watchlist));
      return undefined;
    }

    const watchlistRef = doc(db, 'watchlists', user.uid);
    const unsubscribe = onSnapshot(watchlistRef, (snapshot) => {
      const remoteItems = snapshot.data()?.items ?? [];
      setWatchlist(remoteItems);
    });

    return unsubscribe;
  }, [user]);

  async function persistWatchlist(nextItems) {
    setWatchlist(nextItems);

    if (!user || user.demo || !configReady || !db) {
      localStorage.setItem(watchlistKey, JSON.stringify(nextItems));
      return;
    }

    await setDoc(doc(db, 'watchlists', user.uid), { items: nextItems }, { merge: true });
  }

  async function handleWatchlistToggle(itemId) {
    if (!user) {
      setAuthOpen(true);
      setToast('Sign in to save your watchlist.');
      return;
    }

    const exists = watchlist.includes(itemId);
    const nextItems = exists ? watchlist.filter((entry) => entry !== itemId) : [...watchlist, itemId];
    await persistWatchlist(nextItems);
    setToast(exists ? 'Removed from your watchlist.' : 'Saved to your watchlist.');
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthPending(true);

    try {
      if (!configReady || !auth) {
        const demoUser = {
          uid: `demo-${Date.now()}`,
          displayName: authForm.name || authForm.email.split('@')[0],
          email: authForm.email,
          demo: true,
        };
        setUser(demoUser);
        localStorage.setItem(demoUserKey, JSON.stringify(demoUser));
        setToast('Signed in with demo mode. Add Firebase keys for live auth.');
      } else if (authMode === 'signin') {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
        setToast('Signed in successfully.');
      } else {
        await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        setToast('Account created.');
      }

      setAuthForm({ name: '', email: '', password: '' });
      setAuthOpen(false);
    } catch (error) {
      setToast(error.message.replace('Firebase: ', ''));
    } finally {
      setAuthPending(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!configReady || !auth || !googleProvider) {
      setToast('Add Firebase credentials to enable Google sign-in.');
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
      setAuthOpen(false);
      setToast('Signed in with Google.');
    } catch (error) {
      setToast(error.message.replace('Firebase: ', ''));
    }
  }

  async function handleSignOut() {
    if (configReady && auth && !user?.demo) {
      await signOut(auth);
    }

    setUser(null);
    setWatchlist([]);
    localStorage.removeItem(demoUserKey);
    localStorage.removeItem(watchlistKey);
    setToast('Signed out.');
  }

  function openPlan(plan) {
    setSelectedPlan(plan);
    setPaymentOpen(true);
  }

  const watchlistTitles = catalog.filter((item) => watchlist.includes(item.id));
  const heroCompanions = catalog.filter((item) => item.id !== hero.id).slice(0, 3);

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="browse-header">
        <div className="browse-header__left">
          <div className="brand-lockup brand-lockup--browse">
            <p className="eyebrow">StellarStream</p>
            <span className="brand-status">Browse</span>
          </div>
          <nav className="browse-nav" aria-label="Browse sections">
            {browseTabs.map((tab, index) => (
              <button className={`browse-nav__item ${index === 0 ? 'browse-nav__item--active' : ''}`} key={tab} type="button">
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="browse-header__right">
          <button className="ghost-button ghost-button--compact" onClick={() => setSelectedTitle(hero)}>
            Featured
          </button>
          <button className="ghost-button ghost-button--compact" onClick={() => setPaymentOpen(true)}>
            Plans
          </button>
          {user ? (
            <button className="ghost-button ghost-button--compact" onClick={handleSignOut}>
              Sign out
            </button>
          ) : (
            <button className="ghost-button ghost-button--compact" onClick={() => setAuthOpen(true)}>
              Sign in
            </button>
          )}
          <div className="browse-avatar">{(user?.displayName ?? user?.email ?? 'G').slice(0, 1).toUpperCase()}</div>
        </div>
      </header>

      <main>
        <section className="billboard reveal is-visible">
          <div className="hero-copy">
            <div className="hero-kicker-row">
              <p className="hero-kicker">{hero.accent ?? hero.category}</p>
              <span className="hero-live-pill">Featured tonight</span>
            </div>
            <h2>{hero.title}</h2>
            <p className="hero-description">{hero.description}</p>
            <div className="hero-meta">
              <span>{hero.year}</span>
              <span>{hero.duration}</span>
              <span>{hero.rating}</span>
              <span>{hero.category}</span>
            </div>
            <div className="hero-storyline">
              <article>
                <strong>Scene</strong>
                <span>Premium landing experience with layered motion and cinematic framing.</span>
              </article>
              <article>
                <strong>Stack</strong>
                <span>React, Firebase auth, Firestore watchlists, Vercel deployment.</span>
              </article>
            </div>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => setSelectedTitle(hero)}>
                Explore title
              </button>
              <button className="ghost-button" onClick={() => openPlan(plans[2])}>
                Upgrade to Ultra
              </button>
            </div>
            <div className="hero-proofbar billboard-proofbar">
              <div>
                <strong>{catalog.length} titles</strong>
                <span>Hand-curated catalog lanes</span>
              </div>
              <div>
                <strong>{watchlist.length} saved</strong>
                <span>My List in this session</span>
              </div>
            </div>
          </div>
          <div className="hero-visuals billboard-visuals">
            <div className="hero-art">
              <img src={hero.image} alt={hero.title} />
              <div className="hero-art-overlay">
                <div>
                  <span className="hero-art-label">Now spotlighting</span>
                  <strong>{hero.title}</strong>
                </div>
                <span className="hero-art-score">96% match</span>
              </div>
            </div>
            <aside className="hero-sidecar billboard-sidecar">
              <div className="hero-sidecar__header">
                <p className="eyebrow">Up next</p>
                <span>Because you watched sci-fi</span>
              </div>
              <div className="hero-sidecar__list">
                {heroCompanions.map((item) => (
                  <button
                    className="hero-sidecar__item"
                    key={item.id}
                    onClick={() => setSelectedTitle(item)}
                    type="button"
                  >
                    <img src={item.image} alt={item.title} />
                    <div>
                      <strong>{item.title}</strong>
                      <span>
                        {item.category} · {item.duration}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="browse-strip reveal">
          <article className="browse-strip__card">
            <strong>Continue Watching</strong>
            <span>{hero.title} anchors the current featured lane.</span>
          </article>
          <article className="browse-strip__card">
            <strong>My List</strong>
            <span>{watchlist.length > 0 ? `${watchlist.length} saved titles ready to reopen.` : 'Save titles to build your personal row.'}</span>
          </article>
          <article className="browse-strip__card">
            <strong>Account</strong>
            <span>{user ? user.displayName ?? user.email : 'Guest browsing until sign in.'}</span>
          </article>
        </section>

        <section className="plans-inline reveal" id="plans">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Memberships</p>
              <h3>Keep plans available, but inside the browsing flow instead of ahead of it.</h3>
            </div>
            <p className="section-lead">This row now behaves like another browse surface rather than a full opening page section.</p>
          </div>
          <div className="plans-inline__row">
            {plans.map((plan) => (
              <button className={`plan-chip ${selectedPlan.id === plan.id ? 'plan-chip--active' : ''}`} key={plan.id} onClick={() => openPlan(plan)} type="button">
                <span className="plan-chip__badge">{plan.badge}</span>
                <strong>{plan.name}</strong>
                <span>
                  {plan.price}
                  {plan.cadence}
                </span>
              </button>
            ))}
          </div>
        </section>

        {watchlistTitles.length > 0 && (
          <section className="watchlist reveal">
            <div className="section-heading">
              <div>
                <p className="eyebrow">My List</p>
                <h3>Saved titles stay close to the top of the browse flow.</h3>
              </div>
              <p className="section-lead">This row replaces the feeling of a separate landing page with immediate personal context.</p>
            </div>
            <div className="rail-grid rail-grid--browse">
              {watchlistTitles.map((item, index) => (
                <TitleCard
                  item={item}
                  index={index}
                  key={item.id}
                  inWatchlist={watchlist.includes(item.id)}
                  onOpen={setSelectedTitle}
                  onToggle={handleWatchlistToggle}
                />
              ))}
            </div>
          </section>
        )}

        {rails.map((rail) => (
          <section className="catalog-section reveal" key={rail.title}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Browse</p>
                <h3>{rail.title}</h3>
              </div>
              <p className="section-lead">{catalog.filter(rail.filter).length} titles in this lane, arranged as a visual shelf with deeper metadata on hover.</p>
            </div>
            <div className="rail-grid rail-grid--browse">
              {catalog.filter(rail.filter).map((item, index) => (
                <TitleCard
                  item={item}
                  index={index}
                  key={item.id}
                  inWatchlist={watchlist.includes(item.id)}
                  onOpen={setSelectedTitle}
                  onToggle={handleWatchlistToggle}
                />
              ))}
            </div>
          </section>
        ))}

        <section className="browse-cta reveal">
          <div>
            <p className="eyebrow">Account</p>
            <h3>Sign in, save titles, and connect payments without leaving the browse flow.</h3>
          </div>
          <div className="footer-actions">
            <button className="ghost-button" onClick={() => setAuthOpen(true)}>
              {user ? 'Manage account' : 'Create account'}
            </button>
            <button className="primary-button" onClick={() => setPaymentOpen(true)}>
              Open checkout
            </button>
          </div>
        </section>
      </main>

      <TitleModal
        item={selectedTitle}
        inWatchlist={watchlist.includes(selectedTitle.id)}
        onClose={() => setSelectedTitle(null)}
        onToggle={handleWatchlistToggle}
      />

      {authOpen && (
        <ModalFrame title={authMode === 'signin' ? 'Sign in to StellarStream' : 'Create your account'} onClose={() => setAuthOpen(false)}>
          <div className="modal-layout">
            <aside className="modal-aside modal-aside--auth">
              <p className="eyebrow">Access</p>
              <h4>{authMode === 'signin' ? 'Pick up where you left off.' : 'Start your account with a polished first run.'}</h4>
              <p>
                {configReady
                  ? 'Firebase auth is active, so this flow is ready for live sign-in and account creation.'
                  : 'Firebase env vars are still missing, so this form currently falls back to local demo mode.'}
              </p>
              <div className="modal-bullet-list">
                <span>{configReady ? 'Live account handling enabled' : 'Demo mode enabled'}</span>
                <span>Google sign-in entry point included</span>
                <span>Watchlist sync begins after login</span>
              </div>
            </aside>
            <div className="modal-main">
              <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
                <button
                  className={`auth-toggle__button ${authMode === 'signin' ? 'auth-toggle__button--active' : ''}`}
                  onClick={() => setAuthMode('signin')}
                  type="button"
                >
                  Sign in
                </button>
                <button
                  className={`auth-toggle__button ${authMode === 'signup' ? 'auth-toggle__button--active' : ''}`}
                  onClick={() => setAuthMode('signup')}
                  type="button"
                >
                  Create account
                </button>
              </div>
              <form className="stacked-form" onSubmit={handleAuthSubmit}>
                {authMode === 'signup' && (
                  <label>
                    Name
                    <input
                      type="text"
                      value={authForm.name}
                      onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                      placeholder="Alex Carter"
                    />
                  </label>
                )}
                <label>
                  Email
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                    placeholder="you@example.com"
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    required
                  />
                </label>
                <div className="modal-action-row">
                  <button className="primary-button" disabled={authPending} type="submit">
                    {authPending ? 'Working...' : authMode === 'signin' ? 'Sign in' : 'Create account'}
                  </button>
                  <button className="ghost-button" onClick={handleGoogleSignIn} type="button">
                    Continue with Google
                  </button>
                </div>
                <p className="helper-text">
                  {configReady
                    ? 'Firebase auth is active.'
                    : 'Firebase env vars are missing, so this form signs in with local demo mode.'}
                </p>
                <button
                  className="text-button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  type="button"
                >
                  {authMode === 'signin' ? 'Need an account? Create one.' : 'Already have an account? Sign in.'}
                </button>
              </form>
            </div>
          </div>
        </ModalFrame>
      )}

      {paymentOpen && (
        <ModalFrame title={`Checkout ${selectedPlan.name}`} onClose={() => setPaymentOpen(false)}>
          <div className="modal-layout">
            <aside className="modal-aside modal-aside--checkout">
              <p className="eyebrow">Checkout flow</p>
              <h4>{selectedPlan.name} is selected and ready for provider handoff.</h4>
              <p>
                The hosted payment step is intentionally separate, so you can swap in real merchant links without changing the interface.
              </p>
              <div className="modal-bullet-list">
                <span>{selectedPlan.quality} presentation tier</span>
                <span>{selectedPlan.devices} included</span>
                <span>{stripeLink || paypalLink ? 'At least one provider is configured' : 'Provider URLs still needed'}</span>
              </div>
            </aside>
            <div className="modal-main checkout-panel">
              <div className="checkout-summary">
                <p className="eyebrow">Selected plan</p>
                <div className="checkout-summary__top">
                  <div>
                    <h3>{selectedPlan.name}</h3>
                    <p>
                      {selectedPlan.price}
                      {selectedPlan.cadence}
                    </p>
                  </div>
                  <span className="plan-badge">{selectedPlan.badge}</span>
                </div>
                <div className="plan-metrics">
                  <span>{selectedPlan.quality}</span>
                  <span>{selectedPlan.devices}</span>
                </div>
                <p className="plan-detail">{selectedPlan.detail}</p>
                <div className="checkout-feature-list">
                  {selectedPlan.features.map((feature) => (
                    <span key={feature}>{feature}</span>
                  ))}
                </div>
              </div>
              <div className="checkout-options">
                <PaymentOption
                  title="Stripe"
                  detail="Use a hosted Stripe Checkout or Payment Link."
                  href={stripeLink}
                />
                <PaymentOption
                  title="PayPal"
                  detail="Use a PayPal subscription or checkout URL."
                  href={paypalLink}
                />
              </div>
              <p className="helper-text">
                Add checkout URLs in `.env` to activate these buttons. The UI is live; the final provider links depend on your merchant accounts.
              </p>
            </div>
          </div>
        </ModalFrame>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function TitleCard({ item, index, inWatchlist, onOpen, onToggle }) {
  return (
    <article className="title-card" style={{ animationDelay: `${index * 80}ms` }}>
      <img src={item.image} alt={item.title} />
      <div className="title-overlay">
        <div className="title-overlay__top">
          <p>{item.category}</p>
          <span className="title-overlay__match">94% match</span>
        </div>
        <h4>{item.title}</h4>
        <span>
          {item.year} • {item.duration}
        </span>
        <p className="title-overlay__description">{item.description}</p>
        <div className="card-actions">
          <button className="primary-button primary-button--small" onClick={() => onOpen(item)}>
            Details
          </button>
          <button className="ghost-button ghost-button--small" onClick={() => onToggle(item.id)}>
            {inWatchlist ? 'Remove' : 'Watchlist'}
          </button>
        </div>
      </div>
    </article>
  );
}

function TitleModal({ item, inWatchlist, onClose, onToggle }) {
  if (!item) {
    return null;
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="title-modal-hero">
          <button className="modal-close title-modal-close" onClick={onClose} type="button">
            Close
          </button>
          <img className="modal-image" src={item.image} alt={item.title} />
          <div className="title-modal-hero__overlay">
            <div>
              <p className="eyebrow">{item.category}</p>
              <h3>{item.title}</h3>
            </div>
            <span className="title-overlay__match">96% match</span>
          </div>
        </div>
        <div className="modal-content modal-content--title">
          <div className="title-modal-layout">
            <div className="title-modal-main">
              <p>{item.description}</p>
              <div className="hero-meta">
                <span>{item.year}</span>
                <span>{item.duration}</span>
                <span>{item.rating}</span>
                <span>{item.category}</span>
              </div>
              <div className="modal-action-row">
                <button className="primary-button" onClick={() => onToggle(item.id)}>
                  {inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                </button>
                <button className="ghost-button" onClick={onClose} type="button">
                  Back to browse
                </button>
              </div>
            </div>
            <aside className="title-modal-aside">
              <p className="eyebrow">Details</p>
              <div className="modal-bullet-list">
                <span>{item.category} spotlight lane</span>
                <span>{item.duration} runtime</span>
                <span>{item.rating} maturity rating</span>
              </div>
              <div className="title-modal-note">
                <strong>Queue note</strong>
                <p>This overlay now matches the product tone used by the upgraded auth and checkout flows.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalFrame({ children, onClose, title }) {
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-shell" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} type="button">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PaymentOption({ detail, href, title }) {
  const enabled = Boolean(href);

  return (
    <article className={`payment-option ${enabled ? '' : 'payment-option--disabled'}`}>
      <div className="payment-option__top">
        <h4>{title}</h4>
        <span className="status-badge">{enabled ? 'Enabled' : 'Needs URL'}</span>
      </div>
      <p>{detail}</p>
      {enabled ? (
        <a className="primary-button payment-link" href={href} rel="noreferrer" target="_blank">
          Continue to {title}
        </a>
      ) : (
        <button className="ghost-button" disabled type="button">
          Add {title} URL in env
        </button>
      )}
    </article>
  );
}

export default App;
