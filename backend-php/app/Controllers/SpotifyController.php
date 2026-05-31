<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\SpotifyService;

final class SpotifyController
{
    public static function getNewReleases(Request $request): void
    {
        try {
            $res = SpotifyService::get('https://api.spotify.com/v1/search?q=year:2026&type=album&limit=10');
            if ($res['status'] < 200 || $res['status'] >= 300) {
                Response::json(['error' => 'Spotify failed', 'detail' => $res['data']], $res['status']);
                return;
            }
            Response::json($res['data']['albums']['items'] ?? []);
        } catch (\Throwable $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public static function searchTracks(Request $request): void
    {
        $q = (string) $request->query('q', '');
        if ($q === '') {
            Response::json(['albums' => [], 'tracks' => []]);
            return;
        }

        try {
            $res = SpotifyService::get('https://api.spotify.com/v1/search?q=' . urlencode($q) . '&type=album,track&limit=5');
            $data = $res['data'];
            $albums = $data['albums']['items'] ?? [];
            $tracks = $data['tracks']['items'] ?? [];

            $multi = array_values(array_filter($albums, fn ($a) => ((int) ($a['total_tracks'] ?? 0)) !== 1));
            $singleAlbums = array_values(array_filter($albums, fn ($a) => ((int) ($a['total_tracks'] ?? 0)) === 1));

            $singleTracks = [];
            foreach ($singleAlbums as $album) {
                $d = SpotifyService::get('https://api.spotify.com/v1/albums/' . urlencode((string) $album['id']));
                if ($d['status'] >= 200 && $d['status'] < 300) {
                    $albumData = $d['data'];
                    foreach ($albumData['tracks']['items'] ?? [] as $track) {
                        $track['album'] = [
                            'id' => $albumData['id'] ?? null,
                            'name' => $albumData['name'] ?? null,
                            'images' => $albumData['images'] ?? [],
                            'album_type' => $albumData['album_type'] ?? null,
                        ];
                        $singleTracks[] = $track;
                    }
                }
            }

            $map = [];
            foreach (array_merge($tracks, $singleTracks) as $t) {
                if (isset($t['id'])) $map[$t['id']] = $t;
            }

            Response::json(['albums' => $multi, 'tracks' => array_values($map)]);
        } catch (\Throwable $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public static function getTrackDetail(Request $request): void
    {
        $id = (string) ($request->params['id'] ?? '');
        try {
            $res = SpotifyService::get('https://api.spotify.com/v1/tracks/' . urlencode($id));
            Response::json($res['data'], $res['status'] >= 200 && $res['status'] < 300 ? 200 : $res['status']);
        } catch (\Throwable $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public static function getAlbumDetail(Request $request): void
    {
        $id = (string) ($request->params['id'] ?? '');
        try {
            $res = SpotifyService::get('https://api.spotify.com/v1/albums/' . urlencode($id));
            Response::json($res['data'], $res['status'] >= 200 && $res['status'] < 300 ? 200 : 500);
        } catch (\Throwable $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public static function getDiscover(Request $request): void
    {
        $q = (string) $request->query('q', 'top hits 2025');
        try {
            $res = SpotifyService::get('https://api.spotify.com/v1/search?q=' . urlencode($q) . '&type=track&limit=10');
            $data = $res['data'];
            if (isset($data['error'])) {
                Response::json($data, 500);
                return;
            }
            Response::json(['tracks' => $data['tracks']['items'] ?? []]);
        } catch (\Throwable $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }
}
