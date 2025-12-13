<?php

namespace Database\Factories;

use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition()
    {
        return [
            'user_id' => 1,
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraphs(2, true),
            'photo_url' => $this->faker->imageUrl(640, 480, 'post', true, 'Post'),
            'video_url' => null,
            'course_id' => optional(\App\Models\Course::inRandomOrder()->first())->id,
        ];
    }
}
