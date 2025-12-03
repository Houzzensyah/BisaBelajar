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
            'video_url' => null,
            'course_id' => optional(\App\Models\Course::inRandomOrder()->first())->id,
        ];
    }
}
