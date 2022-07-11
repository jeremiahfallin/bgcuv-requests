import { useState } from 'react';
import NextError from 'next/error';
import { useSession } from 'next-auth/react';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import { TextInput, SimpleGrid } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import SongList from '~/components/SongList';
import Playlist from '~/components/Playlist';

const CreatePage: NextPageWithLayout = () => {
  const [artist, setArtist] = useState('');
  const [track, setTrack] = useState('');
  const [code, setCode] = useState('');
  const [debouncedArtist] = useDebouncedValue(artist, 200, { leading: true });
  const [debouncedTrack] = useDebouncedValue(track, 200, { leading: true });
  const { data: session } = useSession();

  const accessToken = session?.token?.accessToken;

  const trackQuery = trpc.useQuery([
    'spotify.search-tracks',
    {
      artist: debouncedArtist,
      track: debouncedTrack,
    },
  ]);

  const playlistQuery = trpc.useQuery(['spotify.get-playlist']);

  const { data } = trackQuery;
  return (
    <>
      <TextInput
        label="Song Name"
        value={track}
        style={{ flex: 1 }}
        onChange={(event) => setTrack(event.currentTarget.value)}
      />
      <TextInput
        label="Artist"
        value={artist}
        style={{ flex: 1 }}
        onChange={(event) => setArtist(event.currentTarget.value)}
      />
      <TextInput
        label="Code"
        value={code}
        style={{ flex: 1 }}
        onChange={(event) => setCode(event.currentTarget.value)}
      />
      <SimpleGrid
        cols={2}
        breakpoints={[{ maxWidth: 600, cols: 1, spacing: 'sm' }]}
      >
        <SongList
          items={data?.body?.tracks?.items}
          playlistId={playlistQuery?.data?.body?.id}
        />
        <Playlist
          items={playlistQuery?.data?.body?.tracks?.items}
          playlistId={playlistQuery?.data?.body?.id}
        />
      </SimpleGrid>
    </>
  );
};

export default CreatePage;
