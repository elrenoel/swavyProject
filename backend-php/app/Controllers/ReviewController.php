<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Middlewares\AuthMiddleware;
use App\Services\ReviewService;
use App\Services\SupabaseService;

final class ReviewController
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

    public static function createReview(Request $request): void
    {
        $b = $request->json();
        $trackId = (string) ($b['track_id'] ?? $b['trackId'] ?? '');
        $title = (string) ($b['title'] ?? '');
        $ratingRaw = $b['rating'] ?? null;

        if ($trackId === '' || $title === '') { Response::json(['error' => 'track_id (or trackId) and title are required'], 400); return; }
        if (!is_numeric($ratingRaw)) { Response::json(['error' => 'Rating must be 1-5'], 400); return; }
        $rating = (int) $ratingRaw;
        if ($rating < 1 || $rating > 5) { Response::json(['error' => 'Rating must be 1-5'], 400); return; }

        $payload = [
            'user_id' => (string) $request->user['id'],
            'username' => (string) ($request->user['user_metadata']['username'] ?? $request->user['email'] ?? 'Anonymous'),
            'track_id' => $trackId,
            'album_id' => $b['album_id'] ?? $b['albumId'] ?? null,
            'album_name' => $b['album_name'] ?? $b['albumName'] ?? null,
            'album_type' => $b['album_type'] ?? $b['albumType'] ?? null,
            'title' => $title,
            'artist' => $b['artist'] ?? null,
            'image_url' => $b['image_url'] ?? $b['imageUrl'] ?? null,
            'rating' => $rating,
            'content' => !empty($b['content']) ? (string) $b['content'] : null,
        ];

        try {
            $review = ReviewService::create(Database::connection(), $payload);
            Response::json(['review' => $review], 201);
        } catch (\PDOException $e) {
            if ($e->getCode() === '23505') { Response::json(['error' => 'Review already exists'], 409); return; }
            Response::json(['error' => $e->getMessage()], 500);
        } catch (\Throwable $e) { Response::json(['error' => $e->getMessage()], 500); }
    }

    public static function updateReview(Request $request): void
    {
        $b = $request->json();
        $ratingRaw = $b['rating'] ?? null;
        if (!is_numeric($ratingRaw)) { Response::json(['error' => 'Rating must be 1-5'], 400); return; }
        $rating = (int) $ratingRaw;
        if ($rating < 1 || $rating > 5) { Response::json(['error' => 'Rating must be 1-5'], 400); return; }

        try {
            $review = ReviewService::update(Database::connection(), (string) $request->params['id'], (string) $request->user['id'], $rating, !empty($b['content']) ? (string) $b['content'] : null);
            Response::json(['review' => $review], 200);
        } catch (\Throwable $e) { Response::json(['error' => $e->getMessage()], 500); }
    }

    public static function getMyTrackReview(Request $request): void
    {
        try {
            $review = ReviewService::getMyTrackReview(Database::connection(), (string) $request->params['id'], (string) $request->user['id']);
            Response::json(['review' => $review]);
        } catch (\Throwable $e) { Response::json(['error' => $e->getMessage()], 500); }
    }

    public static function getRecentReviews(Request $request): void
    {
        $limit = max(1, (int) $request->query('limit', 100));
        $offset = max(0, (int) $request->query('offset', 0));
        try {
            $data = ReviewService::getRecent(Database::connection(), $limit, $offset, self::viewerId($request));
            Response::json($data);
        } catch (\Throwable $e) { Response::json(['error' => $e->getMessage()], 500); }
    }

    public static function getTrackReviews(Request $request): void
    {
        try {
            $data = ReviewService::getTrack(Database::connection(), (string) $request->params['id'], self::viewerId($request));
            Response::json($data);
        } catch (\Throwable $e) { Response::json(['error' => $e->getMessage()], 500); }
    }

    public static function getPopularReviews(Request $request): void
    {
        $limit = max(1, (int) $request->query('limit', 4));
        $days = max(1, (int) $request->query('days', 7));
        $since = gmdate('c', time() - ($days * 86400));
        try {
            $data = ReviewService::getPopular(Database::connection(), $limit, $since);
            Response::json($data);
        } catch (\Throwable $e) { Response::json(['error' => $e->getMessage()], 500); }
    }

    public static function toggleReviewLike(Request $request): void
    {
        try {
            $result = ReviewService::toggleLike(Database::connection(), (string) $request->params['id'], (string) $request->user['id']);
            if (!$result) { Response::json(['error' => 'Review not found'], 404); return; }
            Response::json($result);
        } catch (\Throwable $e) { Response::json(['error' => $e->getMessage()], 500); }
    }
}
