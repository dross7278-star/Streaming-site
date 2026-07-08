import { useEffect, useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, configReady, db, googleProvider } from './firebase';
import {
  animationFeedOptions,
  catalog as fallbackCatalog,
  featuredTitle as fallbackFeaturedTitle,
  fetchAnimationCatalog,
} from './data/catalog';

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

const browseTabs = ['Home', 'Series', 'Films', 'New & Popular', 'My List'];

const stripeLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK?.trim() ?? '';
const paypalLink = import.meta.env.VITE_PAYPAL_CHECKOUT_URL?.trim() ?? '';
const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY?.trim() ?? '';
const demoUserKey = 'stellarstream-demo-user';
const watchlistKey = 'stellarstream-watchlist';

function App() {
  const [catalog, setCatalog] = useState(fallbackCatalog);
  const [hero, setHero] = useState(fallbackFeaturedTitle);
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem(demoUserKey);
    return cached ? JSON.parse(cached) : null;
  });
  const [watchlist, setWatchlist] = useState(() => {
    const cached = localStorage.getItem(watchlistKey);
    return cached ? JSON.parse(cached) : [];
  });
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(plans[1]);
  const [authMode, setAuthMode] = useState('signin');
  const [authOpen, setAuthOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authPending, setAuthPending] = useState(false);
  const [toast, setToast] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [activeFeed, setActiveFeed] = useState('newest');
  const [activeBrowseTab, setActiveBrowseTab] = useState('Home');
  const anyModalOpen = Boolean(selectedTitle) || authOpen || paymentOpen;
  const railRefs = useRef({});

  const feedTitlePrefix =
    activeFeed === 'topRated' ? 'Top Rated' : activeFeed === 'upcoming' ? 'Upcoming' : 'Newest';

  const rails = [
    { title: `${feedTitlePrefix} Animation Movies`, filter: (item) => item.mediaType === 'movie' },
    { title: `${feedTitlePrefix} Animation Series`, filter: (item) => item.mediaType === 'tv' },
    { title: `${feedTitlePrefix} Animation Mix`, filter: () => true },
  ];

  useEffect(() => {
    let active = true;

    async function loadNewestAnimation() {
      setCatalogLoading(true);
      const nextCatalog = await fetchAnimationCatalog(tmdbApiKey, activeFeed);

      if (!active) {
        return;
      }

      setCatalog(nextCatalog.items);
      setHero(nextCatalog.featured);

      if (nextCatalog.usedFallback && nextCatalog.reason) {
        setToast(`Using local catalog: ${nextCatalog.reason}`);
      }

      setCatalogLoading(false);
    }

    loadNewestAnimation();

    return () => {
      active = false;
    };
  }, [activeFeed]);

  useEffect(() => {
    if (!catalog.length) {
      return undefined;
    }

    const featuredRotation = window.setInterval(() => {
      setHero((current) => {
        const currentIndex = catalog.findIndex((item) => item.id === current.id);
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % catalog.length;
        return catalog[nextIndex];
      });
    }, 7000);

    return () => window.clearInterval(featuredRotation);
  }, [catalog]);

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
    if (!anyModalOpen) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key !== 'Escape') {
        return;
      }

      if (selectedTitle) {
        setSelectedTitle(null);
        return;
      }

      if (paymentOpen) {
        setPaymentOpen(false);
        return;
      }

      if (authOpen) {
        setAuthOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [anyModalOpen, selectedTitle, paymentOpen, authOpen]);

  useEffect(() => {
    if (!anyModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [anyModalOpen]);

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
    setSelectedTitle(null);
    setAuthOpen(false);
    setPaymentOpen(true);
  }

  function openTitle(item) {
    setAuthOpen(false);
    setPaymentOpen(false);
    setSelectedTitle(item);
  }

  function setRailRef(key) {
    return (node) => {
      if (node) {
        railRefs.current[key] = node;
        return;
      }

      delete railRefs.current[key];
    };
  }

  function scrollRail(key, direction) {
    const rail = railRefs.current[key];
    if (!rail) {
      return;
    }

    const scrollAmount = Math.max(220, Math.floor(rail.clientWidth * 0.7));
    rail.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }

  const watchlistTitles = catalog.filter((item) => watchlist.includes(item.id));
  const heroCompanions = catalog.filter((item) => item.id !== hero.id).slice(0, 4);

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="browse-header">
        <div className="browse-header__left">
          <div className="brand-lockup brand-lockup--browse">
            <p className="eyebrow">StellarStream</p>
          </div>
          <nav className="browse-nav" aria-label="Browse sections">
            {browseTabs.map((tab) => (
              <button
                className={`browse-nav__item ${activeBrowseTab === tab ? 'browse-nav__item--active' : ''}`}
                key={tab}
                onClick={() => setActiveBrowseTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="browse-header__right">
          <button className="ghost-button ghost-button--compact" onClick={() => openTitle(hero)}>
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
        <section
          className="billboard reveal is-visible"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.72) 36%, rgba(0, 0, 0, 0.22) 68%, rgba(0, 0, 0, 0.78) 100%), url(${hero.image})`,
          }}
        >
          <div className="billboard-copy">
            <p className="hero-kicker">{hero.accent ?? hero.category}</p>
            <h2>{hero.title}</h2>
            <div className="hero-meta">
              <span>{hero.year}</span>
              <span>{hero.rating}</span>
              <span>{hero.duration}</span>
            </div>
            <p className="hero-description">{hero.description}</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => openTitle(hero)}>
                Play
              </button>
              <button className="ghost-button" onClick={() => openTitle(hero)}>
                More Info
              </button>
            </div>
          </div>
        </section>

        <section className="catalog-section catalog-section--compact reveal">
          <div className="section-heading section-heading--compact">
            <div>
              <h3>Continue Watching</h3>
              {catalogLoading && <p className="eyebrow">Loading animation feed...</p>}
            </div>
            <div className="section-heading__actions">
              <div className="feed-toggle" role="tablist" aria-label="Animation feed filter">
                {animationFeedOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`feed-toggle__button ${activeFeed === option.id ? 'feed-toggle__button--active' : ''}`}
                    onClick={() => setActiveFeed(option.id)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <RailControls
                label="Continue Watching"
                onNext={() => scrollRail('continue-watching', 1)}
                onPrev={() => scrollRail('continue-watching', -1)}
              />
            </div>
          </div>
          <div className="rail-grid rail-grid--browse rail-grid--scroll" ref={setRailRef('continue-watching')}>
            {heroCompanions.map((item, index) => (
              <TitleCard
                item={item}
                index={index}
                key={item.id}
                inWatchlist={watchlist.includes(item.id)}
                onOpen={openTitle}
                onToggle={handleWatchlistToggle}
              />
            ))}
          </div>
        </section>

        <section className="plans-inline reveal" id="plans">
          <div className="section-heading section-heading--compact">
            <div>
              <h3>Membership Options</h3>
            </div>
            <RailControls
              label="Membership Options"
              onNext={() => scrollRail('membership-options', 1)}
              onPrev={() => scrollRail('membership-options', -1)}
            />
          </div>
          <div className="plans-inline__row" ref={setRailRef('membership-options')}>
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
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">My List</p>
                <h3>My List</h3>
              </div>
              <RailControls
                label="My List"
                onNext={() => scrollRail('watchlist', 1)}
                onPrev={() => scrollRail('watchlist', -1)}
              />
            </div>
            <div className="rail-grid rail-grid--browse rail-grid--scroll" ref={setRailRef('watchlist')}>
              {watchlistTitles.map((item, index) => (
                <TitleCard
                  item={item}
                  index={index}
                  key={item.id}
                  inWatchlist={watchlist.includes(item.id)}
                  onOpen={openTitle}
                  onToggle={handleWatchlistToggle}
                />
              ))}
            </div>
          </section>
        )}

        {rails.map((rail) => (
          <section className="catalog-section reveal" key={rail.title}>
            <div className="section-heading section-heading--compact">
              <div>
                <h3>{rail.title}</h3>
              </div>
              <RailControls
                label={rail.title}
                onNext={() => scrollRail(rail.title, 1)}
                onPrev={() => scrollRail(rail.title, -1)}
              />
            </div>
            <div className="rail-grid rail-grid--browse rail-grid--scroll" ref={setRailRef(rail.title)}>
              {catalog.filter(rail.filter).map((item, index) => (
                <TitleCard
                  item={item}
                  index={index}
                  key={item.id}
                  inWatchlist={watchlist.includes(item.id)}
                  onOpen={openTitle}
                  onToggle={handleWatchlistToggle}
                />
              ))}
            </div>
          </section>
        ))}

        <section className="browse-cta reveal">
          <div>
            <h3>{user ? 'Manage your account and membership.' : 'Sign in to save titles and manage membership.'}</h3>
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
        inWatchlist={selectedTitle ? watchlist.includes(selectedTitle.id) : false}
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
    <article className="title-card" style={{ animationDelay: `${index * 16}ms` }}>
      <img src={item.image} alt={item.title} />
      <div className="title-overlay">
        <div className="title-overlay__top">
          <span className="title-overlay__match">94% Match</span>
        </div>
        <h4>{item.title}</h4>
        <span>
          {item.year} • {item.rating}
        </span>
        <div className="card-actions">
          <button className="primary-button primary-button--small" onClick={() => onOpen(item)}>
            More Info
          </button>
          <button className="ghost-button ghost-button--small" onClick={() => onToggle(item.id)}>
            {inWatchlist ? 'In My List' : 'My List'}
          </button>
        </div>
      </div>
    </article>
  );
}

function RailControls({ label, onNext, onPrev }) {
  return (
    <div className="section-arrows" aria-label={`${label} controls`}>
      <button className="section-arrow-button" onClick={onPrev} type="button" aria-label={`Scroll ${label} left`}>
        {'<'}
      </button>
      <button className="section-arrow-button" onClick={onNext} type="button" aria-label={`Scroll ${label} right`}>
        {'>'}
      </button>
    </div>
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
