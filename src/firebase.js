import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const configReady = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
].every(Boolean);

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (configReady) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
}
// ...existing code...
function normalizeTmdbItem(item, mediaTypeHint) {
  const mediaType = mediaTypeHint || item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const rawTitle = mediaType === 'tv' ? item.name : item.title;
  const title = rawTitle || item.title || item.name || 'Untitled';

  const releaseDate = mediaType === 'tv' ? item.first_air_date : item.release_date;
  const year = releaseDate ? Number(String(releaseDate).slice(0, 4)) : '—';

  return {
    id: `${mediaType}-${item.id}`,
    tmdbId: item.id,
    mediaType,
    title,
    year,
    rating: typeof item.vote_average === 'number' ? item.vote_average.toFixed(1) : '—',
    duration: mediaType === 'tv' ? 'Series' : 'Movie',
    category: mediaType === 'tv' ? 'Series' : 'Movie',
    accent: 'Newest',
    description: item.overview || 'No description available.',
    image: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : item.backdrop_path
        ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
        : 'https://via.placeholder.com/800x450?text=No+Image',
    match: Math.round((item.vote_average || 0) * 10),
  };
}
export { app, auth, db, googleProvider, configReady };
console.log('Firebase configReady:', 