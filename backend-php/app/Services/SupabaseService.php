<?php

declare(strict_types=1);

namespace App\Services;

use App\Core\Env;

final class SupabaseService
{
    public static function authSignUp(string $email, string $password, string $username): array
    {
        return self::request('POST', '/auth/v1/signup', [
            'email' => $email,
            'password' => $password,
            'data' => ['username' => $username, 'email' => $email],
        ]);
    }

    public static function authSignIn(string $email, string $password): array
    {
        return self::request('POST', '/auth/v1/token?grant_type=password', [
            'email' => $email,
            'password' => $password,
        ]);
    }

    public static function authRefresh(string $refreshToken): array
    {
        return self::request('POST', '/auth/v1/token?grant_type=refresh_token', [
            'refresh_token' => $refreshToken,
        ]);
    }

    public static function authUser(string $accessToken): array
    {
        return self::request('GET', '/auth/v1/user', null, [
            'Authorization: Bearer ' . $accessToken,
        ]);
    }

    public static function authVerifyOtp(string $email, string $token): array
    {
        return self::request('POST', '/auth/v1/verify', [
            'email' => $email,
            'token' => $token,
            'type' => 'signup',
        ]);
    }

    public static function authResendOtp(string $email): array
    {
        return self::request('POST', '/auth/v1/resend', [
            'type' => 'signup',
            'email' => $email,
        ]);
    }

    public static function authUpdateUser(string $accessToken, array $payload): array
    {
        return self::request('PUT', '/auth/v1/user', $payload, [
            'Authorization: Bearer ' . $accessToken,
        ]);
    }

    public static function uploadAvatar(string $accessToken, string $filePath, string $contentType, string $binary): array
    {
        $url = rtrim((string) Env::get('SUPABASE_URL'), '/') . '/storage/v1/object/profile-avatars/' . $filePath;
        $headers = [
            'apikey: ' . Env::get('SUPABASE_ANON_KEY', ''),
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: ' . $contentType,
            'x-upsert: true',
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POSTFIELDS => $binary,
        ]);
        $resp = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        if ($status < 200 || $status >= 300) {
            return ['error' => true, 'message' => 'Avatar upload failed', 'status' => $status, 'raw' => $resp];
        }

        return ['error' => false];
    }

    public static function publicAvatarUrl(string $filePath): string
    {
        return rtrim((string) Env::get('SUPABASE_URL'), '/') . '/storage/v1/object/public/profile-avatars/' . $filePath;
    }

    private static function request(string $method, string $path, ?array $body = null, array $extraHeaders = []): array
    {
        $url = rtrim((string) Env::get('SUPABASE_URL'), '/') . $path;
        $hasAuthHeader = false;
        foreach ($extraHeaders as $header) {
            if (str_starts_with(strtolower($header), 'authorization:')) {
                $hasAuthHeader = true;
                break;
            }
        }

        $headers = [
            'apikey: ' . Env::get('SUPABASE_ANON_KEY', ''),
            'Content-Type: application/json',
        ];

        if (!$hasAuthHeader) {
            $headers[] = 'Authorization: Bearer ' . Env::get('SUPABASE_ANON_KEY', '');
        }

        $headers = array_merge($headers, $extraHeaders);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
        ]);

        if ($body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }

        $resp = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \RuntimeException('Supabase request failed');
        }

        $decoded = json_decode((string) $resp, true);
        if ($status < 200 || $status >= 300) {
            $message = is_array($decoded) ? ($decoded['msg'] ?? $decoded['message'] ?? 'Request failed') : 'Request failed';
            throw new \RuntimeException($message);
        }

        return is_array($decoded) ? $decoded : [];
    }
}
