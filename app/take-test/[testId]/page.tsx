import { TakeTestClient } from './client';

export default async function TakeTestPage({
  params,
  searchParams,
}: {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { testId } = await params;
  const { token } = await searchParams;

  return <TakeTestClient testId={testId} token={token || ''} />;
}
