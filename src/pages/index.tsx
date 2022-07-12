import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import { useDebouncedValue } from '@mantine/hooks';
import Request from '~/components/Request';

const IndexPage: NextPageWithLayout = () => {
  return (
    <>
      <Request />
    </>
  );
};

export default IndexPage;
