<?php

namespace Database\Factories;

use App\Models\Meeting;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MeetingFactory extends Factory
{
    protected $model = Meeting::class;

    public function definition(): array
    {
        return [
            'host_id' => User::factory(),
            'guest_id' => User::factory(),
            'scheduled_at' => $this->faker->dateTimeBetween('now', '+30 days'),
            'platform' => $this->faker->randomElement(['jitsi', 'zoom', 'meet']),
            'notes' => $this->faker->sentence(),
        ];
    }
}

