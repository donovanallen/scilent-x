// Utility function
export { cn } from './utils';

// Rich Text Components
export {
  RichTextEditor,
  type RichTextEditorProps,
} from './components/rich-text-editor';
export {
  RichTextContent,
  type RichTextContentProps,
  type ArtistMentionRenderProps,
} from './components/rich-text-content';
export {
  TiptapEditor,
  type TiptapEditorProps,
} from './components/tiptap-editor';
export {
  MentionList,
  type MentionListProps,
  type MentionListRef,
  type MentionSuggestion,
} from './components/mention-list';

// Hooks
export { useIsMobile } from './hooks/use-mobile';
export {
  useInfiniteScroll,
  type UseInfiniteScrollOptions,
  type UseInfiniteScrollReturn,
} from './hooks/use-infinite-scroll';
export {
  useOptimisticAction,
  useLike,
  useFollow,
  type UseOptimisticActionOptions,
  type UseOptimisticActionReturn,
  type UseLikeOptions,
  type UseLikeReturn,
  type UseFollowOptions,
  type UseFollowReturn,
} from './hooks/use-optimistic-action';
export {
  useEditPost,
  type UseEditPostOptions,
  type UseEditPostReturn,
} from './hooks/use-edit-post';

// Components
export { Avatar, AvatarImage, AvatarFallback } from './components/avatar';
export { Badge, badgeVariants } from './components/badge';
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './components/breadcrumb';
export { Button, buttonVariants, type ButtonProps } from './components/button';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/card';
export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './components/collapsible';
export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from './components/command';
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/dialog';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './components/dropdown-menu';
export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from './components/empty';
export { Input } from './components/input';
export { Label } from './components/label';
export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
} from './components/navigation-menu';
export { ScrollArea } from './components/scroll-area';
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/select';
export { Separator } from './components/separator';
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './components/sheet';
export { Skeleton } from './components/skeleton';
export { Spinner } from './components/spinner';
export { Toaster } from './components/sonner';
export { Switch } from './components/switch';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/tabs';
export { Textarea } from './components/textarea';
export { ToggleGroup, ToggleGroupItem } from './components/toggle-group';
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './components/tooltip';
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './components/sidebar';

// Context Menu
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from './components/context-menu';

// Hover Card
export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from './components/hover-card';

// Popover
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from './components/popover';

// Social Components
export {
  UserAvatar,
  type UserAvatarProps,
  PostCard,
  type PostCardProps,
  type PostCardAuthor,
  PostForm,
  type PostFormProps,
  MentionText,
  type MentionTextProps,
  CommentCard,
  type CommentCardProps,
  type CommentCardAuthor,
  CommentForm,
  type CommentFormProps,
  CommentList,
  type CommentListProps,
  FollowButton,
  type FollowButtonProps,
  UserCard,
  type UserCardProps,
  ProfileHeader,
  type ProfileHeaderProps,
  Feed,
  type FeedProps,
  PostCardCommentInput,
  type PostCardCommentInputProps,
  type PostCardCommentInputUser,
  PostCardComments,
  type PostCardCommentsProps,
} from './components/social';
