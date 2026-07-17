<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class HealthController extends Controller
{
    public function index()
    {
        return $this->success([
            'app' => config('app.name'),
            'version' => app()->version(),
        ], 'API is running');
    }
}
