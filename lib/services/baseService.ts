import { ServiceResponse } from '../types';

export function handleServiceResponse<T>(data: T | null, error: any): ServiceResponse<T> {
  if (error) {
    console.error('Service error:', error);
    return { data: null, error: error.message || 'An unexpected error occurred' };
  }
  return { data, error: null };
}
