<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Swap extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_id',
        'responder_id',
        'requester_skill_id',
        'responder_skill_id',
        'description',
        'status', // pending, accepted, rejected, cancelled
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function responder()
    {
        return $this->belongsTo(User::class, 'responder_id');
    }

    public function requesterSkill()
    {
        return $this->belongsTo(Skill::class, 'requester_skill_id');
    }

    public function responderSkill()
    {
        return $this->belongsTo(Skill::class, 'responder_skill_id');
    }
}

