<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'video_url',
        'photo_url',
        'course_id',
        'thread_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function thread()
    {
        return $this->belongsTo(Post::class, 'thread_id');
    }

    public function replies()
    {
        return $this->hasMany(Post::class, 'thread_id');
    }
}
