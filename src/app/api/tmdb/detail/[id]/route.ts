import { NextResponse } from 'next/server'
import { getMovieByTmdbId } from '@/lib/tmdb'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const movie = await getMovieByTmdbId(Number(id))
    if (!movie) {
      return NextResponse.json({ error: '电影未找到' }, { status: 404 })
    }
    return NextResponse.json(movie)
  } catch {
    return NextResponse.json({ error: '获取电影详情失败' }, { status: 500 })
  }
}
