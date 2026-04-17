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
        if (!Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('customer_name')->nullable();
                $table->string('customer_email')->nullable();
                $table->string('customer_phone')->nullable();
                $table->text('shipping_address')->nullable();
                $table->enum('status', ['pending', 'approved', 'rejected', 'delivered'])->default('pending');
                $table->decimal('total_price', 10, 2);
                $table->decimal('delivery_fee', 8, 2)->default(0);
                $table->decimal('service_fee', 8, 2)->default(0);
                $table->enum('payment_method', ['Cash', 'Visa', 'PayPal', 'Zain Cash']);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('order_items')) {
            Schema::create('order_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained()->onDelete('cascade');
                $table->foreignId('product_id')->nullable()->constrained()->onDelete('cascade');
                $table->foreignId('package_id')->nullable()->constrained()->onDelete('cascade');
                $table->integer('quantity');
                $table->decimal('price_at_purchase', 8, 2);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
