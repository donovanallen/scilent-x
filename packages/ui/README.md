# @scilent-one/ui

Shared UI components and utilities for the monorepo. Built with [Radix UI](https://radix-ui.com), [Tailwind CSS](https://tailwindcss.com), and [shadcn/ui](https://ui.shadcn.com) patterns.

## Installation

This package is part of the monorepo and is installed automatically. To use it in your app:

```bash
pnpm add @scilent-one/ui@workspace:*
```

## Usage

### Components

```tsx
import { Button, Card, Dialog, Input } from '@scilent-one/ui';

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text..." />
      <Button>Submit</Button>
    </Card>
  );
}
```

### Utilities

```tsx
import { cn } from '@scilent-one/ui/utils';

// Merge Tailwind classes with intelligent conflict resolution
const className = cn(
  'p-4 bg-white',
  isActive && 'bg-blue-500',
  customClassName
);
```

### Globals CSS

Import the global styles in your app:

```tsx
import '@scilent-one/ui/globals.css';
```

## Components

### Primitives (from Radix UI)

| Component | Description |
|-----------|-------------|
| `Avatar` | User avatar with fallback |
| `Badge` | Status and label badges |
| `Button` | Primary action buttons |
| `Card` | Content container |
| `Dialog` | Modal dialogs |
| `DropdownMenu` | Dropdown menu |
| `HoverCard` | Hover-triggered popover |
| `Input` | Text input field |
| `Label` | Form labels |
| `Popover` | Triggered popover |
| `ScrollArea` | Custom scrollable area |
| `Select` | Select dropdown |
| `Separator` | Visual separator |
| `Sheet` | Slide-out panel |
| `Switch` | Toggle switch |
| `Tabs` | Tabbed interface |
| `Textarea` | Multi-line text input |
| `Toggle` | Toggle button |
| `Tooltip` | Hover tooltip |

### Rich Text

| Component | Description |
|-----------|-------------|
| `TiptapEditor` | Rich text editor with mentions |
| `RichTextContent` | Render rich text HTML |
| `MentionList` | Autocomplete for @mentions |

### Social Components

| Component | Description |
|-----------|-------------|
| `PostCard` | Social post display |
| `PostForm` | Create/edit post |
| `CommentCard` | Comment display |
| `CommentForm` | Create comment |
| `CommentList` | Threaded comments |
| `Feed` | Infinite scroll feed |
| `FollowButton` | Follow/unfollow toggle |
| `ProfileHeader` | User profile header |
| `UserAvatar` | User avatar with link |
| `UserCard` | User info card |

## Hooks

### `useOptimisticAction`

Generic hook for optimistic UI updates:

```tsx
import { useOptimisticAction } from '@scilent-one/ui';

const { value, isPending, execute } = useOptimisticAction({
  value: currentValue,
  optimisticValue: newValue,
  action: async () => { await updateValue(); },
  onError: (error) => toast.error(error.message),
});
```

### `useLike`

Specialized hook for like/unlike with optimistic count:

```tsx
import { useLike } from '@scilent-one/ui';

const { isLiked, likesCount, isPending, toggle } = useLike({
  isLiked: post.isLiked,
  likesCount: post._count.likes,
  onLike: () => likePost(post.id),
  onUnlike: () => unlikePost(post.id),
});
```

### `useFollow`

Specialized hook for follow/unfollow:

```tsx
import { useFollow } from '@scilent-one/ui';

const { isFollowing, isPending, toggle } = useFollow({
  isFollowing: user.isFollowing,
  onFollow: () => followUser(user.id),
  onUnfollow: () => unfollowUser(user.id),
});
```

### `useInfiniteScroll`

Infinite scroll with intersection observer:

```tsx
import { useInfiniteScroll } from '@scilent-one/ui';

const { ref, inView } = useInfiniteScroll({
  onLoadMore: () => fetchNextPage(),
  hasMore: data.hasMore,
});

return (
  <div>
    {items.map(item => <Item key={item.id} />)}
    <div ref={ref} /> {/* Trigger element */}
  </div>
);
```

## Storybook

Run Storybook to see all components:

```bash
pnpm storybook
```

Open http://localhost:6006

## Testing

This package includes unit tests for utilities and hooks using [Vitest](https://vitest.dev/).

### Running Tests

```bash
# Run unit tests in watch mode
pnpm test

# Run unit tests once
pnpm test:run

# Run unit tests with coverage
pnpm test:coverage

# Run Storybook component tests
pnpm test:storybook
```

From the monorepo root:

```bash
# Run tests for this package only
pnpm turbo test --filter=@scilent-one/ui
```

### Test Structure

```
src/
├── __tests__/
│   └── utils.test.ts      # Tests for cn() utility
├── hooks/
│   └── use-optimistic-action.ts
└── utils.ts
```

### What's Tested

| Module | Coverage | Description |
|--------|----------|-------------|
| `utils.ts` | 100% | `cn()` class name merging with Tailwind conflict resolution |

The `cn` utility is tested for:
- Basic class merging
- Conditional classes with objects
- Array handling
- Tailwind conflict resolution (padding, margin, colors, etc.)
- Responsive prefix handling

### Coverage Reporting

Coverage is tracked via [Codecov](https://codecov.io). PR comments show coverage changes automatically.

### Note on Hook Testing

The React hooks (`useOptimisticAction`, `useLike`, `useFollow`) are client-side hooks that would benefit from testing with [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/). This is planned for a future update.

## License

Private - @scilent-one
