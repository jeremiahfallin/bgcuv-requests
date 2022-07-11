import {
  Container,
  Card,
  Image,
  Text,
  Grid,
  Button,
  Group,
  useMantineTheme,
} from '@mantine/core';
import { trpc } from '~/utils/trpc';

const SongList: React.FC<{
  items: any;
  playlistId: string | undefined;
}> = ({ items, playlistId }) => {
  const theme = useMantineTheme();

  const addTrackoPlaylistMutation = trpc.useMutation([
    'spotify.add-track-to-playlist',
  ]);
  return (
    <Container>
      <h2>Results:</h2>
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
                  <Card shadow="sm" p="lg">
                    <Group
                      position="left"
                      style={{ marginBottom: 5, marginTop: theme.spacing.sm }}
                    >
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
                      onClick={() => {
                        addTrackoPlaylistMutation.mutate({
                          playlistId,
                          trackId: item.id,
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
    </Container>
  );
};

export default SongList;
