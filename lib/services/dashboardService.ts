import { PractitionerDashboardStats, ServiceResponse } from '../types';
import { getDashboardStatsData } from './mockData';

export async function getDashboardStats(practitionerId: string = 'prac-1'): Promise<ServiceResponse<PractitionerDashboardStats>> {
  // Dynamically compute stats relative to today's date from mockData.ts
  return { data: getDashboardStatsData(), error: null };
}
