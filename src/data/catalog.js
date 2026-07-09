const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w1280';
const TMDB_API_BASE = 'https://api.themoviedb.org/3';

const animationFeedConfig = {
  newest: {
    id: 'newest',
    label: 'Newest',
    moviePath: '/discover/movie',
    tvPath: '/discover/tv',
    movieParams: 'with_genres=16&sort_by=primary_release_date.desc&include_adult=false&include_video=false&language=en-US&page=1',
    tvParams: 'with_genres=16&sort_by=first_air_date.desc&include_adult=false&language=en-US&page=1',
  },
  topRated: {
    id: 'topRated',
    label: 'Top Rated',
    moviePath: '/discover/movie',
    tvPath: '/discover/tv',
    movieParams: 'with_genres=16&sort_by=vote_average.desc&vote_count.gte=150&include_adult=false&include_video=false&language=en-US&page=1',
    tvParams: 'with_genres=16&sort_by=vote_average.desc&vote_count.gte=80&include_adult=false&language=en-US&page=1',
  },
  upcoming: {
    id: 'upcoming',
    label: 'Upcoming',
    moviePath: '/discover/movie',
    tvPath: '/discover/tv',
    movieParams: 'with_genres=16&sort_by=primary_release_date.asc&primary_release_date.gte={today}&include_adult=false&include_video=false&language=en-US&page=1',
    tvParams: 'with_genres=16&sort_by=first_air_date.asc&first_air_date.gte={today}&include_adult=false&language=en-US&page=1',
  },
};

export const featuredTitle = {
  id: 'aurora-protocol',
  title: 'Aurora Protocol',
  category: 'Sci-Fi',
  year: 2026,
  duration: '2h 08m',
  rating: 'PG-13',
  accent: 'Neon Frontier',
  image:
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1400&q=80',
  description:
    'A rebel signal engineer discovers a buried transmission network that can rewrite memory across an entire orbital colony.',
};

export const catalog = [
  {
    id: 'midnight-runway',
    title: 'Midnight Runway',
    category: 'Drama',
    year: 2025,
    duration: '1h 54m',
    rating: '16+',
    image:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    description:
      'An underground designer risks everything to stage a final show inside a city that outlawed self-expression.',
  },
  {
    id: 'breakpoint-tokyo',
    title: 'Breakpoint Tokyo',
    category: 'Action',
    year: 2026,
    duration: '2h 01m',
    rating: '18+',
    image:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
    description:
      'A disgraced courier races through a blackout-struck Tokyo with a quantum key every syndicate wants.',
  },
  {
    id: 'paper-moons',
    title: 'Paper Moons',
    category: 'Romance',
    year: 2024,
    duration: '1h 42m',
    rating: '13+',
    image:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    description:
      'Two artists meet over a series of anonymous letters that begin appearing inside a restored cinema.',
  },
  {
    id: 'deep-current',
    title: 'Deep Current',
    category: 'Documentary',
    year: 2025,
    duration: '58m',
    rating: 'All',
    image:
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80',
    description:
      'Marine engineers and free divers map the hidden river systems running below the Atlantic shelf.',
  },
  {
    id: 'ghost-frequency',
    title: 'Ghost Frequency',
    category: 'Thriller',
    year: 2026,
    duration: '1h 47m',
    rating: '16+',
    image:
      'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=1200&q=80',
    description:
      'A radio host decodes a pattern in late-night calls that predicts crimes before they happen.',
  },
  {
    id: 'studio-eight',
    title: 'Studio Eight',
    category: 'Comedy',
    year: 2025,
    duration: '32m',
    rating: '13+',
    image:
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80',
    description:
      'A washed-up ad director accidentally turns a failing local station into the funniest show in the state.',
  },
  {
    id: 'northline',
    title: 'Northline',
    category: 'Adventure',
    year: 2024,
    duration: '1h 38m',
    rating: 'PG',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    description:
      'Three siblings inherit an unfinished rail map that leads them into the wildest parts of the Arctic.',
  },
  {
    id: 'glass-code',
    title: 'Glass Code',
    category: 'Sci-Fi',
    year: 2026,
    duration: '2h 16m',
    rating: '16+',
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    description:
      'A forensic programmer rebuilds a dead city from fragments of data recovered in cracked smart glass.',
  },
  {
    id: 'wild-static',
    title: 'Wild Static',
    category: 'Music',
    year: 2025,
    duration: '49m',
    rating: 'All',
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    description:
      'A touring sound collective records disappearing folk traditions across deserts, harbors, and mountain towns.',
  },
];

