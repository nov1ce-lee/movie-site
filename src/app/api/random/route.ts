import { NextRequest, NextResponse } from 'next/server'
import { getRandomMovie } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') || undefined
  const movie = getRandomMovie(status)
  if (!movie) {
    return NextResponse.json({ error: '没有符合条件的电影' }, { status: 404 })
  }
  return NextResponse.json(movie)
}
