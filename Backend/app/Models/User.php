<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Skill;
use App\Models\Swap;
use App\Models\Course;
use App\Models\Message;
use App\Models\Meeting;
use App\Models\Post;
use App\Models\Specialty;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'bio',
        'latitude',
        'longitude',
        'avatar_path',
        'score'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    /**
     * The attributes that should be cast.
     *
     * @var array<string,string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function skills(): HasMany
    {
        return $this->hasMany(Skill::class);
    }

    public function swapsRequested(): HasMany
    {
        return $this->hasMany(Swap::class, 'requester_id');
    }

    public function swapsResponded(): HasMany
    {
        return $this->hasMany(Swap::class, 'responder_id');
    }

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_user', 'user_id', 'course_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function specialties(): BelongsToMany
    {
        return $this->belongsToMany(Specialty::class, 'specialty_user');
    }

    /**
     * Scope query to sort by proximity to the given lat/lng. Works with SQLite fallback.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param float $lat
     * @param float $lng
     * @param float $distanceKm
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeNearby($query, $lat, $lng, $distanceKm = 50)
    {
        if (is_null($lat) || is_null($lng)) {
            return $query;
        }

        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            // SQLite has limited trigonometric support, fallback to simple squared distance ordering
            return $query->selectRaw("*, ((latitude - ?) * (latitude - ?) + (longitude - ?) * (longitude - ?)) as distance", [$lat, $lat, $lng, $lng])
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->orderBy('distance');
        }

        // Haversine formula for MySQL/Postgres
        return $query->selectRaw(
            '*, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) as distance',
            [$lat, $lng, $lat]
        )
        ->whereNotNull('latitude')
        ->whereNotNull('longitude')
        ->havingRaw('distance <= ?', [$distanceKm])
        ->orderBy('distance');
    }

    public function meetingsHosted(): HasMany
    {
        return $this->hasMany(Meeting::class, 'host_id');
    }

    public function meetingsAttending(): HasMany
    {
        return $this->hasMany(Meeting::class, 'guest_id');
    }
}
