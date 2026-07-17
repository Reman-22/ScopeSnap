<?php

namespace App\Http\Controllers;

use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

abstract class Controller
{
    protected function success(
        mixed $data = null,
        string $message = 'Success',
        int $status = 200
    ): JsonResponse {
        return ApiResponse::success($data, $message, $status);
    }

    protected function created(
        mixed $data = null,
        string $message = 'Resource created successfully'
    ): JsonResponse {
        return ApiResponse::created($data, $message);
    }

    protected function error(
        string $message,
        int $status = 400,
        mixed $errors = null
    ): JsonResponse {
        return ApiResponse::error($message, $status, $errors);
    }

    protected function notFound(string $message = 'Resource not found'): JsonResponse
    {
        return ApiResponse::notFound($message);
    }

    protected function unauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return ApiResponse::unauthorized($message);
    }

    protected function forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return ApiResponse::forbidden($message);
    }

    protected function validationError(
        mixed $errors,
        string $message = 'Validation failed'
    ): JsonResponse {
        return ApiResponse::validationError($errors, $message);
    }

    protected function serverError(string $message = 'Internal server error'): JsonResponse
    {
        return ApiResponse::serverError($message);
    }
}
