'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface TmdbMovie {
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

export default function AddMoviePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TmdbMovie[]>([])
  const [selected, setSelected] = useState<TmdbMovie | null>(null)
  const [searching, setSearching] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [status, setStatus] = useState<'want_to_watch' | 'watched'>('watched')

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setSearching(true)
    setSearchError('')
    setResults([])
    setSelected(null)
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (!res.ok) {
        setSearchError(data.error || '搜索失败，请检查网络连接')
      } else {
        setResults(Array.isArray(data) ? data : [])
        if (Array.isArray(data) && data.length === 0) {
          setSearchError('未找到相关电影')
        }
      }
    } catch {
      setSearchError('网络请求失败，请检查网络连接')
    }
    setSearching(false)
  }, [query])

  const loadDetail = async (movie: TmdbMovie) => {
    setLoadingDetail(true)
    try {
      const res = await fetch(`/api/tmdb/detail/${movie.tmdb_id}`)
      if (res.ok) {
        const detail = await res.json()
        setSelected(detail)
      } else {
        setSelected(movie)
      }
    } catch {
      setSelected(movie)
    }
    setLoadingDetail(false)
  }

  const handleSubmit = async () => {
    if (!selected) return
    setSubmitting(true)
    const res = await fetch('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: selected.title,
        poster_url: selected.poster_url,
        overview: selected.overview,
        release_date: selected.release_date,
        runtime: selected.runtime,
        rating: selected.rating,
        genres: selected.genres,
        cast: selected.cast || [],
        status,
        tmdb_id: selected.tmdb_id,
      }),
    })
    if (res.ok) {
      router.push('/')
      router.refresh()
    }
    setSubmitting(false)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">➕ 添加电影</h1>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">搜索电影名称</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="输入电影名搜索..."
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="rounded-lg bg-indigo-500 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
          >
            {searching ? '搜索中...' : '搜索'}
          </button>
        </div>

        {searchError && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {searchError}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div>
          {results.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  共找到 {results.length} 部电影，点击查看详情
                </p>
              </div>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {results.map((movie) => (
                  <button
                    key={movie.tmdb_id}
                    onClick={() => loadDetail(movie)}
                    className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700/50 ${
                      selected?.tmdb_id === movie.tmdb_id
                        ? 'bg-indigo-50 border-l-4 border-l-indigo-500 dark:bg-indigo-900/20'
                        : ''
                    }`}
                  >
                    {movie.poster_url ? (
                      <img src={movie.poster_url} alt="" className="h-24 w-16 shrink-0 rounded-lg object-cover shadow-sm" />
                    ) : (
                      <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-700">
                        <svg className="w-6 h-6 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-base font-semibold truncate ${
                        selected?.tmdb_id === movie.tmdb_id
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}>
                        {movie.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {movie.release_date?.slice(0, 4) && <span>{movie.release_date.slice(0, 4)}</span>}
                        <span className="flex items-center gap-0.5">
                          <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          {movie.rating}
                        </span>
                      </div>
                      {movie.genres.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {movie.genres.slice(0, 3).map((g) => (
                            <span key={g} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                              {g}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {searching && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl p-4 animate-pulse">
                  <div className="h-24 w-16 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {loadingDetail ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-18 flex items-center justify-center dark:border-zinc-700 dark:bg-zinc-800">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-500" />
                <p className="mt-3 text-sm text-zinc-400">加载电影详情...</p>
              </div>
            </div>
          ) : selected ? (
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 sticky top-24">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  {selected.poster_url ? (
                    <img
                      src={selected.poster_url}
                      alt={selected.title}
                      className="h-72 w-48 shrink-0 rounded-xl object-cover shadow-lg sm:h-80 sm:w-56"
                    />
                  ) : (
                    <div className="flex h-72 w-48 shrink-0 items-center justify-center rounded-xl bg-zinc-200 dark:bg-zinc-700 sm:h-80 sm:w-56">
                      <svg className="w-12 h-12 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 flex flex-col">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{selected.title}</h2>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-base text-zinc-500 dark:text-zinc-400">
                      {selected.release_date?.slice(0, 4) && <span>{selected.release_date.slice(0, 4)}</span>}
                      {selected.runtime > 0 && <span>{selected.runtime} 分钟</span>}
                      <span className="flex items-center gap-1">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{selected.rating}</span>
                      </span>
                    </div>

                    {selected.genres.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selected.genres.map((g) => (
                          <span key={g} className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    {selected.overview && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">简介</h3>
                        <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">{selected.overview}</p>
                      </div>
                    )}

                    {selected.cast && selected.cast.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">演员</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {selected.cast.slice(0, 8).map((c) => (
                            <span key={c.name} className="text-sm text-zinc-600 dark:text-zinc-400">
                              {c.name}
                              {c.character && <span className="text-zinc-400 dark:text-zinc-500"> 饰 {c.character}</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex items-center gap-4">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 shrink-0">
                        标记为：
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'want_to_watch' | 'watched')}
                        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                      >
                        <option value="watched">✅ 已看</option>
                        <option value="want_to_watch">📌 想看</option>
                      </select>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="mt-5 w-full rounded-lg bg-indigo-500 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
                    >
                      {submitting ? '添加中...' : '加入我的电影库'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white/50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-800/30">
              <svg className="mx-auto w-16 h-16 text-zinc-300 dark:text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
              </svg>
              <p className="mt-4 text-base text-zinc-400 dark:text-zinc-500">
                搜索电影后，点击左侧列表中的电影即可查看详情
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
