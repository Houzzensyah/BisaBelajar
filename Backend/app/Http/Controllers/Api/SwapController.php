<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Swap;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SwapController extends Controller
{
    public function index(Request $request)
    {
        $swaps = Swap::with(['requester', 'responder', 'requesterSkill', 'responderSkill'])
            ->where(function ($query) use ($request) {
                if ($request->has('user_id')) {
                    $query->where('responder_id', $request->user_id);
                }
            })->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($swaps);
    }

    public function show(Swap $swap)
    {
        return response()->json([
            "id" => $swap->id,
            "requester" => $swap->requester,
            "responder" => $swap->responder,
            "requester_skill" => $swap->requesterSkill,
            "responder_skill" => $swap->responderSkill,
            "description" => $swap->description,
            "status" => $swap->status,
            "created_at" => $swap->created_at,
            "updated_at" => $swap->updated_at,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'target_user_id' => 'required|exists:users,id',
            'requester_skill_id' => 'required|string',
            'requested_skill_id' => 'nullable|string',
            'description' => 'nullable|string|max:1000',
        ]);

        // Convert string skill IDs to integers if needed
        $requesterSkillId = $this->parseSkillId($data['requester_skill_id']);
        $responderSkillId = isset($data['requested_skill_id']) ? $this->parseSkillId($data['requested_skill_id']) : null;

        // Validate that skills exist
        $requesterSkill = Skill::find($requesterSkillId);
        if (!$requesterSkill) {
            return response()->json(['message' => 'Requester skill not found'], 400);
        }

        if ($responderSkillId) {
            $responderSkill = Skill::find($responderSkillId);
            if (!$responderSkill) {
                return response()->json(['message' => 'Requested skill not found'], 400);
            }
        }

        // Check if user is trying to swap with themselves
        if ($data['target_user_id'] == Auth::id()) {
            return response()->json(['message' => 'Cannot create swap request with yourself'], 400);
        }

        // Check if target user has the requested skill (if specified)
        if ($responderSkillId && $responderSkill->user_id != $data['target_user_id']) {
            return response()->json(['message' => 'Target user does not have the requested skill'], 400);
        }

        $swap = Swap::create([
            'requester_id' => Auth::id(),
            'responder_id' => $data['target_user_id'],
            'requester_skill_id' => $requesterSkillId,
            'responder_skill_id' => $responderSkillId,
            'description' => $data['description'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json($swap->load(['requester', 'responder', 'requesterSkill', 'responderSkill']), 201);
    }

    public function accept(Swap $swap)
    {
        $userId = Auth::id();

        // Debug logging
        \Log::info('Swap accept attempt', [
            'swap_id' => $swap->id,
            'swap_responder_id' => $swap->responder_id,
            'auth_user_id' => $userId,
            'swap_status' => $swap->status
        ]);

        if ($swap->responder_id !== $userId) {
            return response()->json([
                'message' => 'Forbidden: You can only accept swaps where you are the responder',
                'debug' => [
                    'swap_id' => $swap->id,
                    'your_user_id' => $userId,
                    'swap_responder_id' => $swap->responder_id
                ]
            ], 403);
        }

        if ($swap->status !== 'pending') {
            return response()->json([
                'message' => 'Cannot accept swap: Status is ' . $swap->status
            ], 400);
        }

        $swap->update(['status' => 'accepted']);
        return response()->json($swap->load(['requester', 'responder', 'requesterSkill', 'responderSkill']));
    }

    public function reject(Swap $swap)
    {
        $userId = Auth::id();

        // Debug logging
        \Log::info('Swap reject attempt', [
            'swap_id' => $swap->id,
            'swap_responder_id' => $swap->responder_id,
            'auth_user_id' => $userId,
            'swap_status' => $swap->status
        ]);

        if ($swap->responder_id !== $userId) {
            return response()->json([
                'message' => 'Forbidden: You can only reject swaps where you are the responder',
                'debug' => [
                    'swap_id' => $swap->id,
                    'your_user_id' => $userId,
                    'swap_responder_id' => $swap->responder_id
                ]
            ], 403);
        }

        if ($swap->status !== 'pending') {
            return response()->json([
                'message' => 'Cannot reject swap: Status is ' . $swap->status
            ], 400);
        }

        $swap->update(['status' => 'rejected']);
        return response()->json($swap->load(['requester', 'responder', 'requesterSkill', 'responderSkill']));
    }

    /**
     * Parse skill ID that can be either integer or string format
     */
    private function parseSkillId($skillId)
    {
        // If it's already an integer, return as is
        if (is_int($skillId) || ctype_digit($skillId)) {
            return (int) $skillId;
        }

        // If it's a string like "skill_001", extract the number
        if (preg_match('/skill_(\d+)/', $skillId, $matches)) {
            return (int) $matches[1];
        }

        // If it's just a string number, convert to int
        return (int) $skillId;
    }
}

