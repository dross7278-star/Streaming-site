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
    price: '$7',
    cadence: '/month',
    quality: 'HD',
    devices: '2 devices',
    detail: 'A fast entry plan for casual viewing.',
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '$14',
    cadence: '/month',
    quality: 'Full HD',
    devices: '4 devices',
    detail: 'The balanced plan for shared accounts and weekend marathons.',
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: '$21',
    cadence: '/month',
    quality: '4K + HDR',
    devices: '6 devices',
    detail: 'Premium picture quality with simultaneous viewing for the whole house.',
  },
];

const rails = [
  { title: 'Trending Now', filter: () => true },
  { title: 'Future Noir', filter: (item) => item.category === 'Sci-Fi' || item.category === 'Thriller' },
  { title: 'Weekend Escape', filter: (item) => item.category === 'Adventure' || item.category === 'Drama' || item.category === 'Romance' },
  { title: 'Light Watch', filter: (item) => item.category === 'Comedy' || item.category === 'Documentary' || item.category === 'Music' },
];

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

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <div>
          <p className="eyebrow">StellarStream</p>
          <h1>Streaming designed like an event, not a template.</h1>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" onClick={() => setPaymentOpen(true)}>
            Plans
          </button>
          {user ? (
            <button className="ghost-button" onClick={handleSignOut}>
              Sign out
            </button>
          ) : (
            <button className="ghost-button" onClick={() => setAuthOpen(true)}>
              Sign in
            </button>
          )}
          <button className="primary-button" onClick={() => openPlan(plans[1])}>
            Start watching
          </button>
        </div>
      </header>

      <main>
        <section className="hero reveal is-visible">
          <div className="hero-copy">
            <p className="hero-kicker">{hero.accent ?? hero.category}</p>
            <h2>{hero.title}</h2>
            <p className="hero-description">{hero.description}</p>
            <div className="hero-meta">
              <span>{hero.year}</span>
              <span>{hero.duration}</span>
              <span>{hero.rating}</span>
              <span>{hero.category}</span>
            </div>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => setSelectedTitle(hero)}>
                Explore title
              </button>
              <button className="ghost-button" onClick={() => openPlan(plans[2])}>
                Upgrade to Ultra
              </button>
            </div>
          </div>
          <div className="hero-art">
            <img src={hero.image} alt={hero.title} />
          </div>
        </section>

        <section className="stats-grid reveal">
          <article>
            <strong>Auth-ready</strong>
            <span>{configReady ? 'Firebase connected' : 'Demo mode active until env vars are added'}</span>
          </article>
          <article>
            <strong>Payments</strong>
            <span>{stripeLink || paypalLink ? 'Checkout links configured' : 'Awaiting Stripe or PayPal link setup'}</span>
          </article>
          <article>
            <strong>Deployment</strong>
            <span>Prepared for GitHub plus Vercel deployment</span>
          </article>
        </section>

        <section className="plans reveal" id="plans">
          <div className="section-heading">
            <p className="eyebrow">Memberships</p>
            <h3>Pick a plan that fits the screen count and picture quality you need.</h3>
          </div>
          <div className="plan-grid">
            {plans.map((plan) => (
              <article className={`plan-card ${selectedPlan.id === plan.id ? 'plan-card--active' : ''}`} key={plan.id}>
                <p className="plan-name">{plan.name}</p>
                <h4>
                  {plan.price}
                  <span>{plan.cadence}</span>
                </h4>
                <ul>
                  <li>{plan.quality}</li>
                  <li>{plan.devices}</li>
                  <li>{plan.detail}</li>
                </ul>
                <button className="primary-button" onClick={() => openPlan(plan)}>
                  Choose {plan.name}
                </button>
              </article>
            ))}
          </div>
        </section>

        {watchlistTitles.length > 0 && (
          <section className="watchlist reveal">
            <div className="section-heading">
              <p className="eyebrow">Your List</p>
              <h3>Saved titles follow you between sessions when Firebase is configured.</h3>
            </div>
            <div className="rail-grid">
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
              <p className="eyebrow">Browse</p>
              <h3>{rail.title}</h3>
            </div>
            <div className="rail-grid">
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
      </main>

      <footer className="footer reveal">
        <div>
          <p className="eyebrow">Operations</p>
          <h3>Ready for GitHub source control, Firebase credentials, and a Vercel deploy.</h3>
        </div>
        <div className="footer-actions">
          <button className="ghost-button" onClick={() => setAuthOpen(true)}>
            {user ? 'Manage account' : 'Create account'}
          </button>
          <button className="primary-button" onClick={() => setPaymentOpen(true)}>
            Open checkout
          </button>
        </div>
      </footer>

      <TitleModal
        item={selectedTitle}
        inWatchlist={watchlist.includes(selectedTitle.id)}
        onClose={() => setSelectedTitle(null)}
        onToggle={handleWatchlistToggle}
      />

      {authOpen && (
        <ModalFrame title={authMode === 'signin' ? 'Sign in to StellarStream' : 'Create your account'} onClose={() => setAuthOpen(false)}>
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
            <button className="primary-button" disabled={authPending} type="submit">
              {authPending ? 'Working...' : authMode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
            <button className="ghost-button" onClick={handleGoogleSignIn} type="button">
              Continue with Google
            </button>
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
        </ModalFrame>
      )}

      {paymentOpen && (
        <ModalFrame title={`Checkout ${selectedPlan.name}`} onClose={() => setPaymentOpen(false)}>
          <div className="checkout-panel">
            <div className="checkout-summary">
              <p className="eyebrow">Selected plan</p>
              <h3>{selectedPlan.name}</h3>
              <p>
                {selectedPlan.price}
                {selectedPlan.cadence}
              </p>
              <span>{selectedPlan.quality}</span>
              <span>{selectedPlan.devices}</span>
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
        <p>{item.category}</p>
        <h4>{item.title}</h4>
        <span>
          {item.year} • {item.duration}
        </span>
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
        <button className="modal-close" onClick={onClose} type="button">
          Close
        </button>
        <img className="modal-image" src={item.image} alt={item.title} />
        <div className="modal-content">
          <p className="eyebrow">{item.category}</p>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <div className="hero-meta">
            <span>{item.year}</span>
            <span>{item.duration}</span>
            <span>{item.rating}</span>
          </div>
          <button className="primary-button" onClick={() => onToggle(item.id)}>
            {inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          </button>
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
      <h4>{title}</h4>
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
