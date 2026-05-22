'use client'

import { useState, useEffect, useRef } from 'react'
import MovieCard from './MovieCard'

interface Movie {
  id: number
  title: string
  poster_url: string
  rating: number
  status: 'want_to_watch' | 'watched'
  release_date: string
}

async function fetchMoviesByFilter(filter: string) {
  const url = filter === 'all'
    ? '/api/movies'
    : `/api/movies?status=${filter}`
  const res = await fetch(url)
  return res.json()
}

export default function MovieGrid() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)
  const [mounted, setMounted] = useState(false)
  const hasData = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (hasData.current) {
      setSwitching(true)
    } else {
      setLoading(true)
    }

    fetchMoviesByFilter(filter).then((data) => {
      setMovies(data)
      setLoading(false)
      setSwitching(false)
      if (data.length > 0) hasData.current = true
    })
  }, [filter, mounted])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">📽️ 电影海报墙</h1>
        <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {[
            { value: 'all', label: '全部' },
            { value: 'watched', label: '已看' },
            { value: 'want_to_watch', label: '想看' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === value
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
          <svg className="w-16 h-16 mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
          </svg>
          <p className="text-lg">还没有电影，去添加吧！</p>
        </div>
      ) : (
        <div>
          {switching && (
            <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div className="h-full w-1/3 animate-[indeterminate_1s_ease-in-out_infinite] rounded-full bg-indigo-500" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} {...movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
