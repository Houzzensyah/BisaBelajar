<?php

namespace Database\Factories;

use App\Models\Swap;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SwapFactory extends Factory
{
    protected $model = Swap::class;

    public function definition(): array
    {
        return [
            'requester_id' => User::factory(),
            'responder_id' => User::factory(),
            'requester_skill_id' => Skill::factory(),
            'responder_skill_id' => Skill::factory(),
            'status' => 'pending'
        ];
    }
}

