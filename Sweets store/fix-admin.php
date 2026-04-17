<?php 
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::updateOrCreate(
    ['email' => 'admin@enjoyplus.com'],
    [
        'name' => 'Admin User',
        'password' => '123456789',
        'role' => 'Admin',
        'is_banned' => false,
    ]
);

echo "Admin User: admin@enjoyplus.com | Password: 123456789 | OK";
