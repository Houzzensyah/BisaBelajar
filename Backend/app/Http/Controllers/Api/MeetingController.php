<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MeetingController extends Controller
{
    public function index(Request $request)
    {
        $meetings = Meeting::where(function ($q) {
            $q->where('host_id', Auth::id())->orWhere('guest_id', Auth::id());
        })->with(['host', 'guest'])->paginate(20);

        return response()->json($meetings);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'guest_id' => 'required|exists:users,id',
            'scheduled_at' => 'required|date',
            'platform' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $meeting = Meeting::create([
            'host_id' => Auth::id(),
            'guest_id' => $data['guest_id'],
            'scheduled_at' => $data['scheduled_at'],
            'platform' => $data['platform'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        return response()->json($meeting, 201);
    }
}

