import { redirect } from 'next/navigation';

interface ProfileArtistsRedirectPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProfileArtistsRedirectPage({
  searchParams,
}: ProfileArtistsRedirectPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      query.set(key, value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        query.append(key, item);
      }
    }
  }

  const queryString = query.toString();
  redirect(queryString ? `/artists?${queryString}` : '/artists');
}
