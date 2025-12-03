<?php

namespace Database\Factories;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SkillFactory extends Factory
{
    protected $model = Skill::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->unique()->word(),
            'category' => $this->faker->randomElement(['music', 'programming', 'cooking', 'language', 'art']),
            'description' => $this->faker->sentence(),
        ];
    }
}

