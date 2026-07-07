'use client';

import * as React from 'react';
import { UserPlus, UserMinus, Check, Loader2 } from 'lucide-react';
import { Button, type ButtonProps } from '../button';
import { cn } from '../../utils';

export interface FollowButtonProps extends Omit<ButtonProps, 'onClick'> {
  isFollowing: boolean;
  isLoading?: boolean;
  iconOnly?: boolean;
  onFollow: () => void | Promise<void>;
  onUnfollow: () => void | Promise<void>;
}

export function FollowButton({
  isFollowing,
  isLoading = false,
  iconOnly = false,
  onFollow,
  onUnfollow,
  className,
  size,
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

  const iconClass = iconOnly ? 'h-4 w-4' : 'mr-2 h-4 w-4';
  const buttonSize = iconOnly ? 'icon' : size;

  // Get accessible label for icon-only buttons
  const getAriaLabel = () => {
    if (!iconOnly) return undefined;
    if (isLoading) return 'Loading';
    if (isFollowing) return isHovered ? 'Unfollow' : 'Following';
    return 'Follow';
  };

  if (isFollowing) {
    return (
      <Button
        variant={isHovered ? 'destructive' : 'outline'}
        size={buttonSize}
        className={cn(!iconOnly && 'min-w-[100px]', className)}
        disabled={isLoading}
        aria-label={getAriaLabel()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        {...props}
      >
        {isLoading ? (
          iconOnly ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Loading...'
          )
        ) : isHovered ? (
          <>
            <UserMinus className={iconClass} />
            {!iconOnly && 'Unfollow'}
          </>
        ) : (
          <>
            <Check className={iconClass} />
            {!iconOnly && 'Following'}
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      size={buttonSize}
      className={cn(!iconOnly && 'min-w-[100px]', className)}
      disabled={isLoading}
      aria-label={getAriaLabel()}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        iconOnly ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Loading...'
        )
      ) : (
        <>
          <UserPlus className={iconClass} />
          {!iconOnly && 'Follow'}
        </>
      )}
    </Button>
  );
}
