export class APIError extends Error {
  status: number;
  
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

export function handleError(error: Error | APIError) {
  if (error instanceof APIError) {
    return {
      message: error.message,
      status: error.status
    };
  }
  
  return {
    message: error.message || 'Internal Server Error',
    status: 500
  };
}