<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = [
        'full_name',
        'headline',
        'location',
        'short_bio',
        'about',
        'portrait_url',
        'cv_url',
        'available_for_work',
    ];

    protected function casts(): array
    {
        return [
            'available_for_work' => 'boolean',
        ];
    }
}
