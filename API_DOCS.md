# API Documentation

This document outlines the expected API endpoints and payloads for the Flight Booking and Custom Quote forms.

## Base URL
`https://api.thrive-services.com/v1` (Placeholder)

---

## 1. Search Flights

**Endpoint**: `POST /flights/search`

### Request Payload
```json
{
  "origin": "SFO",              // Airport code (string)
  "destination": "JFK",         // Airport code (string)
  "passengers": {
    "adults": 1,                // Integer, min 1
    "children": 0               // Integer, min 0
  },
  "departureDate": "2025-06-25" // ISO 8601 Date string (YYYY-MM-DD)
}
```

### Success Response (200 OK)
```json
{
  "searchId": "src_12345",
  "results": [
    {
      "flightId": "fl_987",
      "airline": "TechAir",
      "price": 450.00,
      "departureTime": "2025-06-25T10:00:00Z",
      "arrivalTime": "2025-06-25T16:00:00Z"
    }
  ]
}
```

---

## 2. Request Custom Quote

**Endpoint**: `POST /quotes/request`

### Request Payload

**Headers**:
- `Content-Type`: `application/json`

**Body**:
```json
{
  "clientType": "individual",   // Enum: "individual" | "corporate" | "group"
  "origin": "London",           // String
  "destination": "Paris",       // String
  "dates": "Aug-Sep",           // String (Flexible format)
  "budgetRange": "$1000-$2000", // String
  "description": "Looking for a luxury package...", // String, Optional
  
  // Conditionally required if clientType is "group"
  "groupSize": 15               // Integer, Optional
}
```

### Success Response (201 Created)
```json
{
  "quoteId": "qt_5678",
  "status": "received",
  "message": "We have received your request and will get back to you shortly."
}
```

---

## Error Handling

All endpoints follow standard HTTP error codes:
- **400 Bad Request**: Invalid input data.
- **401 Unauthorized**: API key missing or invalid.
- **500 Internal Server Error**: Service unavailable.

```json
{
  "error": "invalid_input",
  "message": "Departure date cannot be in the past."
}
```
