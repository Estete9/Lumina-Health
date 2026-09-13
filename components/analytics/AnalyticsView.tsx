'use client';

import { PractitionerAnalytics } from '@/lib/types';
import { PsychologyPracticeDashboard } from './PsychologyPracticeDashboard';

interface AnalyticsViewProps {
  data: PractitionerAnalytics;
}

export function AnalyticsView({ data }: AnalyticsViewProps) {
  return <PsychologyPracticeDashboard data={data} />;
}
