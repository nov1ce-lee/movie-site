import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          <svg className="w-7 h-7 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
          </svg>
          我的电影库
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/random"
            className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            🎲 随机抽选
          </Link>
          <Link
            href="/add"
            className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            ➕ 添加电影
          </Link>
          <Link
            href="/stats"
            className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            📊 统计
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
