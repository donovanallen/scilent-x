export function getPostDetailPath(id: string, type?: string | null): string {
  return type === 'REVIEW' ? `/review/${id}` : `/post/${id}`;
}
