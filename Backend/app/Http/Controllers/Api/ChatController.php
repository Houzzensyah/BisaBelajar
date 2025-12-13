<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    public function chats(Request $request)
    {
        $userId = Auth::id();

        // Get all unique conversation partners for the authenticated user
        $conversationPartners = Message::selectRaw('
                CASE
                    WHEN sender_id = ? THEN receiver_id
                    ELSE sender_id
                END as partner_id
            ', [$userId])
            ->where(function ($query) use ($userId) {
                $query->where('sender_id', $userId)
                      ->orWhere('receiver_id', $userId);
            })
            ->distinct()
            ->pluck('partner_id');

        $chats = [];

        foreach ($conversationPartners as $partnerId) {
            // Get the last message in this conversation
            $lastMessage = Message::where(function ($query) use ($userId, $partnerId) {
                $query->where('sender_id', $userId)->where('receiver_id', $partnerId);
            })->orWhere(function ($query) use ($userId, $partnerId) {
                $query->where('sender_id', $partnerId)->where('receiver_id', $userId);
            })->with(['sender', 'receiver'])->latest()->first();

            if (!$lastMessage) {
                continue;
            }

            // Get participants
            $participants = [
                User::find($userId),
                User::find($partnerId)
            ];

            // For now, unread count is 0 since we don't have read tracking
            // In a real implementation, you'd track read messages
            $unreadCount = 0;

            // Create first message timestamp as chat creation time
            $firstMessage = Message::where(function ($query) use ($userId, $partnerId) {
                $query->where('sender_id', $userId)->where('receiver_id', $partnerId);
            })->orWhere(function ($query) use ($userId, $partnerId) {
                $query->where('sender_id', $partnerId)->where('receiver_id', $userId);
            })->oldest()->first();

            $chats[] = [
                'id' => $userId . '-' . $partnerId, // Simple chat ID based on participant IDs
                'participants' => $participants,
                'last_message' => [
                    'content' => $lastMessage->content,
                    'timestamp' => $lastMessage->created_at->toISOString(),
                    'sender' => $lastMessage->sender
                ],
                'unread_count' => $unreadCount,
                'created_at' => $firstMessage->created_at->toISOString(),
                'updated_at' => $lastMessage->updated_at->toISOString()
            ];
        }

        // Sort chats by last message timestamp (most recent first)
        usort($chats, function ($a, $b) {
            return strtotime($b['last_message']['timestamp']) <=> strtotime($a['last_message']['timestamp']);
        });

        return response()->json($chats);
    }

    public function conversation(User $user, Request $request)
    {
        $currentUserId = Auth::id();

        // Ensure users can only access conversations they're part of
        if ($user->id === $currentUserId) {
            return response()->json(['message' => 'Cannot view conversation with yourself'], 400);
        }

        // Get all messages between current user and specified user
        $messages = Message::where(function ($query) use ($currentUserId, $user) {
            $query->where('sender_id', $currentUserId)->where('receiver_id', $user->id);
        })->orWhere(function ($query) use ($currentUserId, $user) {
            $query->where('sender_id', $user->id)->where('receiver_id', $currentUserId);
        })
        ->with(['sender', 'receiver'])
        ->orderBy('created_at', 'asc')
        ->paginate(50);

        // Mark messages as "mine" for frontend
        $messages->getCollection()->transform(function ($message) use ($currentUserId) {
            $message->is_mine = $message->sender_id === $currentUserId;
            return $message;
        });

        // Add conversation metadata
        $conversationData = [
            'participant' => [
                'id' => $user->id,
                'name' => $user->name,
                'avatar_path' => $user->avatar_path,
                'bio' => $user->bio,
                'score' => $user->score,
                'last_active' => $user->updated_at
            ],
            'messages' => $messages,
            'total_messages' => $messages->total(),
            'unread_count' => 0, // TODO: Implement unread tracking
            'last_message_at' => $messages->count() > 0 ? $messages->last()->created_at : null
        ];

        return response()->json($conversationData);
    }

    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        $query = Message::query();

        if ($userId) {
            $query->where(function ($q) use ($userId) {
                $q->where('sender_id', Auth::id())->where('receiver_id', $userId);
            })->orWhere(function ($q) use ($userId) {
                $q->where('sender_id', $userId)->where('receiver_id', Auth::id());
            });
        }

        $messages = $query->with('sender', 'receiver')->latest()->paginate(50);
        return response()->json($messages);
    }

    public function send(Request $request)
    {
        $data = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $data['receiver_id'],
            'content' => $data['content'],
        ]);

        return response()->json($message, 201);
    }

    public function destroy(Message $message)
    {
        // Only the sender can delete their message
        if ($message->sender_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $message->delete();

        return response()->json(null, 204);
    }
}

