<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'account_number',
        'account_name',
        'instructions',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function receipts(): HasMany
    {
        return $this->hasMany(Receipt::class);
    }
}
