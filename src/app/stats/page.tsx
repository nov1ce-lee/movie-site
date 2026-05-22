'use client'

import { useState, useEffect } from 'react'

interface Stats {
  total: number
  watched: number
  wantToWatch: number
  totalRuntime: number
  watchedRuntime: number
  avgRating: number
  genreDistribution: { genre: string; count: number }[]
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const hours = Math.floor(stats.totalRuntime / 60)
  const mins = stats.totalRuntime % 60
  const wHours = Math.floor(stats.watchedRuntime / 60)
  const wMins = stats.watchedRuntime % 60

  const maxGenreCount = Math.max(...stats.genreDistribution.map((g) => g.count), 1)

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">📊 统计面板</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">电影总数</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">已看</p>
          <p className="mt-1 text-3xl font-bold text-green-500">{stats.watched}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">想看</p>
          <p className="mt-1 text-3xl font-bold text-indigo-500">{stats.wantToWatch}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">平均评分</p>
          <p className="mt-1 text-3xl font-bold text-yellow-500">{stats.avgRating || '-'}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">🎬 观影时长</h2>
          {stats.totalRuntime > 0 ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">全部电影</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {hours}<span className="text-lg font-normal text-zinc-500">h</span> {mins}<span className="text-lg font-normal text-zinc-500">min</span>
                </p>
              </div>
              {stats.watchedRuntime > 0 && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">其中已看</p>
                  <p className="text-2xl font-bold text-green-500">
                    {wHours}<span className="text-base font-normal text-green-400">h</span> {wMins}<span className="text-base font-normal text-green-400">min</span>
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    相当于 {(stats.watchedRuntime / 60 / 24).toFixed(1)} 天
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-zinc-400 dark:text-zinc-500">暂未添加电影时长数据</p>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">🏷️ 类型分布</h2>
          {stats.genreDistribution.length > 0 ? (
            <div className="space-y-3">
              {stats.genreDistribution.map(({ genre, count }) => (
                <div key={genre} className="flex items-center gap-3">
                  <span className="w-12 text-xs font-medium text-zinc-600 dark:text-zinc-400 shrink-0">{genre}</span>
                  <div className="flex-1 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${(count / maxGenreCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 w-5 text-right">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400 dark:text-zinc-500">暂无数据</p>
          )}
        </div>
      </div>
    </div>
  )
}
