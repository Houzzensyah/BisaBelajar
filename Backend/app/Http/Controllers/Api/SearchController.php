<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Skill;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->query('query');
        $lat = $request->query('lat');
        $lng = $request->query('lng');
        $distance = (float) ($request->query('distance', 50));
        $specialty = $request->query('specialty');
        $hasQuery = !empty($query);

        if (! $hasQuery && empty($specialty) && empty($lat) && empty($lng)) {
            return response()->json(['users' => [], 'skills' => []]);
        }

        $usersQuery = User::query();

        if ($hasQuery) {
            $usersQuery = $usersQuery->where('name', 'like', "%{$query}%")
            ->orWhereHas('skills', function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%");
            })
            ->with('skills', 'posts')
            ;
        } else {
            $usersQuery = $usersQuery->with('skills', 'posts');
        }

        // Filter by specialty if provided
        if (!empty($specialty)) {
            $usersQuery->whereHas('specialties', function ($q) use ($specialty) {
                $q->where('specialties.id', $specialty);
            });
        }

        if ($lat && $lng) {
            $usersQuery = $usersQuery->nearby($lat, $lng, $distance);
        }

        $users = $usersQuery->paginate(20);

        $skillsQuery = Skill::where('name', 'like', "%{$query}%")->with('user');

        if ($lat && $lng) {
            // If lat/lng provided, filter skills by owner proximity
            $skillsQuery->whereHas('user', function ($q) use ($lat, $lng, $distance) {
                $q->nearby($lat, $lng, $distance);
            });
        }

        if (!empty($specialty)) {
            // Filter by specialty through user
            $skillsQuery->whereHas('user', function ($q) use ($specialty) {
                $q->whereHas('specialties', function ($r) use ($specialty) {
                    $r->where('specialties.id', $specialty);
                });
            });
        }

        $skills = $skillsQuery->paginate(20);

        return response()->json(['users' => $users, 'skills' => $skills]);
    }
}
