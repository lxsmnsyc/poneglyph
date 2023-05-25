import type { LoadResult, PageProps } from 'poneglyph/router';
import { Link } from 'poneglyph/router';

const sleep = async (ms: number): Promise<void> => new Promise((res) => {
  setTimeout(res, ms, true);
});

export async function load(
  params: { list: string[] },
): Promise<LoadResult<string>> {
  await sleep(1000);

  const data = params.list.join(', ');

  return {
    props: data,
  };
}

export default function CaptureAllRoute({ data }: PageProps<string>): JSX.Element {
  return (
    <div className="p-4 rounded-lg bg-indigo-900 bg-opacity-25 flex flex-col space-y-4">
      <span className="text-2xl text-white font-sans">
        {'Welcome to '}
        <span className="bg-white bg-opacity-25 font-mono p-2 rounded m-1">{`Wildcard Page ${data}`}</span>
        !
      </span>
      <div className="flex flex-col space-y-1">
        <Link href="/" className="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to home</Link>
      </div>
    </div>
  );
}
