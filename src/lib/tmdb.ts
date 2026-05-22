// TMDB API 客户端
// 文档：https://developer.themoviedb.org/reference/intro/getting-started

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

let _fetch: typeof globalThis.fetch = globalThis.fetch

async function initFetch(): Promise<void> {
  const proxy = process.env.TMDB_HTTP_PROXY
  if (proxy) {
    const { ProxyAgent, fetch: undiciFetch } = await import('undici')
    const agent = new ProxyAgent({ uri: proxy })
    _fetch = (url: Parameters<typeof fetch>[0], init?: RequestInit) =>
      undiciFetch(url as string, { ...init, dispatcher: agent } as Parameters<typeof undiciFetch>[1]) as unknown as ReturnType<typeof fetch>
  }
}

let fetchReady: Promise<void> | null = null

function ensureFetch(): Promise<void> {
  if (!fetchReady) fetchReady = initFetch()
  return fetchReady
}

function getToken(): string {
  const token = process.env.TMDB_API_READ_TOKEN
  if (!token || token === 'your_read_access_token_here') {
    throw new Error('请在 .env.local 中设置 TMDB_API_READ_TOKEN')
  }
  return token
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getToken()}`,
    Accept: 'application/json',
  }
}

export interface TmdbMovie {
  tmdb_id: number
  title: string
  poster_url: string
  overview: string
  release_date: string
  runtime: number
  rating: number
  genres: string[]
  cast: { name: string; character: string }[]
}

interface TmdbSearchResult {
  id: number
  title: string
  poster_path: string | null
  overview: string
  release_date: string
  genre_ids: number[]
  vote_average: number
}

interface TmdbMovieDetail {
  id: number
  title: string
  poster_path: string | null
  overview: string
  release_date: string
  runtime: number | null
  vote_average: number
  genres: { id: number; name: string }[]
  credits: { cast: { name: string; character: string; order: number }[] }
}

let genreMapCache: Map<number, string> | null = null

async function getGenreMap(language: string = 'zh-CN'): Promise<Map<number, string>> {
  if (genreMapCache) return genreMapCache

  await ensureFetch()
  const res = await _fetch(
    `${TMDB_BASE}/genre/movie/list?language=${language}`,
    { headers: authHeaders() }
  )

  if (!res.ok) return new Map()

  const data = await res.json()
  genreMapCache = new Map(
    data.genres.map((g: { id: number; name: string }) => [g.id, g.name])
  )
  return genreMapCache
}

function posterUrl(path: string | null): string {
  if (!path) return ''
  return `${TMDB_IMAGE_BASE}${path}`
}

export async function searchMovie(
  query: string,
  language: string = 'zh-CN'
): Promise<TmdbMovie[]> {
  if (!query.trim()) return []

  await ensureFetch()
  const res = await _fetch(
    `${TMDB_BASE}/search/movie?query=${encodeURIComponent(query)}&language=${language}&page=1`,
    { headers: authHeaders() }
  )

  if (!res.ok) {
    console.error('TMDB search error:', res.status, await res.text())
    return []
  }

  const data = await res.json()
  const results: TmdbSearchResult[] = data.results || []
  const genreMap = await getGenreMap(language)

  return results.slice(0, 10).map((item) => ({
    tmdb_id: item.id,
    title: item.title,
    poster_url: posterUrl(item.poster_path),
    overview: item.overview || '',
    release_date: item.release_date || '',
    runtime: 0,
    rating: Math.round(item.vote_average * 10) / 10,
    genres: item.genre_ids.map((gid) => genreMap.get(gid) || '').filter(Boolean),
    cast: [],
  }))
}

export async function getMovieByTmdbId(
  tmdbId: number,
  language: string = 'zh-CN'
): Promise<TmdbMovie | null> {
  await ensureFetch()
  const res = await _fetch(
    `${TMDB_BASE}/movie/${tmdbId}?language=${language}&append_to_response=credits`,
    { headers: authHeaders() }
  )

  if (!res.ok) {
    console.error('TMDB detail error:', res.status, await res.text())
    return null
  }

  const detail: TmdbMovieDetail = await res.json()

  const cast = (detail.credits?.cast || [])
    .sort((a, b) => a.order - b.order)
    .slice(0, 10)
    .map((c) => ({ name: c.name, character: c.character }))

  return {
    tmdb_id: detail.id,
    title: detail.title,
    poster_url: posterUrl(detail.poster_path),
    overview: detail.overview || '',
    release_date: detail.release_date || '',
    runtime: detail.runtime || 0,
    rating: Math.round(detail.vote_average * 10) / 10,
    genres: detail.genres.map((g) => g.name),
    cast,
  }
}
