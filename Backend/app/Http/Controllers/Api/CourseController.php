<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with('owner', 'skills');

        // Filter by skills
        if ($request->has('skills') && !empty($request->skills)) {
            $skillIds = is_array($request->skills) ? $request->skills : explode(',', $request->skills);
            $query->whereHas('skills', function ($q) use ($skillIds) {
                $q->whereIn('skills.id', $skillIds);
            });
        }

        // Filter by skill names (alternative way)
        if ($request->has('skill_names') && !empty($request->skill_names)) {
            $skillNames = is_array($request->skill_names) ? $request->skill_names : explode(',', $request->skill_names);
            $query->whereHas('skills', function ($q) use ($skillNames) {
                $q->whereIn('skills.name', $skillNames);
            });
        }

        // Filter by search term in title or description
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by owner
        if ($request->has('owner_id')) {
            $query->where('owner_id', $request->owner_id);
        }

        // Sort options
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSortFields = ['created_at', 'title', 'updated_at'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $courses = $query->paginate(20);

        // Add skill information to response
        $courses->getCollection()->transform(function ($course) {
            $course->skills_count = $course->skills->count();
            $course->students_count = $course->students->count();
            return $course;
        });

        return response()->json($courses);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $course = Course::create([
            'owner_id' => Auth::id(),
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
        ]);

        return response()->json($course, 201);
    }

    public function show(Course $course)
    {
        return response()->json($course->load('students'));
    }

    public function enroll(Request $request, Course $course)
    {
        $course->students()->attach(Auth::id());
        return response()->json(['message' => 'Enrolled successfully']);
    }

    public function enrolled(Request $request){
        return response()->json(["data" => $request->user()->courses()->with('owner')->get()]);
    }
}

