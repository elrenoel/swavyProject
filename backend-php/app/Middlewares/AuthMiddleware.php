<?php

declare(strict_types=1);

namespace App\Middlewares;

use App\Core\Request;
use App\Core\Response;
use App\Services\SupabaseService;

final class AuthMiddleware
{
    public static function handle(Request $request, callable $next): void
    {
        $token = self::extractAccessToken($request);
        if ($token === null || $token === '') {
            Response::json(['error' => 'Unauthorized'], 401);
            return;
        }

        try {
            $user = SupabaseService::authUser($token);
            if (!isset($user['id'])) {
                Response::json(['error' => 'Unauthorized'], 401);
                return;
            }

            $request->accessToken = $token;
            $request->user = $user;
            $next();
        } catch (\Throwable) {
            Response::json(['error' => 'Unauthorized'], 401);
        }
    }

    public static function extractAccessToken(Request $request): ?string
    {
        $header = $request->header('Authorization') ?? '';
        if (str_starts_with($header, 'Bearer ')) {
            return trim(substr($header, 7));
        }

        return $request->cookie('access_token');
    }
}
