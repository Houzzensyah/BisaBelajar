<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::query();

        // Only fetch top-level posts (not replies)
        $query->whereNull('thread_id');

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Eager load user, course, and thread replies
        $posts = $query->with(['user' => function ($q) {
            $q->with('skills');
        }, 'course', 'replies' => function ($q) {
            $q->with('user')->latest();
        }])->latest()->paginate(20);

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'course_id' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        // Parse course_id if provided
        $courseId = null;
        if (isset($data['course_id']) && !empty($data['course_id'])) {
            $courseId = $this->parseCourseId($data['course_id']);
            // Validate that course exists
            $course = Course::find($courseId);
            if (!$course) {
                return response()->json(['message' => 'Course not found'], 400);
            }
        }

        $postData = [
            'title' => $data['title'] ?? null,
            'content' => $data['content'],
            'user_id' => Auth::id(),
            'course_id' => $courseId,
        ];

        // Handle image upload (frontend sends as 'image')
        if ($request->hasFile('image')) {
            try {
                $file = $request->file('image');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('posts', $filename, 'public');
                if ($path) {
                    // Store the full URL path
                    $postData['photo_url'] = config('app.url') . '/storage/' . $path;
                }
            } catch (\Exception $e) {
                return response()->json(['message' => 'Failed to upload image: ' . $e->getMessage()], 422);
            }
        }

        $post = Post::create($postData);
        return response()->json($post->load('user', 'course'), 201);
    }

    public function show(Post $post)
    {
        return response()->json($post->load(['user', 'course', 'replies' => function ($q) {
            $q->with('user')->latest();
        }]));
    }

    public function destroy(Post $post)
    {
        if ($post->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $post->delete();
        return response()->json(['message' => 'Deleted']);
    }

    /**
     * Parse course ID that can be either integer or string format
     */
    private function parseCourseId($courseId)
    {
        // If it's already an integer, return as is
        if (is_int($courseId) || ctype_digit($courseId)) {
            return (int) $courseId;
        }

        // If it's a string like "course_002", extract the number
        if (preg_match('/course_(\d+)/', $courseId, $matches)) {
            return (int) $matches[1];
        }

        // If it's just a string number, convert to int
        return (int) $courseId;
    }
}
