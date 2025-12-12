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
        // Drop foreign key from enrollments if it exists
        if (Schema::hasColumn('enrollments', 'course_id')) {
            Schema::table('enrollments', function (Blueprint $table) {
                // We need to know the foreign key name. Laravel default is table_column_foreign
                // enrollments_course_id_foreign
                $table->dropForeign(['course_id']);
                $table->dropColumn('course_id');
            });
        }

        Schema::dropIfExists('course_groups');
        Schema::dropIfExists('courses');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We won't implement down as this is a destructive operation intended to remove legacy tables.
    }
};
