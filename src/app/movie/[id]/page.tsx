'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface MovieDetail {
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

export default function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setLoading(true)
    fetch(`/api/movies/${id}`)
      .then((res) => {
        if (!res.ok) {
          router.push('/')
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data) {
          setMovie(data)
          setNote(data.personal_note || '')
        }
        setLoading(false)
      })
  }, [id, mounted, router])

  async function toggleStatus() {
    if (!movie) return
    const newStatus = movie.status === 'watched' ? 'want_to_watch' : 'watched'
    const res = await fetch(`/api/movies/${movie.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const updated = await res.json()
      setMovie(updated)
    }
  }

  async function saveNote() {
    if (!movie) return
    setSaving(true)
    const res = await fetch(`/api/movies/${movie.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personal_note: note }),
    })
    if (res.ok) {
      const updated = await res.json()
      setMovie(updated)
      setEditing(false)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!movie || !confirm('确定要删除这部电影吗？')) return
    setDeleting(true)
    const res = await fetch(`/api/movies/${movie.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/')
      router.refresh()
    }
    setDeleting(false)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start animate-pulse">
          <div className="h-96 w-64 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex-1 space-y-3">
            <div className="h-10 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-5 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    )
  }

  if (!movie) return null

  const genres: string[] = (() => {
    try { return JSON.parse(movie.genres) } catch { return [] }
  })()

  const cast: { name: string; character: string }[] = (() => {
    try { return JSON.parse(movie.cast || '[]') } catch { return [] }
  })()

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        返回电影库
      </Link>

      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
        <div className="shrink-0">
          {movie.poster_url ? (
            <img src={movie.poster_url} alt={movie.title} className="w-56 rounded-xl shadow-lg sm:w-64" />
          ) : (
            <div className="flex h-96 w-56 items-center justify-center rounded-xl bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 sm:w-64">
              <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 w-full">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{movie.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-base text-zinc-500 dark:text-zinc-400">
            {movie.release_date?.slice(0, 4) && <span>{movie.release_date.slice(0, 4)}</span>}
            {movie.runtime > 0 && <span>{movie.runtime} 分钟</span>}
            {movie.rating > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{movie.rating}</span>
              </span>
            )}
          </div>

          {genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {genres.map((g) => (
                <span key={g} className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
                  {g}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center gap-4">
            <button
              onClick={toggleStatus}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                movie.status === 'watched'
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
              }`}
            >
              {movie.status === 'watched' ? '✅ 已看' : '📌 想看'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              🗑️ 删除
            </button>
          </div>

          {movie.overview && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">简介</h3>
              <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                {movie.overview}
              </p>
            </div>
          )}

          {cast.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">演员</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {cast.map((c) => (
                  <span key={c.name} className="text-sm text-zinc-600 dark:text-zinc-400">
                    {c.name}
                    {c.character && <span className="text-zinc-400 dark:text-zinc-500"> 饰 {c.character}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">📝 个人笔记</label>
              {!editing && (
                <button onClick={() => setEditing(true)} className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400">
                  编辑
                </button>
              )}
            </div>
            {editing ? (
              <div className="space-y-3">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="写下你的想法..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveNote}
                    disabled={saving}
                    className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setNote(movie.personal_note || '') }}
                    className="rounded-lg px-5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <p className="rounded-lg bg-zinc-50 px-5 py-4 text-sm text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400 min-h-[3rem]">
                {movie.personal_note || '暂无笔记'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
