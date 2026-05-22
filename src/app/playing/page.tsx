import type { Metadata } from 'next';
import { PlayingView } from './PlayingView';

export const metadata: Metadata = { title: 'Currently Playing' };

export default function PlayingPage() {
  return <PlayingView />;
}
