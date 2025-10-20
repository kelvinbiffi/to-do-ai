# n8n Integration Guide - Todo API Routes

This document explains how to use the Next.js API routes from n8n workflows.

## Authentication

All API endpoints require an Authorization header with the user's auth token:

```
Authorization: Bearer {userAuthToken}
```

**Example from webhook payload:**
```json
{
  "userAuthToken": "15722729-a871-4293-b434-cfe15ff9e976",
  "todoId": "b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe",
  "title": "Do the dishes",
  "description": "...",
  "timestamp": "2025-10-18T05:26:20.679Z"
}
```

---

## API Endpoints

### 1. GET /api/todos - List all todos

**Request:**
```
GET http://localhost:3000/api/todos
Authorization: Bearer {userAuthToken}
Content-Type: application/json
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/todos \
  -H "Authorization: Bearer 15722729-a871-4293-b434-cfe15ff9e976" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe",
      "user_id": "user123",
      "title": "Do the dishes",
      "description": "Clean kitchen",
      "status": "open",
      "created_at": "2025-10-18T05:26:20.679Z",
      "updated_at": "2025-10-18T05:26:20.679Z"
    }
  ]
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Unauthorized: Invalid or missing auth token"
}
```

---

### 2. POST /api/todos - Create a new todo

**Request:**
```
POST http://localhost:3000/api/todos
Authorization: Bearer {userAuthToken}
Content-Type: application/json

{
  "title": "New task title",
  "description": "Optional description"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Authorization: Bearer 15722729-a871-4293-b434-cfe15ff9e976" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }'
```

**cURL Example (with variables):**
```bash
# Set variables
BEARER_TOKEN="15722729-a871-4293-b434-cfe15ff9e976"
API_URL="http://localhost:3000"
TITLE="Buy groceries"
DESCRIPTION="Milk, eggs, bread"

# Make request
curl -X POST "$API_URL/api/todos" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"$TITLE\",
    \"description\": \"$DESCRIPTION\"
  }"
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "new-todo-id",
    "user_id": "user123",
    "title": "New task title",
    "description": "Optional description",
    "status": "open",
    "created_at": "2025-10-18T05:30:00.000Z",
    "updated_at": "2025-10-18T05:30:00.000Z"
  }
}
```

---

### 3. GET /api/todos/[id] - Get a specific todo

**Request:**
```
GET http://localhost:3000/api/todos/b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe
Authorization: Bearer {userAuthToken}
Content-Type: application/json
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/todos/b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe \
  -H "Authorization: Bearer 15722729-a871-4293-b434-cfe15ff9e976" \
  -H "Content-Type: application/json"
```

**cURL Example (with variables):**
```bash
BEARER_TOKEN="15722729-a871-4293-b434-cfe15ff9e976"
TODO_ID="b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe"

curl -X GET "http://localhost:3000/api/todos/$TODO_ID" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe",
    "user_id": "user123",
    "title": "Do the dishes",
    "description": "Clean kitchen",
    "status": "open",
    "created_at": "2025-10-18T05:26:20.679Z",
    "updated_at": "2025-10-18T05:26:20.679Z"
  }
}
```

**Error (404 Not Found):**
```json
{
  "error": "Todo not found"
}
```

---

### 4. PATCH /api/todos/[id] - Update a todo

**Request:**
```
PATCH http://localhost:3000/api/todos/b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe
Authorization: Bearer {userAuthToken}
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "status": "done"
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:3000/api/todos/b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe \
  -H "Authorization: Bearer 15722729-a871-4293-b434-cfe15ff9e976" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "description": "Updated description",
    "status": "done"
  }'
```

**cURL Example (update title only):**
```bash
curl -X PATCH http://localhost:3000/api/todos/b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe \
  -H "Authorization: Bearer 15722729-a871-4293-b434-cfe15ff9e976" \
  -H "Content-Type: application/json" \
  -d '{"title": "New title here"}'
```

**cURL Example (mark as done):**
```bash
curl -X PATCH http://localhost:3000/api/todos/b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe \
  -H "Authorization: Bearer 15722729-a871-4293-b434-cfe15ff9e976" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

**cURL Example (with variables):**
```bash
BEARER_TOKEN="15722729-a871-4293-b434-cfe15ff9e976"
TODO_ID="b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe"
TITLE="AI Enhanced Title"
DESCRIPTION="AI Enhanced Description"
STATUS="done"

curl -X PATCH "http://localhost:3000/api/todos/$TODO_ID" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"$TITLE\",
    \"description\": \"$DESCRIPTION\",
    \"status\": \"$STATUS\"
  }"
