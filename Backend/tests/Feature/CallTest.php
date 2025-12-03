<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class CallTest extends TestCase
{
    use RefreshDatabase;

    public function test_call_lifecycle(): void
    {
        $this->seed();
        $caller = User::first();
        $callee = User::where('id', '!=', $caller->id)->first();
        $callerToken = $caller->createToken('test')->plainTextToken;
        $calleeToken = $callee->createToken('test')->plainTextToken;

        // Caller starts a call
        $response = $this->actingAs($caller, 'sanctum')
            ->postJson('/api/calls', ['callee_id' => $callee->id]);
        $response->assertStatus(201);
        $call = $response->json();
        $this->assertNotNull($call['id']);

        // Callee accepts the call
        $response = $this->actingAs($callee, 'sanctum')
            ->postJson('/api/calls/'.$call['id'].'/accept');
        // Ensure callee successfully accepts the call
        $response->assertStatus(200);

        // Caller ends the call
        $response = $this->actingAs($caller, 'sanctum')
            ->postJson('/api/calls/'.$call['id'].'/end');
        $response->assertStatus(200);
    }
}
