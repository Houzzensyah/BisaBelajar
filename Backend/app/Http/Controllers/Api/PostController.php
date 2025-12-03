<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
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
        $posts = $query->with(['user', 'course', 'replies' => function ($q) {
            $q->with('user')->latest();
        }])->latest()->paginate(20);

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'video_url' => 'nullable|url',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'course_id' => 'nullable|exists:courses,id',
            'thread_id' => 'nullable|exists:posts,id',
        ]);

        $postData = [
            'title' => $data['title'] ?? null,
            'content' => $data['content'],
            'video_url' => $data['video_url'] ?? null,
            'user_id' => Auth::id(),
            'course_id' => $data['course_id'] ?? null,
            'thread_id' => $data['thread_id'] ?? null,
        ];

        // Handle photo upload
        if ($request->hasFile('photo')) {
            try {
                $file = $request->file('photo');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('posts', $filename, 'public');
                if ($path) {
                    // Return just the path for storage URL construction
                    $postData['photo_url'] = 'storage/' . $path;
                }
            } catch (\Exception $e) {
                return response()->json(['message' => 'Failed to upload photo: ' . $e->getMessage()], 422);
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
}
