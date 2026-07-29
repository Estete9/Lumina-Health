import { ServiceResponse } from '../types';

export function handleServiceResponse<T>(data: T | null, error: any): ServiceResponse<T> {
  if (error) {
    console.error('Service error:', error);
    const errorMessage = typeof error === 'string' ? error : (error.message || 'An unexpected error occurred');
    return { data: null, error: errorMessage };
  }
  return { data, error: null };
}
