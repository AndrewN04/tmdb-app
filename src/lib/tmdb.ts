import { TMDBResponse, Movie, TVShow, MovieDetails, TVDetails, SearchResult } from '@/types/tmdb';

const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Helper to construct image URLs
export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
    if (!path) return '/placeholder-image.png'; // Replace with actual placeholder
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Generic fetcher
async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const token = process.env.TMDB_API_TOKEN;
    if (!token) {
        throw new Error('TMDB_API_TOKEN is not defined');
    }

    const searchParams = new URLSearchParams(params);
    searchParams.append('api_key', token); // Use api_key param for v3 Auth

    const url = `${TMDB_API_URL}${endpoint}?${searchParams.toString()}`;

    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }, // Default cache 1 hour
    });

    if (!res.ok) {
        throw new Error(`TMDB API Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

// API Methods
export const tmdb = {
    getTrending: async (timeWindow: 'day' | 'week' = 'day') => {
        return fetchTMDB<TMDBResponse<SearchResult>>(`/trending/all/${timeWindow}`);
    },

    getPopularMovies: async (page = 1) => {
        return fetchTMDB<TMDBResponse<Movie>>('/movie/popular', { page: page.toString() });
    },

    getPopularTV: async (page = 1) => {
        return fetchTMDB<TMDBResponse<TVShow>>('/tv/popular', { page: page.toString() });
    },

    getUpcomingMovies: async (page = 1) => {
        return fetchTMDB<TMDBResponse<Movie>>('/movie/upcoming', { page: page.toString() });
    },

    searchMulti: async (query: string, page = 1) => {
        return fetchTMDB<TMDBResponse<SearchResult>>('/search/multi', { query, page: page.toString() });
    },

    getMovieDetails: async (id: number) => {
        return fetchTMDB<MovieDetails>(`/movie/${id}`, { append_to_response: 'credits,similar,videos' });
    },

    getTVDetails: async (id: number) => {
        return fetchTMDB<TVDetails>(`/tv/${id}`, { append_to_response: 'credits,similar,videos' });
    },

    discoverMovies: async (params: Record<string, string> = {}) => {
        return fetchTMDB<TMDBResponse<Movie>>('/discover/movie', params);
    },

    discoverTV: async (params: Record<string, string> = {}) => {
        return fetchTMDB<TMDBResponse<TVShow>>('/discover/tv', params);
    },

    getGenres: async (type: 'movie' | 'tv') => {
        const res = await fetchTMDB<{ genres: { id: number; name: string }[] }>(`/genre/${type}/list`);
        return res.genres;
    },
};
