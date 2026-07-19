<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('description');
            $table->enum('action', [
                'project_created',
                'project_updated',
                'scope_sent',
                'section_added',
                'section_updated',
                'section_deleted',
                'item_added',
                'item_updated',
                'item_deleted',
                'scope_approved',
                'scope_rejected',
                'change_request_created',
                'change_request_approved',
                'change_request_rejected',
                'change_request_deleted',
            ]);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
