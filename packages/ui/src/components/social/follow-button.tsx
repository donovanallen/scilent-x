'use client';

import * as React from 'react';
import { UserPlus, UserMinus, Check } from 'lucide-react';
import { Button, type ButtonProps } from '../button';
import { cn } from '../../utils';

export interface FollowButtonProps extends Omit<ButtonProps, 'onClick'> {
  isFollowing: boolean;
  isLoading?: boolean;
  onFollow: () => void | Promise<void>;
  onUnfollow: () => void | Promise<void>;
}

export function FollowButton({
  isFollowing,
  isLoading = false,
  onFollow,
  onUnfollow,
  className,
  ...props
}: FollowButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = async () => {
    if (isFollowing) {
      await onUnfollow();
    } else {
      await onFollow();
    }
  };

  if (isFollowing) {
    return (
      <Button
        variant={isHovered ? 'destructive' : 'outline'}
        className={cn('min-w-[100px]', className)}
        disabled={isLoading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        {...props}
      >
        {isLoading ? (
          'Loading...'
        ) : isHovered ? (
          <>
            <UserMinus className='mr-2 h-4 w-4' />
            Unfollow
          </>
        ) : (
          <>
            <Check className='mr-2 h-4 w-4' />
            Following
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      className={cn('min-w-[100px]', className)}
      disabled={isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        'Loading...'
      ) : (
        <>
          <UserPlus className='mr-2 h-4 w-4' />
          Follow
        </>
      )}
    </Button>
  );
}
