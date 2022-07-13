import {
  Container,
  Card,
  Image,
  Text,
  Grid,
  ScrollArea,
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
      <h2>Requests:</h2>
      <ScrollArea style={{ height: 600 }} offsetScrollbars type="auto">
        <Grid style={{ flexDirection: 'column' }}>
          {items?.length &&
            items
              .filter((item: any) => !item.explicit)
              .map((item: any) => {
                item = item.track;
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
