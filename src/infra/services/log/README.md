# Logging System

This module provides comprehensive logging functionality for the application, including request/response logging and database persistence.

## Components

### LogService
- **Purpose**: Handles database operations for logs
- **Features**:
  - Save logs to database with metadata
  - Retrieve logs with filtering and pagination
  - Clean up old logs automatically

### LoggerMiddleware
- **Purpose**: Intercepts HTTP requests and responses for logging
- **Features**:
  - Logs incoming requests with metadata (IP, User-Agent, Request ID)
  - Logs response status codes and duration
  - Sanitizes sensitive data (passwords, tokens, etc.)
  - Saves logs to database asynchronously
  - Provides emoji indicators for different status codes

## Database Schema

The `Log` table stores:
- `level`: Log level (INFO, WARN, ERROR)
- `message`: Log message
- `metadata`: Additional JSON data
- `ip`: Client IP address
- `userAgent`: Client user agent
- `requestId`: Unique request identifier
- `duration`: Request duration in milliseconds
- `statusCode`: HTTP status code
- `method`: HTTP method
- `url`: Request URL
- `requestBody`: Sanitized request body (for non-GET requests)
- `createdAt`: Timestamp

## API Endpoints

### GET /logs
Retrieve logs with optional filtering:
- `level`: Filter by log level (INFO, WARN, ERROR)
- `limit`: Number of logs to return (default: 100)
- `offset`: Number of logs to skip (default: 0)

### DELETE /logs/cleanup
Clean up old logs:
- `days`: Number of days old to delete (default: 30)

## Usage

The middleware is automatically applied to all routes via the AppModule configuration. No additional setup is required.

## Security Features

- Sensitive fields (password, token, secret, key, authorization) are automatically redacted
- Request bodies are only logged for non-GET requests
- Response bodies are only logged for error responses (4xx, 5xx)
- Long response bodies are truncated to prevent log bloat

## Log Levels

- **INFO**: Successful requests (2xx status codes)
- **WARN**: Client errors (4xx status codes)
- **ERROR**: Server errors (5xx status codes)

## Emoji Indicators

- ✅ Success (2xx)
- ⚠️ Warning (4xx)
- 💥 Error (5xx)
- 🔄 Redirect (3xx)
- 🚀 Incoming request
- 📦 Request/Response body
