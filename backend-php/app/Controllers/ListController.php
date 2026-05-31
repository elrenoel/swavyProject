<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Services\ListService;

final class ListController
{
    public static function getLists(Request $request): void
    {
        try {
            $lists = ListService::getLists(Database::connection(), (string) $request->user['id']);
            Response::json(['lists' => $lists]);
        } catch (\Throwable $e) {
            Response::json(['error' => $e->getMessage()], 500);
        }
    }

    public static function getListById(Request $request): void
    {
        try {
            $list = ListService::getListById(Database::connection(), (string) $request->params['id']);
            if (!$list) { Response::json(['error' => 'List not found'], 404); return; }
            Response::json(['list' => $list]);
        } catch (\Throwable $e) { Response::json(['error' => $e->getMessage()], 500); }
    }

    public static function createList(Request $request): void
    {
        $body = $request->json();
        $title = isset($body['title']) ? trim((string) $body['title']) : '';
        if ($title === '') { Response::json(['error' => 'Title is required'], 400); return; }

        try {
            $list = ListService::createList(Database::connection(), (string) $request->user['id'], $title, isset($body['desc']) ? (string) $body['desc'] : null);
            Response::json(['list' => $list], 201);
        } catch (\Throwable $e) { Response::json(['error' => $e->getMessage()], 500); }
    }

    public static function updateList(Request $request): void
    {
        $body = $request->json();
        $title = array_key_exists('title', $body) ? (string) $body['title'] : null;
        $hasDesc = array_key_exists('desc', $body);
        $desc = $hasDesc ? ($body['desc'] !== null ? (string) $body['desc'] : null) : null;
        if ($title === null && !$hasDesc) { Response::json(['error' => 'Provide title or desc to update'], 400); return; }

        try {
            $list = ListService::updateList(Database::connection(), (string) $request->params['id'], (string) $request->user['id'], $title, $hasDesc, $desc);
            if (!$list) { Response::json(['error' => 'List not found'], 404); return; }
            Response::json(['list' => $list]);
        } catch (\Throwable $e) { Response::json(['error' => $e->getMessage()], 500); }
    }

    public static function deleteList(Request $request): void
    {
        try {
            $ok = ListService::deleteList(Database::connection(), (string) $request->params['id'], (string) $request->user['id']);
            if (!$ok) { Response::json(['error' => 'List not found'], 404); return; }
            Response::json(['message' => 'List deleted']);
        } catch (\Throwable $e) { Response::json(['error' => $e->getMessage()], 500); }
    }

    public static function addSongToList(Request $request): void
    {
        $body = $request->json();
        $songId = (string) ($body['song_id'] ?? $body['songId'] ?? $body['id'] ?? '');
        $title = (string) ($body['title'] ?? '');
        if ($songId === '' || $title === '') { Response::json(['error' => 'song_id (or id) and title are required'], 400); return; }

        try {
            $song = ListService::addSong(Database::connection(), (string) $request->params['id'], $songId, $title, isset($body['artist']) ? (string) $body['artist'] : null, isset($body['image']) ? (string) $body['image'] : null);
            Response::json(['song' => $song], 201);
        } catch (\PDOException $e) {
            if ($e->getCode() === '23505') { Response::json(['error' => 'Song already in list'], 409); return; }
            Response::json(['error' => $e->getMessage()], 500);
        } catch (\Throwable $e) { Response::json(['error' => $e->getMessage()], 500); }
    }

    public static function removeSongFromList(Request $request): void
    {
        try {
            $ok = ListService::removeSong(Database::connection(), (string) $request->params['id'], (string) $request->params['songId']);
            if (!$ok) { Response::json(['error' => 'Song not found'], 404); return; }
            Response::json(['message' => 'Song removed']);
        } catch (\Throwable $e) { Response::json(['error' => $e->getMessage()], 500); }
    }
}
