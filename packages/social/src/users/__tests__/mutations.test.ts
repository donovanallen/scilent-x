import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidationError, ConflictError } from '../../utils/errors';

const userFindUnique = vi.fn();
const userUpdate = vi.fn();

vi.mock('@scilent-one/db', () => ({
  db: {
    user: {
      findUnique: (...args: unknown[]) => userFindUnique(...args),
      update: (...args: unknown[]) => userUpdate(...args),
    },
  },
}));

const { updateProfile, checkUsernameAvailability } =
  await import('../mutations');

describe('updateProfile', () => {
  beforeEach(() => {
    userFindUnique.mockReset();
    userUpdate.mockReset();
  });

  it('throws ValidationError for an invalid username format', async () => {
    await expect(updateProfile('user-1', { username: '1bad' })).rejects.toThrow(
      ValidationError
    );
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it('throws ValidationError for a reserved username', async () => {
    await expect(
      updateProfile('user-1', { username: 'admin' })
    ).rejects.toThrow(ValidationError);
  });

  it('throws ConflictError when the username is already taken by someone else', async () => {
    userFindUnique.mockResolvedValue({ id: 'other-user' });

    await expect(
      updateProfile('user-1', { username: 'validname' })
    ).rejects.toThrow(ConflictError);
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it('allows keeping your own existing username', async () => {
    userFindUnique.mockResolvedValue({ id: 'user-1' });
    userUpdate.mockResolvedValue({ id: 'user-1', username: 'validname' });

    await updateProfile('user-1', { username: 'validname' });

    expect(userUpdate).toHaveBeenCalled();
  });

  it('allows clearing the username with an empty string', async () => {
    userUpdate.mockResolvedValue({ id: 'user-1', username: '' });

    await updateProfile('user-1', { username: '' });

    expect(userFindUnique).not.toHaveBeenCalled();
    expect(userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ username: '' }),
      })
    );
  });

  it('throws ValidationError when bio exceeds 500 characters', async () => {
    await expect(
      updateProfile('user-1', { bio: 'a'.repeat(501) })
    ).rejects.toThrow(ValidationError);
  });

  it('updates the profile with only the provided fields', async () => {
    userUpdate.mockResolvedValue({ id: 'user-1', name: 'New Name' });

    await updateProfile('user-1', { name: 'New Name' });

    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { name: 'New Name' },
      select: expect.any(Object),
    });
  });
});

describe('checkUsernameAvailability', () => {
  beforeEach(() => {
    userFindUnique.mockReset();
  });

  it('returns unavailable for an invalid format', async () => {
    const result = await checkUsernameAvailability('1bad');

    expect(result.available).toBe(false);
    expect(result.reason).toMatch(/3-30 characters/);
    expect(userFindUnique).not.toHaveBeenCalled();
  });

  it('returns unavailable for a reserved username', async () => {
    const result = await checkUsernameAvailability('settings');

    expect(result.available).toBe(false);
    expect(result.reason).toMatch(/reserved/);
  });

  it('returns unavailable when taken by someone else', async () => {
    userFindUnique.mockResolvedValue({ id: 'other-user' });

    const result = await checkUsernameAvailability('validname', 'user-1');

    expect(result.available).toBe(false);
    expect(result.reason).toMatch(/already taken/);
  });

  it('returns available when the username belongs to the current user', async () => {
    userFindUnique.mockResolvedValue({ id: 'user-1' });

    const result = await checkUsernameAvailability('validname', 'user-1');

    expect(result.available).toBe(true);
  });

  it('returns available when the username is unclaimed', async () => {
    userFindUnique.mockResolvedValue(null);

    const result = await checkUsernameAvailability('validname');

    expect(result.available).toBe(true);
    expect(result.reason).toBeUndefined();
  });
});
