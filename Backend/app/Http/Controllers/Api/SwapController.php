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
                    $query->where('requester_id', $request->user_id)
                        ->orWhere('responder_id', $request->user_id);
                }
            })->paginate(20);

        return response()->json($swaps);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'responder_id' => 'required|exists:users,id',
            'requester_skill_id' => 'required|exists:skills,id',
            'responder_skill_id' => 'required|exists:skills,id',
        ]);

        $swap = Swap::create([
            'requester_id' => Auth::id(),
            'responder_id' => $data['responder_id'],
            'requester_skill_id' => $data['requester_skill_id'],
            'responder_skill_id' => $data['responder_skill_id'],
            'status' => 'pending',
        ]);

        return response()->json($swap, 201);
    }

    public function accept(Swap $swap)
    {
        if ($swap->responder_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $swap->update(['status' => 'accepted']);
        return response()->json($swap);
    }

    public function reject(Swap $swap)
    {
        if ($swap->responder_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $swap->update(['status' => 'rejected']);
        return response()->json($swap);
    }
}