function formatYear(dateString) {
  const year = Number.parseInt(String(dateString || '').slice(0, 4), 10);
  return Number.isFinite(year) ? year : new Date().getFullYear();
}

function formatRating(voteAverage) {
  if (!voteAverage || Number.isNaN(voteAverage)) {
    return 'NR';
  }

  return `TMDB ${voteAverage.toFixed(1)}`;
}

function normalizeTmdbItem(item, mediaType) {
  const rawTitle = mediaType === 'movie' ? item.title : item.name;
  const title = rawTitle || (mediaType === 'movie' ? 'Untitled Movie' : 'Untitled Series');
  const date = mediaType === 'movie' ? item.release_date : item.first_air_date;
  const imagePath = item.backdrop_path || item.poster_path;

  return {
    id: `tmdb-${mediaType}-${item.id}`,
    title,
    category: mediaType === 'movie' ? 'Animation Movie' : 'Animation Series',
    year: formatYear(date),
    duration: mediaType === 'movie' ? 'Feature' : 'Series',
    rating: formatRating(item.vote_average),
    accent: mediaType === 'movie' ? 'Newest Animation Movie' : 'Newest Animation Series',
    image: imagePath ? `${TMDB_IMAGE_BASE}${imagePath}` : featuredTitle.image,
    description: item.overview || 'No overview available yet.',
    mediaType,
  };
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function buildTmdbUrl(path, params, apiKey) {
  return `${TMDB_API_BASE}${path}?api_key=${encodeURIComponent(apiKey)}&${params}`;
}

export const animationFeedOptions = Object.values(animationFeedConfig).map(({ id, label }) => ({ id, label }));

export async function fetchAnimationCatalog(apiKey, feed = 'newest') {
  if (!apiKey) {
    return {
      featured: featuredTitle,
      items: catalog,
      usedFallback: true,
      reason: 'No TMDB API key configured.',
    };
  }

  const config = animationFeedConfig[feed] ?? animationFeedConfig.newest;
  const today = getTodayString();
  const movieParams = config.movieParams.replace('{today}', today);
  const tvParams = config.tvParams.replace('{today}', today);
  const movieUrl = buildTmdbUrl(config.moviePath, movieParams, apiKey);
  const tvUrl = buildTmdbUrl(config.tvPath, tvParams, apiKey);

  try {
    const [movieResponse, tvResponse] = await Promise.all([fetch(movieUrl), fetch(tvUrl)]);

    if (!movieResponse.ok || !tvResponse.ok) {
      throw new Error('TMDB request failed.');
    }

    const [movieData, tvData] = await Promise.all([movieResponse.json(), tvResponse.json()]);
    const movieItems = (movieData.results || []).slice(0, 12).map((item) => normalizeTmdbItem(item, 'movie'));
    const tvItems = (tvData.results || []).slice(0, 12).map((item) => normalizeTmdbItem(item, 'tv'));

    const items = [...movieItems, ...tvItems].filter((item) => Boolean(item.image)).slice(0, 20);

    if (!items.length) {
      return {
        featured: featuredTitle,
        items: catalog,
        usedFallback: true,
        reason: 'TMDB returned no animation titles.',
      };
    }

    return {
      featured: items[0],
      items,
      usedFallback: false,
      reason: '',
    };
  } catch (error) {
    return {
      featured: featuredTitle,
      items: catalog,
      usedFallback: true,
      reason: error instanceof Error ? error.message : 'Unable to load TMDB data.',
    };
  }
}

export async function fetchNewestAnimationCatalog(apiKey) {
  return fetchAnimationCatalog(apiKey, 'newest');
}
