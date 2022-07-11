import { useState } from 'react';
import NextError from 'next/error';
import { useSession } from 'next-auth/react';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import { TextInput, Text, Button } from '@mantine/core';

const CreatePage: NextPageWithLayout = () => {
  const [playlistName, setPlaylistName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [code, setCode] = useState('');
  const { data: session } = useSession();

  const accessToken: string = session?.token?.accessToken;
  const refreshToken: string = session?.token?.refreshToken;

  const createPlaylistMutation = trpc.useMutation(['spotify.create-playlist']);

  return (
    <>
      <h3>Create New Organization</h3>
      <TextInput
        label="Playlist Name"
        value={playlistName}
        style={{ flex: 1 }}
        onChange={(event) => setPlaylistName(event.currentTarget.value)}
      />
      <TextInput
        label="Organization Name"
        value={organizationName}
        style={{ flex: 1 }}
        onChange={(event) => setOrganizationName(event.currentTarget.value)}
      />
      <TextInput
        label="Code"
        value={code}
        style={{ flex: 1 }}
        onChange={(event) => setCode(event.currentTarget.value)}
      />
      <Button
        onClick={() =>
          createPlaylistMutation.mutate({
            token: accessToken,
            refreshToken,
            playlistName,
            organizationName,
            code,
            email: session?.token?.email,
          })
        }
      >
        Create
      </Button>
    </>
  );
};

export default CreatePage;
