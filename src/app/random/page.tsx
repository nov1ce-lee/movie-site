'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Movie {
  id: number
  title: string
  poster_url: string
  rating: number
  status: 'want_to_watch' | 'watched'
  overview: string
  runtime: number
  release_date: string
  genres: string
}

export default function RandomPage() {
  const [mode, setMode] = useState<string>('all')
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  const pickRandom = useCallback(async () => {
    setLoading(true)
    setError('')
    const url = mode === 'all' ? '/api/random' : `/api/random?status=${mode}`
    const res = await fetch(url)
    if (!res.ok) {
      setMovie(null)
      setError('池子里还没有电影，快去添加吧！')
    } else {
      const data = await res.json()
      setMovie(data)
    }
    setLoading(false)
  }, [mode])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    pickRandom()
  }, [pickRandom, mounted])

  const genres: string[] = movie?.genres ? (() => { try { return JSON.parse(movie.genres) } catch { return [] } })() : []

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100 text-center">🎲 今天看什么？</h1>

      <div className="mb-6 flex justify-center">
        <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {[
            { value: 'all', label: '全部' },
            { value: 'watched', label: '已看' },
            { value: 'want_to_watch', label: '想看' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setMode(value); setMovie(null); setError('') }}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                mode === value
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-400 text-lg">{error}</p>
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-500" />
          <p className="mt-4 text-zinc-400">抽选中...</p>
        </div>
      )}

      {movie && !loading && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex gap-6">
            {movie.poster_url ? (
              <img src={movie.poster_url} alt={movie.title} className="h-56 w-40 shrink-0 rounded-lg object-cover shadow-md" />
            ) : (
              <div className="flex h-56 w-40 shrink-0 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-700">
                <svg className="w-12 h-12 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Link href={`/movie/${movie.id}`} className="text-xl font-bold text-zinc-900 hover:text-indigo-500 dark:text-zinc-100 dark:hover:text-indigo-400 transition-colors">
                {movie.title}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                {movie.release_date?.slice(0, 4) && <span>{movie.release_date.slice(0, 4)}</span>}
                {movie.runtime > 0 && <span>{movie.runtime} 分钟</span>}
                {movie.rating > 0 && (
                  <span className="flex items-center gap-0.5 text-yellow-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {movie.rating}
                  </span>
                )}
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  movie.status === 'watched' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400'
                }`}>
                  {movie.status === 'watched' ? '已看' : '想看'}
                </span>
              </div>
              {genres.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {genres.map((g) => (
                    <span key={g} className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {g}
                    </span>
                  ))}
                </div>
              )}
              {movie.overview && (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">{movie.overview}</p>
              )}
            </div>
          </div>
          <button
            onClick={pickRandom}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-indigo-500 py-3 text-base font-medium text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            🎲 再抽一次
          </button>
        </div>
      )}
    </div>
  )
}
