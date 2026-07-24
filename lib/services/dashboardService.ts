import { PractitionerDashboardStats, ServiceResponse } from '../types';
import { getDashboardStatsData } from './mockData';

export async function getDashboardStats(): Promise<ServiceResponse<PractitionerDashboardStats>> {
  // Dynamically compute stats relative to today's date from mockData.ts
  return { data: getDashboardStatsData(), error: null };
}
