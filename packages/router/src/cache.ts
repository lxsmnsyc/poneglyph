import { deserialize } from 'seroval';
import useSWR from 'swr';
import { useRouter } from './use-router';

export function useCache<T>(
  path: string,
  fallbackData?: T,
): T {
  const router = useRouter();
  const { data } = useSWR(
    () => [path, router.search],
    async ([pathname, search]) => {
      const params = new URLSearchParams(search);
      params.set('.get', '');
      const response = await fetch(`${pathname}?${params.toString()}`);
      if (response.ok) {
        return deserialize<T>(await response.text());
      }
      if (import.meta.env.DEV) {
        throw deserialize<T>(await response.text());
      }
      throw new Error('invariant');
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 1,
      suspense: true,
      fallbackData,
    },
  );

  return data;
}