```

**Allowed fields:**
- `title` - Todo title
- `description` - Todo description
- `status` - Todo status (`open` or `done`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe",
    "user_id": "user123",
    "title": "Updated title",
    "description": "Updated description",
    "status": "done",
    "created_at": "2025-10-18T05:26:20.679Z",
    "updated_at": "2025-10-18T05:35:00.000Z"
  }
}
```

---

### 5. DELETE /api/todos/[id] - Delete a todo

**Request:**
```
DELETE http://localhost:3000/api/todos/b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe
Authorization: Bearer {userAuthToken}
Content-Type: application/json
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/todos/b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe \
  -H "Authorization: Bearer 15722729-a871-4293-b434-cfe15ff9e976" \
  -H "Content-Type: application/json"
```

**cURL Example (with variables):**
```bash
BEARER_TOKEN="15722729-a871-4293-b434-cfe15ff9e976"
TODO_ID="b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe"

curl -X DELETE "http://localhost:3000/api/todos/$TODO_ID" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Error (404 Not Found):**
```json
{
  "error": "Todo not found"
}
```

---

## n8n Workflow Example

### Processing Webhook to Update Todo

```
1. Webhook Trigger (receives todo creation event)
   ↓
2. Extract Variables:
   - userAuthToken
   - todoId
   - title
   - description
   
3. AI Processing / Enhancement (your n8n logic)
   ↓
4. Update Todo via API:
   PATCH /api/todos/{todoId}
   Headers:
     - Authorization: Bearer {userAuthToken}
   Body:
     {
       "title": "{processedTitle}",
       "description": "{aiEnhancedDescription}"
     }
   ↓
5. Verify Response (status 200)
```

### Using Environment Variables

In n8n, set these variables:
- `API_BASE_URL`: The base URL of your Next.js app (e.g., `http://localhost:3000` or your deployed URL)
- `USER_AUTH_TOKEN`: Will be received from webhook payload

### Example n8n HTTP Request Node:

**Method:** PATCH  
**URL:** `{{ $env.API_BASE_URL }}/api/todos/{{ $json.body.todoId }}`

**Headers:**
```
Authorization: Bearer {{ $json.body.userAuthToken }}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "{{ $json.body.title }}",
  "description": "{{ $json.body.description }}"
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success (GET, PATCH, DELETE) |
| 201 | Created (POST) |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found (todo doesn't exist) |
| 500 | Server Error |

In n8n, check the response status code to handle errors:
```
IF response.status == 200 THEN
  Process success
ELSE
  Handle error with response.error message
```

---

## Security Notes

1. **Token Validation**: Every request validates the Authorization token
2. **User Isolation**: Todos are filtered by user_id, preventing cross-user access
3. **Field Whitelist**: PATCH endpoint only allows specific fields to be updated
4. **No Direct Supabase Access**: All database operations go through API validation

---

## Quick Test with cURL

### Setup Variables (Copy to your terminal)

```bash
# Set these values from your app
BEARER_TOKEN="your-auth-token-here"
API_URL="http://localhost:3000"
```

### Test 1: Check Health
```bash
curl -X GET "$API_URL/api/health" \
  -H "Content-Type: application/json"
```

### Test 2: List All Todos
```bash
curl -X GET "$API_URL/api/todos" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json"
```

### Test 3: Create a Todo
```bash
curl -X POST "$API_URL/api/todos" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Todo",
    "description": "This is a test"
  }' | grep -o '"id":"[^"]*"'
```

**Example Output:** `"id":"b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe"`

### Test 4: Get Specific Todo
```bash
# First, get a TODO_ID from Test 3
TODO_ID="b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe"

curl -X GET "$API_URL/api/todos/$TODO_ID" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json"
```

### Test 5: Update Todo
```bash
TODO_ID="b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe"

curl -X PATCH "$API_URL/api/todos/$TODO_ID" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Todo",
    "description": "This has been updated"
  }'
```

### Test 6: Mark Todo as Done
```bash
TODO_ID="b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe"

curl -X PATCH "$API_URL/api/todos/$TODO_ID" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

### Test 7: Delete Todo
```bash
TODO_ID="b4c1272a-10fb-4ef3-a1fe-64aae3a38ebe"

curl -X DELETE "$API_URL/api/todos/$TODO_ID" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Full Test Script

Save this as `test-api.sh` and run with `bash test-api.sh`:

```bash
#!/bin/bash

# Configuration
BEARER_TOKEN="${1:-your-auth-token-here}"
API_URL="${2:-http://localhost:3000}"
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${COLOR_BLUE}=== Todo API Test Suite ===${NC}\n"

# Test 1: Health Check
echo -e "${COLOR_BLUE}Test 1: Health Check${NC}"
curl -X GET "$API_URL/api/health" \
  -H "Content-Type: application/json" 2>/dev/null | jq .
echo ""

