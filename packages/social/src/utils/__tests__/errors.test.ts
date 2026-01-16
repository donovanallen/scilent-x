import { describe, it, expect } from 'vitest';
import {
  SocialError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
} from '../errors';

describe('SocialError', () => {
  it('creates error with message, code, and default statusCode', () => {
    const error = new SocialError('Something went wrong', 'GENERIC_ERROR');

    expect(error.message).toBe('Something went wrong');
    expect(error.code).toBe('GENERIC_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('SocialError');
  });

  it('creates error with custom statusCode', () => {
    const error = new SocialError('Server error', 'INTERNAL', 500);

    expect(error.statusCode).toBe(500);
  });

  it('is an instance of Error', () => {
    const error = new SocialError('Test', 'TEST');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SocialError);
  });

  it('has proper stack trace', () => {
    const error = new SocialError('Test', 'TEST');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('SocialError');
  });
});

describe('NotFoundError', () => {
  it('creates 404 error with resource name', () => {
    const error = new NotFoundError('User');

    expect(error.message).toBe('User not found');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('NotFoundError');
  });

  it('is an instance of SocialError', () => {
    const error = new NotFoundError('Post');

    expect(error).toBeInstanceOf(SocialError);
    expect(error).toBeInstanceOf(Error);
  });

  it('formats different resource names', () => {
    expect(new NotFoundError('Post').message).toBe('Post not found');
    expect(new NotFoundError('Comment').message).toBe('Comment not found');
    expect(new NotFoundError('Follow relationship').message).toBe('Follow relationship not found');
  });
});

describe('UnauthorizedError', () => {
  it('creates 401 error with default message', () => {
    const error = new UnauthorizedError();

    expect(error.message).toBe('Unauthorized');
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe('UnauthorizedError');
  });

  it('creates error with custom message', () => {
    const error = new UnauthorizedError('Invalid token');

    expect(error.message).toBe('Invalid token');
  });

  it('is an instance of SocialError', () => {
    const error = new UnauthorizedError();

    expect(error).toBeInstanceOf(SocialError);
  });
});

describe('ForbiddenError', () => {
  it('creates 403 error with default message', () => {
    const error = new ForbiddenError();

    expect(error.message).toBe('Forbidden');
    expect(error.code).toBe('FORBIDDEN');
    expect(error.statusCode).toBe(403);
    expect(error.name).toBe('ForbiddenError');
  });

  it('creates error with custom message', () => {
    const error = new ForbiddenError('You do not have permission to edit this post');

    expect(error.message).toBe('You do not have permission to edit this post');
  });

  it('is an instance of SocialError', () => {
    const error = new ForbiddenError();

    expect(error).toBeInstanceOf(SocialError);
  });
});

describe('ValidationError', () => {
  it('creates 400 error with message', () => {
    const error = new ValidationError('Content is required');

    expect(error.message).toBe('Content is required');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('ValidationError');
  });

  it('is an instance of SocialError', () => {
    const error = new ValidationError('Invalid input');

    expect(error).toBeInstanceOf(SocialError);
  });

  it('handles various validation messages', () => {
    expect(new ValidationError('Username must be at least 3 characters').message)
      .toBe('Username must be at least 3 characters');
    expect(new ValidationError('Bio cannot exceed 500 characters').message)
      .toBe('Bio cannot exceed 500 characters');
  });
});

describe('ConflictError', () => {
  it('creates 409 error with message', () => {
    const error = new ConflictError('Username already taken');

    expect(error.message).toBe('Username already taken');
    expect(error.code).toBe('CONFLICT');
    expect(error.statusCode).toBe(409);
    expect(error.name).toBe('ConflictError');
  });

  it('is an instance of SocialError', () => {
    const error = new ConflictError('Duplicate entry');

    expect(error).toBeInstanceOf(SocialError);
  });

  it('handles various conflict scenarios', () => {
    expect(new ConflictError('Already following this user').message)
      .toBe('Already following this user');
    expect(new ConflictError('Post already liked').message)
      .toBe('Post already liked');
  });
});

describe('error inheritance chain', () => {
  it('all custom errors inherit from SocialError', () => {
    const errors = [
      new NotFoundError('Resource'),
      new UnauthorizedError(),
      new ForbiddenError(),
      new ValidationError('Invalid'),
      new ConflictError('Conflict'),
    ];

    for (const error of errors) {
      expect(error).toBeInstanceOf(SocialError);
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('errors can be caught by SocialError type', () => {
    const throwNotFound = () => {
      throw new NotFoundError('User');
    };

    expect(throwNotFound).toThrow(SocialError);
  });

  it('errors preserve instanceof checks', () => {
    try {
      throw new NotFoundError('User');
    } catch (error) {
      expect(error instanceof NotFoundError).toBe(true);
      expect(error instanceof SocialError).toBe(true);
      expect(error instanceof Error).toBe(true);
    }
  });
});
