import { NextRequest, NextResponse } from 'next/server'
import { getAllMovies, getMoviesByStatus, createMovie, searchMovies } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  if (search) {
    const movies = searchMovies(search)
    return NextResponse.json(movies)
  }

  if (status) {
    const movies = getMoviesByStatus(status)
    return NextResponse.json(movies)
  }

  const movies = getAllMovies()
  return NextResponse.json(movies)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const movie = createMovie({
    title: body.title,
    poster_url: body.poster_url || '',
    overview: body.overview || '',
    release_date: body.release_date || '',
    runtime: body.runtime || 0,
    rating: body.rating || 0,
    genres: typeof body.genres === 'string' ? body.genres : JSON.stringify(body.genres || []),
    cast: typeof body.cast === 'string' ? body.cast : JSON.stringify(body.cast || []),
    status: body.status || 'want_to_watch',
    personal_note: body.personal_note || '',
    tmdb_id: body.tmdb_id || null,
  })
  return NextResponse.json(movie, { status: 201 })
}