# Test 2: List Todos (Before)
echo -e "${COLOR_BLUE}Test 2: List Todos (Before)${NC}"
curl -X GET "$API_URL/api/todos" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" 2>/dev/null | jq .
echo ""

# Test 3: Create Todo
echo -e "${COLOR_BLUE}Test 3: Create Todo${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/todos" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Todo - '"$(date +%s)"'",
    "description": "Created at '"$(date)"'"
  }')
echo "$CREATE_RESPONSE" | jq .
TODO_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id')
echo -e "${COLOR_GREEN}Todo ID: $TODO_ID${NC}\n"

# Test 4: Get Specific Todo
echo -e "${COLOR_BLUE}Test 4: Get Specific Todo${NC}"
curl -X GET "$API_URL/api/todos/$TODO_ID" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" 2>/dev/null | jq .
echo ""

# Test 5: Update Todo
echo -e "${COLOR_BLUE}Test 5: Update Todo${NC}"
curl -X PATCH "$API_URL/api/todos/$TODO_ID" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated - Test Todo",
    "description": "This was updated"
  }' 2>/dev/null | jq .
echo ""

# Test 6: Mark as Done
echo -e "${COLOR_BLUE}Test 6: Mark Todo as Done${NC}"
curl -X PATCH "$API_URL/api/todos/$TODO_ID" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}' 2>/dev/null | jq .
echo ""

# Test 7: List Todos (After)
echo -e "${COLOR_BLUE}Test 7: List Todos (After)${NC}"
curl -X GET "$API_URL/api/todos" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" 2>/dev/null | jq .
echo ""

# Test 8: Delete Todo
echo -e "${COLOR_BLUE}Test 8: Delete Todo${NC}"
curl -X DELETE "$API_URL/api/todos/$TODO_ID" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" 2>/dev/null | jq .
echo ""

echo -e "${COLOR_GREEN}=== Test Suite Complete ===${NC}"
```

### Run the Test Script

```bash
# Basic (will use default values or ask for token)
bash test-api.sh

# With specific values
bash test-api.sh "your-auth-token" "http://localhost:3000"

# With jq installed (pretty JSON output)
bash test-api.sh "your-auth-token" | jq
```

---

## Common cURL Options

```bash
# Pretty print JSON output
curl ... | jq

# Show request headers
curl -v ...

# Show request and response headers
curl -vv ...

# Save response to file
curl ... -o response.json

# Follow redirects
curl -L ...

# Set timeout (seconds)
curl --max-time 5 ...

# Show only HTTP status code
curl -w "%{http_code}" -o /dev/null -s ...

# Verbose with all details
curl -vvv ...
```

---

## Testing Tips

### 1. Validate Auth Token
Before running tests, verify you have a valid auth token:
```bash
BEARER_TOKEN="your-token"
curl -X GET "http://localhost:3000/api/todos" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"
```

### 2. Extract Specific Values from Response
```bash
# Get todo ID from create response
curl -s -X POST ... | jq '.data.id'

# Get all todo titles
curl -s -X GET ... | jq '.data[].title'

# Count todos
curl -s -X GET ... | jq '.data | length'
```

### 3. Batch Test Multiple Operations
```bash
#!/bin/bash
TOKEN="your-token"
URL="http://localhost:3000"

# Create multiple todos
for i in {1..5}; do
  curl -X POST "$URL/api/todos" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"Todo $i\", \"description\": \"Description $i\"}" \
    -s | jq '.data.id'
done
```

### 4. Test Error Handling
```bash
# Test with invalid token (should get 401)
curl -X GET "http://localhost:3000/api/todos" \
  -H "Authorization: Bearer invalid-token" \
  -w "\nHTTP Status: %{http_code}\n"

# Test with non-existent todo (should get 404)
curl -X GET "http://localhost:3000/api/todos/fake-id" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n"

# Test missing required field (should get 400)
curl -X POST "http://localhost:3000/api/todos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "No title"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

---

## Debugging API Issues

### 1. Check Request/Response Headers
```bash
curl -vv -X GET "http://localhost:3000/api/todos" \
  -H "Authorization: Bearer $BEARER_TOKEN"
```

### 2. Pretty Print Responses
```bash
# Install jq if you don't have it
# macOS: brew install jq
# Ubuntu: sudo apt-get install jq
# Windows: choco install jq

curl -X GET "http://localhost:3000/api/todos" \
  -H "Authorization: Bearer $BEARER_TOKEN" | jq .
```

### 3. Check API Status
```bash
curl -s "http://localhost:3000/api/health" | jq .
```

### 4. View Raw Response
```bash
curl -X GET "http://localhost:3000/api/todos" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -v 2>&1 | grep -E "^[<>]|^{|^\\["
```

