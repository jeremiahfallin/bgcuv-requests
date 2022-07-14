import { useEffect } from 'react';
import {
  Container,
  Card,
  Image,
  Text,
  Grid,
  Button,
  Group,
  useMantineTheme,
  LoadingOverlay,
  ScrollArea,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { trpc } from '~/utils/trpc';

const SongList: React.FC<{
  items: any;
  playlistId: string | undefined;
  secretCode: string;
  refetchRequests: () => void;
}> = ({ items, playlistId, secretCode, refetchRequests }) => {
  const theme = useMantineTheme();

  const addTrackToPlaylistMutation = trpc.useMutation([
    'spotify.add-track-to-playlist',
  ]);

  useEffect(() => {
    if (addTrackToPlaylistMutation.error) {
      showNotification({
        title: 'Song could not be added',
        message: addTrackToPlaylistMutation.error.message,
        color: 'red',
      });
    }
  }, [addTrackToPlaylistMutation.error]);

  useEffect(() => {
    showNotification({
      title: 'Song requested',
      message: 'Song has been requested',
    });
    refetchRequests();
  }, [addTrackToPlaylistMutation.isSuccess]);

  return (
    <Container>
      <h2>Results:</h2>
      <ScrollArea style={{ height: 600 }} offsetScrollbars type="auto">
        <Grid style={{ flexDirection: 'column' }}>
          {items?.length &&
            items
              .filter((item: any) => !item.explicit)
              .map((item: any) => {
                return (
                  <Grid.Col
                    md={12}
                    lg={12}
                    style={{ maxWidth: 340 }}
                    key={item.id}
                  >
                    <Card shadow="sm" p="lg" style={{ position: 'relative' }}>
                      <Group
                        position="left"
                        style={{ marginBottom: 5, marginTop: theme.spacing.sm }}
                      >
                        <LoadingOverlay
                          visible={addTrackToPlaylistMutation.isLoading}
                        />
                        <Card.Section>
                          <Image
                            src={item.album.images?.[2].url}
                            alt={item.album.name}
                            height={64}
                            width={64}
                          />
                        </Card.Section>

                        <Text weight={500}>{item.artists[0].name}</Text>
                      </Group>
                      <Text>Song: {item.name}</Text>
                      <Text>Album: {item.album.name}</Text>

                      <Button
                        variant="light"
                        color="blue"
                        fullWidth
                        style={{ marginTop: 14 }}
                        onClick={async () => {
                          addTrackToPlaylistMutation.mutate({
                            playlistId,
                            trackId: item.id,
                            code: secretCode,
                          });
                        }}
                      >
                        Request
                      </Button>
                    </Card>
                  </Grid.Col>
                );
              })}
        </Grid>
      </ScrollArea>
    </Container>
  );
};

export default SongList;
