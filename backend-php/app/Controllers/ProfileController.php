<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Middlewares\AuthMiddleware;
use App\Services\ProfileService;
use App\Services\SupabaseService;

final class ProfileController
{
    private static function viewerId(Request $request): ?string
    {
        $token = AuthMiddleware::extractAccessToken($request);
        if (!$token) return null;
        try {
            $user = SupabaseService::authUser($token);
            return $user['id'] ?? null;
        } catch (\Throwable) {
            return null;
        }
    }

    public static function getProfileByUsername(Request $request): void
    {
        $pdo = Database::connection();
        $profile = ProfileService::getByUsername($pdo, (string) $request->params['username']);
        if (!$profile) { Response::json(['error' => 'Profile not found'], 404); return; }

        $viewerId = self::viewerId($request);
        $isMe = $viewerId !== null && $viewerId === $profile['id'];
        $isFollowing = false;
        if ($viewerId && !$isMe) {
            $isFollowing = ProfileService::isFollowing($pdo, $viewerId, (string) $profile['id']);
        }

        Response::json(['profile' => $profile, 'isFollowing' => $isFollowing, 'isMe' => $isMe]);
    }

    public static function getMyProfile(Request $request): void
    {
        $profile = ProfileService::getById(Database::connection(), (string) $request->user['id']);
        if (!$profile) {
            Response::json(['error' => 'Profile not found'], 404);
            return;
        }

        Response::json(['profile' => $profile]);
    }

    public static function getProfileStats(Request $request): void
    {
        $pdo = Database::connection();
        $profile = ProfileService::getByUsername($pdo, (string) $request->params['username']);
        if (!$profile) { Response::json(['error' => 'Profile not found'], 404); return; }
        Response::json(['stats' => ProfileService::stats($pdo, (string) $profile['id'])]);
    }

    public static function getProfileTopPicks(Request $request): void
    {
        $pdo = Database::connection();
        $profile = ProfileService::getByUsername($pdo, (string) $request->params['username']);
        if (!$profile) { Response::json(['error' => 'Profile not found'], 404); return; }
        $limit = max(1, (int) $request->query('limit', 4));
        Response::json(['reviews' => ProfileService::topPicks($pdo, (string) $profile['id'], $limit)]);
    }

    public static function getProfileLists(Request $request): void
    {
        $pdo = Database::connection();
        $profile = ProfileService::getByUsername($pdo, (string) $request->params['username']);
        if (!$profile) { Response::json(['error' => 'Profile not found'], 404); return; }
        $limit = max(1, (int) $request->query('limit', 4));
        $offset = max(0, (int) $request->query('offset', 0));
        Response::json(ProfileService::lists($pdo, (string) $profile['id'], $limit, $offset));
    }

    public static function updateProfile(Request $request): void
    {
        $b = $request->json();
        $username = array_key_exists('username', $b) ? (string) $b['username'] : null;
        $hasFullName = array_key_exists('full_name', $b);
        $fullName = $hasFullName ? (($b['full_name'] ?? null) !== null ? (string) $b['full_name'] : null) : null;

        if ($username === null && !$hasFullName) { Response::json(['error' => 'Provide username or full_name'], 400); return; }

        $profile = ProfileService::update(Database::connection(), (string) $request->user['id'], $username, $hasFullName, $fullName ?: ($username ?: null));

        if ($username !== null && $request->accessToken) {
            SupabaseService::authUpdateUser($request->accessToken, ['data' => ['username' => $username]]);
        }

        Response::json(['profile' => $profile]);
    }

    public static function uploadAvatar(Request $request): void
    {
        $b = $request->json();
        $dataUrl = (string) ($b['avatarDataUrl'] ?? '');
        if (!preg_match('/^data:([^;]+);base64,(.*)$/', $dataUrl, $m)) {
            Response::json(['error' => 'Invalid avatar data'], 400);
            return;
        }

        $contentType = $m[1];
        $binary = base64_decode($m[2], true);
        if ($binary === false) { Response::json(['error' => 'Invalid avatar data'], 400); return; }

        $ext = explode('/', $contentType)[1] ?? 'png';
        $filePath = 'avatars/' . $request->user['id'] . '.' . $ext;
        $upload = SupabaseService::uploadAvatar((string) $request->accessToken, $filePath, $contentType, $binary);
        if (($upload['error'] ?? false) === true) {
            Response::json(['error' => $upload['message'] ?? 'Avatar upload failed'], 500);
            return;
        }

        $publicUrl = SupabaseService::publicAvatarUrl($filePath);
        $profile = ProfileService::update(Database::connection(), (string) $request->user['id'], null, false, null, $publicUrl);
        Response::json(['profile' => $profile]);
    }

    public static function followProfile(Request $request): void
    {
        $pdo = Database::connection();
        $profile = ProfileService::getByUsername($pdo, (string) $request->params['username']);
        if (!$profile) { Response::json(['error' => 'Profile not found'], 404); return; }
        if ($profile['id'] === $request->user['id']) { Response::json(['error' => 'Cannot follow yourself'], 400); return; }

        ProfileService::follow($pdo, (string) $request->user['id'], (string) $profile['id']);
        Response::json(['following' => true]);
    }

    public static function unfollowProfile(Request $request): void
    {
        $pdo = Database::connection();
        $profile = ProfileService::getByUsername($pdo, (string) $request->params['username']);
        if (!$profile) { Response::json(['error' => 'Profile not found'], 404); return; }
        ProfileService::unfollow($pdo, (string) $request->user['id'], (string) $profile['id']);
        Response::json(['following' => false]);
    }
}
