<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreativeWork extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'category',
        'description',
        'cover_image',
        'media_url',
        'status',
        'featured',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'featured' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
