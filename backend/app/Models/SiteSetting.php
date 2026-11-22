<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        'site_title',
        'tagline',
        'logo_url',
        'contact_email',
        'github_url',
        'linkedin_url',
        'instagram_url',
        'seo_description',
    ];
}
