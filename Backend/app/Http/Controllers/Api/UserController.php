<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Skill;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('skills', 'specialties');

        // Filter by skills
        if ($request->has('skills') && !empty($request->skills)) {
            $skillIds = is_array($request->skills) ? $request->skills : explode(',', $request->skills);
            $query->whereHas('skills', function ($q) use ($skillIds) {
                $q->whereIn('skills.id', $skillIds);
            });
        }

        // Filter by skill names
        if ($request->has('skill_names') && !empty($request->skill_names)) {
            $skillNames = is_array($request->skill_names) ? $request->skill_names : explode(',', $request->skill_names);
            $query->whereHas('skills', function ($q) use ($skillNames) {
                $q->whereIn('skills.name', $skillNames);
            });
        }

        // Filter by specialties
        if ($request->has('specialties') && !empty($request->specialties)) {
            $specialtyIds = is_array($request->specialties) ? $request->specialties : explode(',', $request->specialties);
            $query->whereHas('specialties', function ($q) use ($specialtyIds) {
                $q->whereIn('specialties.id', $specialtyIds);
            });
        }

        // Filter by specialty names
        if ($request->has('specialty_names') && !empty($request->specialty_names)) {
            $specialtyNames = is_array($request->specialty_names) ? $request->specialty_names : explode(',', $request->specialty_names);
            $query->whereHas('specialties', function ($q) use ($specialtyNames) {
                $q->whereIn('specialties.name', $specialtyNames);
            });
        }

        // Filter by search term in name, bio, or email
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('bio', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by location (basic distance filter)
        if ($request->has(['latitude', 'longitude', 'radius'])) {
            $lat = $request->latitude;
            $lng = $request->longitude;
            $radius = $request->radius; // in kilometers

            // Using Haversine formula for distance calculation
            $query->selectRaw("*, (
                6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))
            ) AS distance", [$lat, $lng, $lat])
            ->having('distance', '<=', $radius)
            ->orderBy('distance');
        }

        // Filter by minimum score
        if ($request->has('min_score')) {
            $query->where('score', '>=', $request->min_score);
        }

        // Sort options
        $sortBy = $request->get('sort_by', 'score');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSortFields = ['score', 'name', 'created_at', 'updated_at'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $users = $query->paginate(20);

        // Add additional information to response
        $users->getCollection()->transform(function ($user) {
            $user->skills_count = $user->skills->count();
            $user->courses_count = $user->courses->count();
            $user->posts_count = $user->posts->count();
            return $user;
        });

        return response()->json($users);
    }

    public function show(User $user)
    {
        return response()->json($user->load('skills', 'posts', 'courses', 'specialties'));
    }
}
