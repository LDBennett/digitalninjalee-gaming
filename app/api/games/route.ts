import { NextRequest } from 'next/server';
import { getGames, createGameHandler } from '@/src/Presentation/API/GamesController';

export const GET = (req: NextRequest) => getGames(req);
export const POST = (req: NextRequest) => createGameHandler(req);
