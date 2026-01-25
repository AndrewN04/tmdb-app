export interface TMDBResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

export interface MediaItem {
    id: number;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
    original_language: string;
}

export interface Movie extends MediaItem {
    title: string;
    original_title: string;
    release_date: string;
    video: boolean;
    media_type?: 'movie';
}

export interface TVShow extends MediaItem {
    name: string;
    original_name: string;
    first_air_date: string;
    origin_country: string[];
    media_type?: 'tv';
}

export type SearchResult = Movie | TVShow;

export interface Genre {
    id: number;
    name: string;
}

export interface MovieDetails extends Movie {
    genres: Genre[];
    runtime: number;
    status: string;
    tagline: string;
    // Add other details as needed
}

export interface TVDetails extends TVShow {
    genres: Genre[];
    number_of_episodes: number;
    number_of_seasons: number;
    status: string;
    tagline: string;
    // Add other details as needed
}

export interface CastMember {
    id: number;
    name: string;
    profile_path: string | null;
    character: string;
    order: number;
}

export interface Credits {
  cast: CastMember[];
  crew: unknown[]; // Define if needed, safer than any
}
