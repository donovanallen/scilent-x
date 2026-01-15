'use client';

import * as React from 'react';
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Pencil,
} from 'lucide-react';
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

export interface CommentCardAuthor {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  image: string | null;
}

export interface CommentCardProps {
  id: string;
  content: string;
  author: CommentCardAuthor;
  createdAt: Date | string;
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
  isOwner?: boolean;
  isReply?: boolean;
  onLike?: () => void;
  onUnlike?: () => void;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Callback when a user mention (@username) is clicked */
  onMentionClick?: ((username: string) => void) | undefined;
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

export function CommentCard({
  // id,
  content,
  author,
  createdAt,
  likesCount,
  repliesCount,
  isLiked = false,
  isOwner = false,
  isReply = false,
  onLike,
  onUnlike,
  onReply,
  onEdit,
  onDelete,
  onMentionClick,
  className,
}: CommentCardProps) {
  const handleLikeClick = () => {
    if (isLiked) {
      onUnlike?.();
    } else {
      onLike?.();
    }
  };

  return (
    <div
      className={cn('flex gap-3', isReply && 'ml-8 pl-4 border-l', className)}
    >
      <UserAvatar
        name={author.name}
        username={author.username}
        avatarUrl={author.avatarUrl}
        image={author.image}
        size={isReply ? 'sm' : 'md'}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm truncate">
            {author.name || author.username || 'Anonymous'}
          </span>
          {author.username && (
            <span className="text-muted-foreground text-xs truncate">
              @{author.username}
            </span>
          )}
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {formatRelativeTime(createdAt)}
          </span>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-auto"
                >
                  <MoreHorizontal className="h-3 w-3" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <MentionText
          content={content}
          className="text-sm whitespace-pre-wrap break-words mt-1"
          onMentionClick={onMentionClick}
        />
        <div className="flex items-center gap-3 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 gap-1 px-2 text-xs',
              isLiked && 'text-red-500 hover:text-red-600'
            )}
            onClick={handleLikeClick}
          >
            <Heart className={cn('h-3 w-3', isLiked && 'fill-current')} />
            <span>{likesCount}</span>
          </Button>
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={onReply}
            >
              <MessageCircle className="h-3 w-3" />
              <span>{repliesCount}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
