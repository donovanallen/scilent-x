'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Textarea,
  UserAvatar,
} from '@scilent-one/ui';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  image: string | null;
  email: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Fetch current user
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/v1/users/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const user = await res.json();
        setProfile(user);
        setName(user.name || '');
        setUsername(user.username || '');
        setBio(user.bio || '');
        setAvatarUrl(user.avatarUrl || '');
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  // Check username availability
  useEffect(() => {
    if (!username || username === profile?.username) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await fetch(
          `/api/v1/users/search?q=${encodeURIComponent(username)}&limit=1`
        );
        if (res.ok) {
          const data = await res.json();
          const taken = data.items.some(
            (u: { username: string }) =>
              u.username?.toLowerCase() === username.toLowerCase()
          );
          setUsernameAvailable(!taken);
        }
      } catch (error) {
        console.error('Failed to check username:', error);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, profile?.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || null,
          username: username || null,
          bio: bio || null,
          avatarUrl: avatarUrl || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      toast.success('Profile updated!');

      if (updatedProfile.username) {
        router.push(`/profile/${updatedProfile.username}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    name !== (profile?.name || '') ||
    username !== (profile?.username || '') ||
    bio !== (profile?.bio || '') ||
    avatarUrl !== (profile?.avatarUrl || '');

  if (isLoading) {
    return (
      <div className='container max-w-2xl py-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-center h-64'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container max-w-2xl py-6 space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='sm' onClick={() => router.back()}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <h1 className='text-xl font-bold'>Edit Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your public profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Avatar Preview */}
            <div className='flex items-center gap-4'>
              <UserAvatar
                name={name || username}
                username={username}
                avatarUrl={avatarUrl || profile?.image}
                size='xl'
              />
              <div className='flex-1'>
                <Label htmlFor='avatarUrl'>Avatar URL</Label>
                <Input
                  id='avatarUrl'
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder='https://example.com/avatar.jpg'
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  Enter a URL to your avatar image
                </p>
              </div>
            </div>

            {/* Name */}
            <div className='space-y-2'>
              <Label htmlFor='name'>Display Name</Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Your name'
                maxLength={100}
              />
            </div>

            {/* Username */}
            <div className='space-y-2'>
              <Label htmlFor='username'>Username</Label>
              <div className='relative'>
                <Input
                  id='username'
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))
                  }
                  placeholder='username'
                  maxLength={30}
                  className='pr-10'
                />
                {isCheckingUsername && (
                  <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground' />
                )}
                {!isCheckingUsername && usernameAvailable === true && (
                  <Check className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500' />
                )}
              </div>
              <p className='text-xs text-muted-foreground'>
                Must be 3-30 characters, start with a letter, and contain only
                letters, numbers, and underscores
              </p>
              {usernameAvailable === false && (
                <p className='text-xs text-destructive'>
                  This username is already taken
                </p>
              )}
            </div>

            {/* Bio */}
            <div className='space-y-2'>
              <Label htmlFor='bio'>Bio</Label>
              <Textarea
                id='bio'
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder='Tell us about yourself'
                maxLength={500}
                rows={4}
              />
              <p className='text-xs text-muted-foreground text-right'>
                {bio.length}/500
              </p>
            </div>

            {/* Submit Button */}
            <div className='flex justify-end gap-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={
                  isSaving || !hasChanges || usernameAvailable === false
                }
              >
                {isSaving ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
