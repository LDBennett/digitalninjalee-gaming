import { NextRequest } from 'next/server';
import { pickRandomGame } from '@/src/Presentation/API/GamesController';

export const GET = (req: NextRequest) => pickRandomGame(req);
