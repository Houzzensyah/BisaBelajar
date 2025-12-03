<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Call;
use App\Models\Meeting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CallController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'callee_id' => 'required|integer|exists:users,id',
            'meeting_id' => 'nullable|integer|exists:meetings,id',
        ]);

        $call = Call::create([
            'caller_id' => Auth::id(),
            'callee_id' => $data['callee_id'],
            'meeting_id' => $data['meeting_id'] ?? null,
            'status' => 'pending',
            'call_url' => null,
        ]);

        // For now we don't create external call_url; clients should handle signaling.

        return response()->json($call, 201);
    }

    public function accept(Call $call)
    {
        if ($call->callee_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $call->status = 'accepted';
        $call->started_at = now();
        $call->save();

        return response()->json($call);
    }

    public function decline(Call $call)
    {
        if ($call->callee_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $call->status = 'declined';
        $call->save();

        return response()->json(['message' => 'declined']);
    }

    public function end(Call $call)
    {
        if (! in_array(Auth::id(), [$call->caller_id, $call->callee_id])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $call->status = 'ended';
        $call->ended_at = now();
        $call->save();

        return response()->json(['message' => 'ended']);
    }

    public function show(Call $call)
    {
        // Allow both caller and callee to view the call
        if (! in_array(Auth::id(), [$call->caller_id, $call->callee_id])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($call->load('caller', 'callee'));
    }
}
