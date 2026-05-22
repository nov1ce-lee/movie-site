import Link from 'next/link'

interface MovieCardProps {
  id: number
  title: string
  poster_url: string
  rating: number
  status: string
  release_date: string
}

export default function MovieCard({ id, title, poster_url, rating, status, release_date }: MovieCardProps) {
  const year = release_date ? release_date.slice(0, 4) : ''

  return (
    <Link
      href={`/movie/${id}`}
      className="group relative block overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 transition-transform hover:scale-[1.02] hover:shadow-xl"
    >
      {poster_url ? (
        <img
          src={poster_url}
          alt={title}
          className="w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex aspect-[2/3] items-center justify-center bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
          </svg>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-10">
        <h3 className="text-sm font-semibold text-white leading-tight">{title}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-300">
          {year && <span>{year}</span>}
          {rating > 0 && (
            <span className="flex items-center gap-0.5">
              <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {rating}
            </span>
          )}
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
            status === 'watched' ? 'bg-green-500/80 text-white' : 'bg-indigo-500/80 text-white'
          }`}>
            {status === 'watched' ? '已看' : '想看'}
          </span>
        </div>
      </div>
    </Link>
  )
}
