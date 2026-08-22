# Dayflow — API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Interactive Docs
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Authentication
All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### POST /auth/login
**Request:**
```json
{ "email": "admin@dayflow.com", "password": "Demo@1234" }
```
**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user": { "id": "...", "email": "...", "role": "admin" }
}
```

### POST /auth/refresh
**Request:** `{ "refresh_token": "eyJ..." }`

### GET /auth/me
Returns current authenticated user.

### POST /auth/logout
Invalidates refresh token.

---

## Employee Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /employees | List employees (paginated, filterable) |
| POST | /employees | Create employee |
| GET | /employees/{id} | Get employee detail |
| PUT | /employees/{id} | Update employee |
| DELETE | /employees/{id} | Soft delete |
| GET | /employees/{id}/summary | Attendance + leave summary |

### Query Parameters (GET /employees)
- `page`, `size` (pagination)
- `department` (filter)
- `status` (active/on_leave/terminated)
- `search` (name/email/code)

---

## Attendance Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /attendance/checkin | Record check-in |
| POST | /attendance/checkout | Record check-out |
| GET | /attendance | All attendance (HR) |
| GET | /attendance/my | Current user's attendance |
| GET | /attendance/today | Today's attendance overview |
| GET | /attendance/summary | Monthly summary |

---

## Leave Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /leave/request | Submit leave request |
| GET | /leave/requests | List requests |
| PUT | /leave/requests/{id}/approve | Approve (HR) |
| PUT | /leave/requests/{id}/reject | Reject (HR) |
| DELETE | /leave/requests/{id} | Cancel request |
| GET | /leave/balance | Leave balances |
| GET | /leave/calendar | Monthly leave calendar |

---

## Intelligence Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /intelligence/health-score | Workforce health score |
| GET | /intelligence/risk-alerts | Risk alerts list |
| GET | /intelligence/anomalies | Attendance anomalies |
| GET | /intelligence/insights | AI insights |
| GET | /intelligence/predictions | Attrition predictions |

---

## Simulator Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /simulator/scenario | Create scenario |
| GET | /simulator/scenarios | List scenarios |
| POST | /simulator/run | Run simulation |
| GET | /simulator/bottlenecks | Current bottlenecks |
| POST | /simulator/apply | Apply recommendation |

---

## Agent Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /agents/query | Query HR Copilot |
| GET | /agents/traces | Agent execution traces |
| GET | /agents/traces/{id} | Specific trace |

---

## Payroll Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /payroll/my | My payroll history |
| GET | /payroll | All payroll (HR) |
| POST | /payroll/generate | Generate payroll |
| GET | /payroll/{id} | Payslip detail |

---

## Audit Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /audit/logs | Audit logs (HR/Admin) |
| GET | /audit/logs/export | Export CSV |
| GET | /audit/me | My activity |

---

## Error Format
```json
{
  "detail": "Human-readable error message",
  "status_code": 400
}
```

## Rate Limits
- Auth endpoints: 10 req/min
- Other endpoints: 100 req/min per user

