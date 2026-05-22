import { NextRequest, NextResponse } from 'next/server'
import { getMovieById, updateMovie, deleteMovie } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const movie = getMovieById(Number(id))
  if (!movie) {
    return NextResponse.json({ error: '电影不存在' }, { status: 404 })
  }
  return NextResponse.json(movie)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const updates: Record<string, unknown> = { ...body }
  if (body.genres && Array.isArray(body.genres)) {
    updates.genres = JSON.stringify(body.genres)
  }
  const movie = updateMovie(Number(id), updates)
  if (!movie) {
    return NextResponse.json({ error: '电影不存在' }, { status: 404 })
  }
  return NextResponse.json(movie)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = deleteMovie(Number(id))
  if (!deleted) {
    return NextResponse.json({ error: '电影不存在' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
