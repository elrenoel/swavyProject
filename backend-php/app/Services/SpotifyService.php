<?php

declare(strict_types=1);

namespace App\Services;

use App\Core\Env;

final class SpotifyService
{
    private static ?string $token = null;
    private static int $tokenExpiresAt = 0;

    public static function getToken(): string
    {
        if (self::$token !== null && time() < self::$tokenExpiresAt) {
            return self::$token;
        }

        $clientId = Env::get('SPOTIFY_CLIENT_ID', '');
        $clientSecret = Env::get('SPOTIFY_CLIENT_SECRET', '');
        $auth = base64_encode($clientId . ':' . $clientSecret);

        $ch = curl_init('https://accounts.spotify.com/api/token');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Basic ' . $auth,
                'Content-Type: application/x-www-form-urlencoded',
            ],
            CURLOPT_POSTFIELDS => 'grant_type=client_credentials',
            CURLOPT_RETURNTRANSFER => true,
        ]);

        $resp = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        $data = json_decode((string) $resp, true);
        if ($status < 200 || $status >= 300 || !isset($data['access_token'])) {
            throw new \RuntimeException('Failed to get Spotify token');
        }

        self::$token = $data['access_token'];
        self::$tokenExpiresAt = time() + max(1, ((int) ($data['expires_in'] ?? 3600)) - 60);
        return self::$token;
    }

    public static function get(string $url): array
    {
        $token = self::getToken();
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $token],
            CURLOPT_RETURNTRANSFER => true,
        ]);
        $resp = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        $decoded = json_decode((string) $resp, true);
        return [
            'status' => $status,
            'data' => is_array($decoded) ? $decoded : [],
        ];
    }
}
