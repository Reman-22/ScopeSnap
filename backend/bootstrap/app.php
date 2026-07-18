<?php

use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'freelancer' => \App\Http\Middleware\EnsureFreelancer::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            if ($e instanceof ValidationException) {
                return ApiResponse::validationError(
                    $e->errors(),
                    $e->getMessage() ?: 'Validation failed'
                );
            }

            if ($e instanceof AuthenticationException) {
                return ApiResponse::unauthorized($e->getMessage() ?: 'Unauthorized');
            }

            if ($e instanceof AuthorizationException) {
                return ApiResponse::forbidden($e->getMessage() ?: 'Forbidden');
            }

            if ($e instanceof ModelNotFoundException) {
                return ApiResponse::notFound('Resource not found');
            }

            if ($e instanceof NotFoundHttpException) {
                return ApiResponse::notFound('Endpoint not found');
            }

            if ($e instanceof MethodNotAllowedHttpException) {
                return ApiResponse::error('Method not allowed', 405);
            }

            if ($e instanceof HttpException) {
                return ApiResponse::error(
                    $e->getMessage() ?: 'Request failed',
                    $e->getStatusCode()
                );
            }

            if (config('app.debug')) {
                return ApiResponse::error($e->getMessage(), 500, [
                    'exception' => class_basename($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]);
            }

            return ApiResponse::serverError();
        });
    })->create();
