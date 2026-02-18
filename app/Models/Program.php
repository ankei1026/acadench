<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Program extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'programs';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'prog_id';

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'prog_id',
        'name',
        'prog_type',
        'description',
        'days',
        'start_time',
        'end_time',
        'price',
        'setting',
        'session_count',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'days' => 'array',
        'start_time' => 'datetime:H:i:s',
        'end_time' => 'datetime:H:i:s',
        'price' => 'decimal:2',
        'session_count' => 'integer',
    ];

    /**
     * Boot method for the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->prog_id)) {
                $model->prog_id = self::generateProgramId();
            }
        });
    }

    /**
     * Generate a unique program ID in the format PRG_{4 random characters}
     *
     * @return string
     */
    public static function generateProgramId(): string
    {
        do {
            // Generate 4 random uppercase alphanumeric characters
            $random = Str::upper(Str::random(4));
            $programId = 'PRG_' . $random;
        } while (self::where('prog_id', $programId)->exists());

        return $programId;
    }

    /**
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'prog_id';
    }

    /**
     * Check if the program has available slots.
     *
     * @return bool
     */
    public function hasAvailableSlots(): bool
    {
        return $this->available_slots > 0;
    }

    /**
     * Scope a query to filter by program type.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('prog_type', $type);
    }

    /**
     * Scope a query to search programs by name or ID.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where('name', 'like', "%{$search}%")
                     ->orWhere('prog_id', 'like', "%{$search}%");
    }
}
