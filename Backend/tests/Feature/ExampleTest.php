<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    use RefreshDatabase;

    public function test_homepage_behaves(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_api_skills_returns(): void
    {
        $this->seed();

        $user = User::first();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/skills');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data']);
    }

    public function test_api_search_returns_users_and_skills(): void
    {
        $this->seed();
        $user = User::first();
        $token = $user->createToken('test')->plainTextToken;
        // search for 'Guitar' - seeded skill
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/search?query=Guitar');

        $response->assertStatus(200);
        $response->assertJsonStructure(['users', 'skills']);
    }

    public function test_api_posts_can_be_created(): void
    {
        $this->seed();
        $user = User::first();
        $token = $user->createToken('test')->plainTextToken;
        $payload = ['title' => 'A Post', 'content' => 'Hello world'];
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/posts', $payload);
        $response->assertStatus(201);
        $this->assertDatabaseHas('posts', ['title' => 'A Post', 'content' => 'Hello world']);
    }

    public function test_api_search_nearby_users(): void
    {
        $this->seed();
        $user = User::first();
        $token = $user->createToken('test')->plainTextToken;

        // Use the lat/lng of the seeded Alice in San Francisco
        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/search?query=Guitar&lat=37.7749&lng=-122.4194&distance=10');

        $response->assertStatus(200);
        $json = $response->json();
        $this->assertArrayHasKey('users', $json);
        $this->assertArrayHasKey('data', $json['users']);
        $this->assertNotEmpty($json['users']['data']);
        // Alice should be in the results
        $names = array_map(fn($u) => $u['name'], $json['users']['data']);
        $this->assertTrue(in_array('Alice', $names));
    }

    public function test_api_search_filter_specialty(): void
    {
        $this->seed();
        $user = User::first();
        $token = $user->createToken('test')->plainTextToken;

        $guitar = \App\Models\Specialty::where('name', 'Guitar')->first();
        $this->assertNotNull($guitar);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/search?query=&specialty='.$guitar->id);

        $response->assertStatus(200);
        $json = $response->json();
        $this->assertNotEmpty($json['users']['data']);
        $names = array_map(fn($u) => $u['name'], $json['users']['data']);
        $this->assertTrue(in_array('Alice', $names));
    }

    public function test_register_with_specialties_and_location(): void
    {
        $this->seed();

        $guitar = \App\Models\Specialty::where('name', 'Guitar')->first();
        $this->assertNotNull($guitar);

        $payload = [
            'name' => 'Dave',
            'email' => 'dave@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'latitude' => 37.7750,
            'longitude' => -122.4183,
            'specialties' => [$guitar->id],
        ];

        $response = $this->postJson('/api/register', $payload);
        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['email' => 'dave@example.com']);
        $this->assertDatabaseHas('specialty_user', ['specialty_id' => $guitar->id]);
    }
}
