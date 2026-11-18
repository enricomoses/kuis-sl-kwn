import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { ROUTES } from '@/constants/routes.constant';
import { GameError } from '@/features/game/errors.server';
import { getPlayerGameState } from '@/features/play/service.server';
import type { PlayerState } from '@/types/game';
import { PlayView } from './_components/play-view';
import PlayLoading from './loading';

async function PlayContent() {
  await connection();
  let initialState: PlayerState | undefined;
  try {
    initialState = await getPlayerGameState();
  } catch (error) {
    if (error instanceof GameError && error.code === 'NOT_JOINED') {
      redirect(ROUTES.HOME);
    }
  }
  return <PlayView initialState={initialState} />;
}

export default function PlayPage() {
  return (
    <Suspense fallback={<PlayLoading />}>
      <PlayContent />
    </Suspense>
  );
}
