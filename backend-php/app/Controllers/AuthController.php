<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Services\SupabaseService;

final class AuthController
{
    public static function register(Request $request): void
    {
        $body = $request->json();
        $email = (string) ($body['email'] ?? '');
        $password = (string) ($body['password'] ?? '');
        $username = (string) ($body['username'] ?? '');

        if (!preg_match('/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/', $password)) {
            Response::json(['error' => 'Password must be at least 8 characters, include one uppercase letter, and one special character.'], 400);
            return;
        }

        try {
            $data = SupabaseService::authSignUp($email, $password, $username);
            self::ensureUserProfile($data['user'] ?? null);
            Response::json(['message' => 'OTP has been sent to your email. Please verify to complete registration.', 'data' => $data], 201);
        } catch (\Throwable $e) {
            $message = strtolower($e->getMessage());
            $isRateLimited = str_contains($message, 'rate limit');
            $isEmailSendError = str_contains($message, 'sending confirmation email');

            Response::json([
                'error' => $isRateLimited
                    ? 'Terlalu banyak permintaan email. Silakan coba lagi nanti.'
                    : ($isEmailSendError
                        ? 'Gagal mengirim email OTP. Periksa konfigurasi SMTP Supabase.'
                        : $e->getMessage()),
            ], $isRateLimited ? 429 : ($isEmailSendError ? 502 : 400));
        }
    }

    public static function login(Request $request): void
    {
        $body = $request->json();
        try {
            $result = SupabaseService::authSignIn((string) ($body['email'] ?? ''), (string) ($body['password'] ?? ''));
            if (!isset($result['access_token'], $result['refresh_token'])) {
                Response::json(['error' => 'Session token missing'], 500);
                return;
            }

            self::ensureUserProfile($result['user'] ?? null);
            self::setAuthCookies($result['access_token'], $result['refresh_token']);
            Response::json([
                'message' => 'Login successful',
                'session' => $result,
                'access_token' => $result['access_token'],
                'refresh_token' => $result['refresh_token'],
            ], 200);
        } catch (\Throwable $e) {
            Response::json(['error' => $e->getMessage()], 401);
        }
    }

    public static function me(Request $request): void
    {
        $authHeader = (string) ($request->header('Authorization') ?? '');
        $bearerToken = str_starts_with($authHeader, 'Bearer ')
            ? trim(substr($authHeader, 7))
            : null;
        $accessToken = $bearerToken ?: $request->cookie('access_token');
        if (!$accessToken) {
            Response::json(['error' => 'Unauthorized'], 401);
            return;
        }

        try {
            $user = SupabaseService::authUser($accessToken);
            Response::json(['user' => $user], 200);
        } catch (\Throwable $e) {
            Response::json(['error' => $e->getMessage()], 401);
        }
    }

    public static function refresh(Request $request): void
    {
        $refresh = $request->cookie('refresh_token');
        if (!$refresh) {
            Response::json(['error' => 'Unauthorized'], 401);
            return;
        }

        try {
            $result = SupabaseService::authRefresh($refresh);
            if (!isset($result['access_token'], $result['refresh_token'])) {
                Response::json(['error' => 'Refresh failed'], 401);
                return;
            }

            self::setAuthCookies($result['access_token'], $result['refresh_token']);
            Response::json(['message' => 'Refresh successful'], 200);
        } catch (\Throwable $e) {
            Response::json(['error' => $e->getMessage()], 401);
        }
    }

    public static function logout(Request $request): void
    {
        setcookie('access_token', '', time() - 3600, '/', '', false, true);
        setcookie('refresh_token', '', time() - 3600, '/', '', false, true);
        Response::json(['message' => 'Logout successful'], 200);
    }

    public static function verifyOTP(Request $request): void
    {
        $body = $request->json();
        $email = (string) ($body['email'] ?? '');
        $token = (string) ($body['token'] ?? '');

        if ($email === '' || $token === '') {
            Response::json(['status' => 'error', 'message' => 'Email dan kode OTP wajib diisi'], 400);
            return;
        }

        try {
            $result = SupabaseService::authVerifyOtp($email, $token);
            self::ensureUserProfile($result['user'] ?? null);

            Response::json(['status' => 'success', 'message' => 'Verifikasi berhasil', 'data' => $result], 200);
        } catch (\Throwable $e) {
            $message = strtolower($e->getMessage());
            $isOtpError = str_contains($message, 'token') || str_contains($message, 'otp');
            Response::json([
                'status' => 'error',
                'message' => $isOtpError
                    ? 'Kode OTP tidak valid atau sudah kedaluwarsa. Coba cek ulang kode terbaru di email.'
                    : $e->getMessage(),
            ], 400);
        }
    }

    public static function resendOTP(Request $request): void
    {
        $body = $request->json();
        $email = (string) ($body['email'] ?? '');
        if ($email === '') {
            Response::json(['status' => 'error', 'message' => 'Email wajib diisi untuk kirim ulang OTP'], 400);
            return;
        }

        try {
            $result = SupabaseService::authResendOtp($email);
            Response::json(['status' => 'success', 'message' => 'OTP baru telah dikirim ke email', 'data' => $result], 200);
        } catch (\Throwable $e) {
            $msg = str_contains(strtolower($e->getMessage()), 'rate limit') ? 'Terlalu banyak permintaan. Silakan coba lagi dalam 1 jam.' : $e->getMessage();
            Response::json(['status' => 'error', 'message' => $msg], 429);
        }
    }

    private static function setAuthCookies(string $access, string $refresh): void
    {
        $secure = false;
        $sameSite = 'Lax';
        setcookie('access_token', $access, ['expires' => time() + 604800, 'path' => '/', 'httponly' => true, 'secure' => $secure, 'samesite' => $sameSite]);
        setcookie('refresh_token', $refresh, ['expires' => time() + 604800, 'path' => '/', 'httponly' => true, 'secure' => $secure, 'samesite' => $sameSite]);
    }

    private static function ensureUserProfile(?array $user): ?array
    {
        if (!isset($user['id'])) return null;

        $pdo = Database::connection();
        $stmt = $pdo->prepare('SELECT id, username, full_name, avatar_url, updated_at FROM profiles WHERE id=:id LIMIT 1');
        $stmt->execute(['id' => $user['id']]);
        $existing = $stmt->fetch();
        if ($existing) return $existing;

        $email = (string) ($user['email'] ?? '');
        $metadata = is_array($user['user_metadata'] ?? null) ? $user['user_metadata'] : [];
        $username = (string) (
            $metadata['username']
            ?? ($email !== '' ? explode('@', $email)[0] : '')
            ?: ('User_' . substr((string) $user['id'], 0, 5))
        );

        $insert = $pdo->prepare('INSERT INTO profiles (id, username, full_name, updated_at) VALUES (:id,:username,:full_name,NOW()) RETURNING id, username, full_name, avatar_url, updated_at');
        $insert->execute([
            'id' => $user['id'],
            'username' => $username,
            'full_name' => $username,
        ]);

        $profile = $insert->fetch();
        return $profile ?: null;
    }
}
