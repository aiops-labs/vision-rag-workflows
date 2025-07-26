// Error class for internal server errors
export class InternalServerError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'InternalServerError';
    }
  }