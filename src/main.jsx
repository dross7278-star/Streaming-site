import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


configReady);
import { useParams } from 'react-router-dom';

const MovieDetails = () => {
    const { id } = useParams();
    // Fetch movie details using the ID
    return (
        <div>
            {/* Render movie details here */}
        </div>
    );
};

const handleGuestSignIn = () => {
    // Logic to handle guest sign-in
    console.log("Signed in as Guest");
    // Redirect to home or main page
};

// In your JSX
<button onClick={handleGuestSignIn}>Sign in as Guest</button>

import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleChange = (event) => {
        setQuery(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevents the page from refreshing
        onSearch(query); // Calls the onSearch function passed as a prop
        setQuery(''); // Clear the input after search
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                value={query} 
                onChange={handleChange} 
                placeholder="Search for movies..." 
            />
            <button type="submit">Search</button>
        </form>
    );
};

export default SearchBar;
import React, { useState } from 'react';
import SearchBar from './SearchBar'; // Adjust the path as necessary

const MovieApp = () => {
    const [movies, setMovies] = useState([]);

    const searchMovies = async (query) => {
        const response = await fetch(`https://api.example.com/search/movie?query=${query}&api_key=YOUR_API_KEY`);
        const data = await response.json();
        setMovies(data.results); // Assuming the API returns results in this format
    };

    return (
        <div>
            <h1>Movie Search</h1>
            <SearchBar onSearch={searchMovies} />
            <MovieList movies={movies} /> {/* Assume you have a MovieList component to display movies */}
        </div>
    );
};

export default MovieApp;
const MovieList = ({ movies }) => {
    return (
        <div>
            {movies.map(movie => (
                <div key={movie.id}>
                    <h2>{movie.title}</h2>
                    {/* Add any additional movie details you want to show */}
                </div>
            ))}
        </div>
    );
};

