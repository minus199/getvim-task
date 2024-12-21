import { HttpStatus } from '@nestjs/common';

export class BaseError extends Error {
  constructor(
    message: string,
    readonly statusCode: number = HttpStatus.FORBIDDEN,
  ) {
    super(message);
  }
}

export class TooManyRequestsException extends BaseError {
  constructor() {
    super('Too many requests, try again later', HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class ExternalServerException extends BaseError {
  constructor() {
    super(
      'Sorry, service has issues - try again later',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class UserNotFound extends BaseError {
  constructor(id: string | number) {
    super(`user ${id} does not exists`, HttpStatus.FORBIDDEN);
  }
}
