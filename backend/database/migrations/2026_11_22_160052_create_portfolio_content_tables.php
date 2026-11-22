
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('headline');
            $table->string('location')->nullable();
            $table->text('short_bio')->nullable();
            $table->longText('about')->nullable();
            $table->string('portrait_url', 2048)->nullable();
            $table->string('cv_url', 2048)->nullable();
            $table->boolean('available_for_work')->default(true);
            $table->timestamps();
        });

        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category');
            $table->string('icon')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });

        Schema::create('creative_works', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category');
            $table->text('description')->nullable();
            $table->string('cover_image', 2048)->nullable();
            $table->string('media_url', 2048)->nullable();
            $table->enum('status', ['draft', 'published'])
                ->default('draft');
            $table->boolean('featured')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_title');
            $table->string('tagline')->nullable();
            $table->string('logo_url', 2048)->nullable();
            $table->string('contact_email')->nullable();
            $table->string('github_url', 2048)->nullable();
            $table->string('linkedin_url', 2048)->nullable();
            $table->string('instagram_url', 2048)->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('subject')->nullable();
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('site_settings');
        Schema::dropIfExists('creative_works');
        Schema::dropIfExists('skills');
        Schema::dropIfExists('profiles');
    }
};
