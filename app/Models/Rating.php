<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    protected $fillable = [
        'tutor_id',
        'parent_id',
        'rating',
        'feedback',
    ];

    /**
     * Get the parent (user) that owns the rating.
     */
    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }
}
