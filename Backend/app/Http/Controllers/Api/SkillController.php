<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SkillController extends Controller
{
    public function index(Request $request)
    {
        $query = Skill::query();

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $skills = $query->with('user')->paginate(20);
        return response()->json($skills);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $skill = Auth::user()->skills()->create($data);

        return response()->json($skill, 201);
    }

    public function show(Skill $skill)
    {
        return response()->json($skill->load('user'));
    }

    public function update(Request $request, Skill $skill)
    {
        if ($skill->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $skill->update($data);
        return response()->json($skill);
    }

    public function destroy(Skill $skill)
    {
        if ($skill->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $skill->delete();
        return response()->json(['message' => 'Skill deleted']);
    }
}

