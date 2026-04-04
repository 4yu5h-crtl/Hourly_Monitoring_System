export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function validateDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
}

export function validateShiftId(shiftId: number): boolean {
  return [1, 2, 3].includes(shiftId);
}

export function validateString(value: any, min = 1, max = 255): boolean {
  return typeof value === 'string' && value.length >= min && value.length <= max;
}

export function validateId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);
}

export function validateNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value);
}

export function handleError(error: any, defaultMessage = 'Internal server error') {
  if (error instanceof ApiError) {
    return { statusCode: error.statusCode, message: error.message };
  }
  console.error('Error:', error);
  return { statusCode: 500, message: defaultMessage };
}
