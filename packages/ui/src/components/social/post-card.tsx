'use client';

import * as React from 'react';
import { Heart, MessageCircle, MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../card';
import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { UserAvatar } from './user-avatar';
import { MentionText } from './mention-text';
import { cn } from '../../utils';

export interface PostCardAuthor {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  image: string | null;
}

export interface PostCardProps {
  id: string;
  content: string;
  author: PostCardAuthor;
  createdAt: Date | string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isOwner?: boolean;
  onLike?: () => void;
  onUnlike?: () => void;
  onComment?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
}

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

  return then.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function PostCard({
  id,
  content,
  author,
  createdAt,
  likesCount,
  commentsCount,
  isLiked = false,
  isOwner = false,
  onLike,
  onUnlike,
  onComment,
  onEdit,
  onDelete,
  onClick,
  className,
}: PostCardProps) {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      onUnlike?.();
    } else {
      onLike?.();
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComment?.();
  };

  return (
    <Card
      className={cn(
        'transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/50',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className='flex flex-row items-start gap-3 space-y-0 pb-2'>
        <UserAvatar
          name={author.name}
          username={author.username}
          avatarUrl={author.avatarUrl}
          image={author.image}
          size='md'
        />
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <span className='font-semibold truncate'>
              {author.name || author.username || 'Anonymous'}
            </span>
            {author.username && (
              <span className='text-muted-foreground text-sm truncate'>
                @{author.username}
              </span>
            )}
            <span className='text-muted-foreground text-sm'>·</span>
            <span className='text-muted-foreground text-sm whitespace-nowrap'>
              {formatRelativeTime(createdAt)}
            </span>
          </div>
        </div>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
                <span className='sr-only'>Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                <Pencil className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className='text-destructive'
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className='pb-2'>
        <MentionText content={content} className='whitespace-pre-wrap break-words' />
      </CardContent>
      <CardFooter className='pt-0'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            className={cn(
              'gap-1.5 px-2',
              isLiked && 'text-red-500 hover:text-red-600'
            )}
            onClick={handleLikeClick}
          >
            <Heart
              className={cn('h-4 w-4', isLiked && 'fill-current')}
            />
            <span className='text-sm'>{likesCount}</span>
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='gap-1.5 px-2'
            onClick={handleCommentClick}
          >
            <MessageCircle className='h-4 w-4' />
            <span className='text-sm'>{commentsCount}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
