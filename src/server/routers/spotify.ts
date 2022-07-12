import { z } from 'zod';
import { createRouter } from '~/server/createRouter';
import { prisma } from '~/server/prisma';
import SpotifyWebApi from 'spotify-web-api-node';

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const redirectUri = 'https://localhost:3000';

const spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
  clientSecret: clientSecret,
});

export const spotifyRouter = createRouter()
  .query('search-tracks', {
    input: z.object({
      artist: z.string().nullish(),
      track: z.string().nullish(),
    }),
    async resolve({ input }) {
      const user = await prisma.user.findFirst({
        select: {
          id: true,
          refreshToken: true,
          accessToken: true,
        },
      });
      spotifyApi.setAccessToken(user!.accessToken);
      spotifyApi.setRefreshToken(user!.refreshToken);
      const { artist, track } = input;
      const tracks = await spotifyApi
        .searchTracks(
          `${track && 'track:' + track} ${artist && 'artist:' + artist}`,
        )
        .catch(async (err: any) => {
          if (err.statusCode === 401) {
            const newToken = await spotifyApi.refreshAccessToken();
            spotifyApi.setAccessToken(newToken.body.access_token);
            await prisma.user.update({
              where: {
                id: user?.id,
              },
              data: {
                accessToken: newToken.body.access_token,
              },
            });
          }
        });
      return tracks;
    },
  })
  .query('get-playlist', {
    async resolve() {
      const user = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          playlist: {
            select: {
              id: true,
              songs: true,
            },
          },
          refreshToken: true,
          accessToken: true,
        },
      });
      spotifyApi.setAccessToken(user!.accessToken);
      spotifyApi.setRefreshToken(user!.refreshToken);

      const playlist = await spotifyApi
        .getPlaylist(user!.playlist.id)
        .catch(async (err: any) => {
          if (err.statusCode === 401) {
            const newToken = await spotifyApi.refreshAccessToken();
            spotifyApi.setAccessToken(newToken.body.access_token);
            await prisma.user.update({
              where: {
                id: user?.id,
              },
              data: {
                accessToken: newToken.body.access_token,
              },
            });
          }
        });

      return playlist;
    },
  })
  .mutation('create-playlist', {
    input: z.object({
      token: z.string(),
      refreshToken: z.string(),
      playlistName: z.string().nullish(),
      organizationName: z.string(),
      code: z.string(),
      email: z.string(),
    }),
    async resolve({ input }) {
      const playlistName = input.playlistName || 'Intermediary';
      const organizationName = input.organizationName;
      spotifyApi.setAccessToken(input.token);
      spotifyApi.setRefreshToken(input.refreshToken);
      const playlist = await spotifyApi.createPlaylist(playlistName, {
        description: `A playlist created on bgcuv.rocks for ${organizationName} to store songs before being added to a main playlist.`,
        public: true,
      });
      await prisma.user.create({
        data: {
          id: playlist.body.owner.id,
          email: input.email,
          accessToken: input.token,
          refreshToken: input.refreshToken,
          // create playlist here
          playlist: {
            create: {
              id: playlist.body.id,
              secretCode: input.code,
              organizationName,
            },
          },
        },
      });
      spotifyApi.resetCredentials();
      return playlist;
    },
  })
  .mutation('add-track-to-playlist', {
    input: z.object({
      playlistId: z.string().nullish(),
      trackId: z.string(),
      code: z.string(),
    }),
    async resolve({ input }) {
      const { trackId, code } = input;
      const playlistId =
        input.playlistId ||
        (
          await prisma.user.findFirst({
            select: {
              playlist: {
                select: {
                  id: true,
                },
              },
            },
          })
        )?.playlist?.id ||
        '';
      const user = await prisma.user.findFirst({
        where: { playlistId: playlistId },
        select: {
          id: true,
          email: true,
          playlist: {
            select: {
              id: true,
              songs: true,
              secretCode: true,
            },
          },
          refreshToken: true,
          accessToken: true,
        },
      });
      if (code !== user?.playlist?.secretCode) {
        throw new Error('Invalid code');
      }
      spotifyApi.setRefreshToken(user!.refreshToken);
      spotifyApi.setAccessToken(user!.accessToken);
      const song = await prisma.song
        .create({
          data: {
            id: trackId,
            playlist: {
              connect: {
                id: playlistId,
              },
            },
          },
        })
        .catch((err: any) => {
          throw new Error('Song already exists');
        });
      spotifyApi
        .addTracksToPlaylist(playlistId, [`spotify:track:${trackId}`])
        .catch(async (err: any) => {
          if (err.statusCode === 401) {
            const newToken = await spotifyApi.refreshAccessToken();
            spotifyApi.setAccessToken(newToken.body.access_token);
            await prisma.user.update({
              where: {
                id: user?.id,
              },
              data: {
                accessToken: newToken.body.access_token,
              },
            });
          }
        });

      return input;
    },
  });
