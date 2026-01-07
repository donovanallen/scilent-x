// Utility function
export { cn } from './utils';

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

// Components
export { Avatar, AvatarImage, AvatarFallback } from './components/avatar';
export { Badge, badgeVariants } from './components/badge';
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
export { Toaster } from './components/sonner';
export { Switch } from './components/switch';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/tabs';
export { Textarea } from './components/textarea';
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
} from './components/social';
