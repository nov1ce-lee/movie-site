import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    const dbDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }
    const dbPath = path.join(dbDir, 'movies.db')
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    initDb(db)
  }
  return db
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      poster_url TEXT DEFAULT '',
      overview TEXT DEFAULT '',
      release_date TEXT DEFAULT '',
      runtime INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      genres TEXT DEFAULT '[]',
      cast TEXT DEFAULT '[]',
      status TEXT DEFAULT 'want_to_watch' CHECK(status IN ('want_to_watch', 'watched')),
      personal_note TEXT DEFAULT '',
      tmdb_id INTEGER,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)

  const cols = db.prepare("PRAGMA table_info('movies')").all() as { name: string }[]
  if (!cols.some((c) => c.name === 'cast')) {
    db.exec("ALTER TABLE movies ADD COLUMN cast TEXT DEFAULT '[]'")
  }
}

export interface Movie {
  id: number
  title: string
  poster_url: string
  overview: string
  release_date: string
  runtime: number
  rating: number
  genres: string
  cast: string
  status: 'want_to_watch' | 'watched'
  personal_note: string
  tmdb_id: number | null
  created_at: string
  updated_at: string
}

export function getAllMovies(): Movie[] {
  const db = getDb()
  return db.prepare('SELECT * FROM movies ORDER BY created_at DESC').all() as Movie[]
}

export function getMoviesByStatus(status: string): Movie[] {
  const db = getDb()
  return db.prepare('SELECT * FROM movies WHERE status = ? ORDER BY created_at DESC').all(status) as Movie[]
}

export function getMovieById(id: number): Movie | undefined {
  const db = getDb()
  return db.prepare('SELECT * FROM movies WHERE id = ?').get(id) as Movie | undefined
}

export function createMovie(movie: Omit<Movie, 'id' | 'created_at' | 'updated_at'>): Movie {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO movies (title, poster_url, overview, release_date, runtime, rating, genres, cast, status, personal_note, tmdb_id)
    VALUES (@title, @poster_url, @overview, @release_date, @runtime, @rating, @genres, @cast, @status, @personal_note, @tmdb_id)
  `)
  const info = stmt.run(movie)
  return getMovieById(info.lastInsertRowid as number)!
}

export function updateMovie(id: number, updates: Partial<Movie>): Movie | undefined {
  const db = getDb()
  const existing = getMovieById(id)
  if (!existing) return undefined

  const fields = Object.keys(updates).filter(
    (k) => k !== 'id' && k !== 'created_at'
  )
  if (fields.length === 0) return existing

  const setClauses = fields.map((f) => `${f} = @${f}`).join(', ')
  const stmt = db.prepare(`UPDATE movies SET ${setClauses}, updated_at = datetime('now', 'localtime') WHERE id = @id`)
  stmt.run({ ...updates, id })
  return getMovieById(id)
}

export function deleteMovie(id: number): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM movies WHERE id = ?').run(id)
  return result.changes > 0
}

export interface MovieStats {
  total: number
  watched: number
  wantToWatch: number
  totalRuntime: number
  watchedRuntime: number
  avgRating: number
  genreDistribution: { genre: string; count: number }[]
}

export function getStats(): MovieStats {
  const db = getDb()
  const total = (db.prepare('SELECT COUNT(*) as count FROM movies').get() as { count: number }).count
  const watched = (db.prepare("SELECT COUNT(*) as count FROM movies WHERE status = 'watched'").get() as { count: number }).count
  const wantToWatch = (db.prepare("SELECT COUNT(*) as count FROM movies WHERE status = 'want_to_watch'").get() as { count: number }).count
  const allRuntimeRow = db.prepare('SELECT COALESCE(SUM(runtime), 0) as total FROM movies').get() as { total: number }
  const watchedRuntimeRow = db.prepare("SELECT COALESCE(SUM(runtime), 0) as total FROM movies WHERE status = 'watched'").get() as { total: number }
  const ratingRow = db.prepare("SELECT COALESCE(AVG(rating), 0) as avg FROM movies WHERE status = 'watched' AND rating > 0").get() as { avg: number }

  const movies = db.prepare('SELECT genres FROM movies').all() as { genres: string }[]
  const genreMap: Record<string, number> = {}
  movies.forEach((m) => {
    try {
      const genres: string[] = JSON.parse(m.genres)
      genres.forEach((g) => {
        genreMap[g] = (genreMap[g] || 0) + 1
      })
    } catch {}
  })
  const genreDistribution = Object.entries(genreMap)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)

  return {
    total,
    watched,
    wantToWatch,
    totalRuntime: allRuntimeRow.total,
    watchedRuntime: watchedRuntimeRow.total,
    avgRating: Math.round(ratingRow.avg * 10) / 10,
    genreDistribution,
  }
}

export function getRandomMovie(status?: string): Movie | undefined {
  const db = getDb()
  if (status) {
    const movie = db.prepare('SELECT * FROM movies WHERE status = ? ORDER BY RANDOM() LIMIT 1').get(status) as Movie | undefined
    return movie
  }
  const movie = db.prepare('SELECT * FROM movies ORDER BY RANDOM() LIMIT 1').get() as Movie | undefined
  return movie
}

export function searchMovies(query: string): Movie[] {
  const db = getDb()
  return db.prepare('SELECT * FROM movies WHERE title LIKE ? ORDER BY created_at DESC').all(`%${query}%`) as Movie[]
}
