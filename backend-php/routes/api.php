<?php

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\ListController;
use App\Controllers\ProfileController;
use App\Controllers\ReviewController;
use App\Controllers\SpotifyController;
use App\Core\Router;
use App\Middlewares\AuthMiddleware;

/** @var Router $router */

$router->add('POST', '/api/auth/register', [AuthController::class, 'register']);
$router->add('POST', '/api/auth/login', [AuthController::class, 'login']);
$router->add('GET', '/api/auth/me', [AuthController::class, 'me']);
$router->add('POST', '/api/auth/refresh', [AuthController::class, 'refresh']);
$router->add('POST', '/api/auth/logout', [AuthController::class, 'logout']);
$router->add('POST', '/api/auth/verify-otp', [AuthController::class, 'verifyOTP']);
$router->add('POST', '/api/auth/resend-otp', [AuthController::class, 'resendOTP']);

$router->add('GET', '/api/new-releases', [SpotifyController::class, 'getNewReleases']);
$router->add('GET', '/api/search', [SpotifyController::class, 'searchTracks']);
$router->add('GET', '/api/album/:id', [SpotifyController::class, 'getAlbumDetail']);
$router->add('GET', '/api/track/:id', [SpotifyController::class, 'getTrackDetail']);
$router->add('GET', '/api/discover', [SpotifyController::class, 'getDiscover']);

$router->add('GET', '/api/lists', [ListController::class, 'getLists'], [[AuthMiddleware::class, 'handle']]);
$router->add('POST', '/api/lists', [ListController::class, 'createList'], [[AuthMiddleware::class, 'handle']]);
$router->add('GET', '/api/lists/:id', [ListController::class, 'getListById'], [[AuthMiddleware::class, 'handle']]);
$router->add('PUT', '/api/lists/:id', [ListController::class, 'updateList'], [[AuthMiddleware::class, 'handle']]);
$router->add('DELETE', '/api/lists/:id', [ListController::class, 'deleteList'], [[AuthMiddleware::class, 'handle']]);
$router->add('POST', '/api/lists/:id/songs', [ListController::class, 'addSongToList'], [[AuthMiddleware::class, 'handle']]);
$router->add('DELETE', '/api/lists/:id/songs/:songId', [ListController::class, 'removeSongFromList'], [[AuthMiddleware::class, 'handle']]);

$router->add('GET', '/api/reviews/recent', [ReviewController::class, 'getRecentReviews']);
$router->add('GET', '/api/reviews/popular', [ReviewController::class, 'getPopularReviews']);
$router->add('GET', '/api/reviews/track/:id/me', [ReviewController::class, 'getMyTrackReview'], [[AuthMiddleware::class, 'handle']]);
$router->add('GET', '/api/reviews/track/:id', [ReviewController::class, 'getTrackReviews']);
$router->add('POST', '/api/reviews', [ReviewController::class, 'createReview'], [[AuthMiddleware::class, 'handle']]);
$router->add('PUT', '/api/reviews/:id', [ReviewController::class, 'updateReview'], [[AuthMiddleware::class, 'handle']]);
$router->add('POST', '/api/reviews/:id/like', [ReviewController::class, 'toggleReviewLike'], [[AuthMiddleware::class, 'handle']]);

$router->add('GET', '/api/profiles/:username', [ProfileController::class, 'getProfileByUsername']);
$router->add('GET', '/api/profiles/:username/stats', [ProfileController::class, 'getProfileStats']);
$router->add('GET', '/api/profiles/:username/top-picks', [ProfileController::class, 'getProfileTopPicks']);
$router->add('GET', '/api/profiles/:username/lists', [ProfileController::class, 'getProfileLists']);
$router->add('PATCH', '/api/profiles/me', [ProfileController::class, 'updateProfile'], [[AuthMiddleware::class, 'handle']]);
$router->add('POST', '/api/profiles/me/avatar', [ProfileController::class, 'uploadAvatar'], [[AuthMiddleware::class, 'handle']]);
$router->add('POST', '/api/profiles/:username/follow', [ProfileController::class, 'followProfile'], [[AuthMiddleware::class, 'handle']]);
$router->add('DELETE', '/api/profiles/:username/follow', [ProfileController::class, 'unfollowProfile'], [[AuthMiddleware::class, 'handle']]);
