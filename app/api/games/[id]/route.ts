import { NextRequest } from 'next/server';
import { getGameById, updateGame, deleteGame } from '@/src/Presentation/API/GamesController';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return getGameById(req, await params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return updateGame(req, await params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return deleteGame(req, await params);
}
