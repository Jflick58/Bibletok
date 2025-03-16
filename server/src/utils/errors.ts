export class APIError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
  }
}

export const handleError = (err: any, res: any) => {
  const { statusCode = 500, message = 'Internal Server Error' } = err instanceof APIError 
    ? err 
    : { statusCode: 500, message: err.message || 'Internal Server Error' };
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
};