# SkillSwap Platform API
**Version 1.0.0**

## Introduction
Welcome to the SkillSwap Platform API documentation. This API powers the backend for the SkillSwap application, enabling users to register, manage their profiles, and exchange skills. It is built using **Node.js**, **Express**, and **MongoDB**.

## Base URLs
- **Development**: `http://localhost:8080/api`
- **Production**: `https://api.skillswap.com/v1`

## Authentication
The API uses **JSON Web Tokens (JWT)** for authentication.
- **Header**: `Authorization`
- **Value**: `Bearer <your_access_token>`

> **Note**: Endpoints marked as **Private** require this header. Endpoints marked as **Guest Only** (e.g., Login, Signup) will return `401 Unauthorized` if a token is provided.

## Response Format
All API responses follow a consistent JSON structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "field": "optionalFieldName"
  }
}
```

---

## Schemas

### User (Basic)
Returned during authentication (Login/Signup).
```json
{
  "_id": "60d0fe4f5311236168a109ca",
  "fullName": "John Doe",
  "email": "john@example.com",
  "mobileNumber": "9876543210",
  "skillsOffered": [
    { "_id": "...", "name": "javascript" }
  ],
  "skillsNeeded": [
    { "_id": "...", "name": "python" }
  ]
}
```

### Profile (Detailed)
Returned when fetching the full user profile.
```json
{
  "_id": "60d0fe4f5311236168a109ca",
  "fullName": "John Doe",
  "bio": "Full stack developer",
  "avatar": "https://res.cloudinary.com/...",
  "email": "john@example.com",
  "mobileNumber": "9876543210",
  "location": "New York, USA",
  "rating": 4.5,
  "contact": {
    "businessEmail": "contact@johndoe.com",
    "linkedIn": "https://linkedin.com/in/johndoe",
    "instagram": "https://instagram.com/johndoe",
    "links": [
      { "name": "Portfolio", "url": "https://johndoe.com" }
    ]
  },
  "skillsOffered": [
    { "_id": "...", "name": "javascript" }
  ],
  "skillsNeeded": [
    { "_id": "...", "name": "python" }
  ],
  "requestsReceived": [],
  "requestsSent": [],
  "review": []
}
```

### Skill
```json
{
  "_id": "60d0fe4f5311236168a109ca",
  "name": "javascript"
}
```

---

## Auth Routes

### 1. Signup
Register a new user account. This endpoint handles user creation, password hashing, and skill association.

- **URL**: `/auth/signup`
- **Method**: `POST`
- **Auth Required**: No (Guest Only - returns 401 if `Authorization` header is present)
- **Content-Type**: `application/json`

#### Request Body Parameters

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `fullName` | String | Yes | Trimmed | Full name of the user. |
| `email` | String | Yes | Unique, Lowercase | User's email address. Used for login and notifications. |
| `password` | String | Yes | Min length: 6 | User's password. Will be hashed (bcrypt) before storage. |
| `mobileNumber` | String | Yes | Unique | User's mobile number. |
| `skillsOffered` | Array<String> | Yes | Unique items | List of skill names the user offers. |
| `skillsNeeded` | Array<String> | Yes | Unique items | List of skill names the user needs. |

> **Note**: `skillsOffered` and `skillsNeeded` cannot contain duplicate items within themselves, nor can they share any common elements (you cannot offer what you need).

#### Request Example
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "mobileNumber": "9876543210",
  "skillsOffered": ["JavaScript", "React"],
  "skillsNeeded": ["Python", "Machine Learning"]
}
```

#### Success Response (201 Created)
Returns the created user object (excluding sensitive data like password).

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "mobileNumber": "9876543210",
      "skillsOffered": [
        {
          "_id": "60d0fe4f5311236168a109cb",
          "name": "javascript"
        },
        {
          "_id": "60d0fe4f5311236168a109cc",
          "name": "react"
        }
      ],
      "skillsNeeded": [
        {
          "_id": "60d0fe4f5311236168a109cd",
          "name": "python"
        },
        {
          "_id": "60d0fe4f5311236168a109ce",
          "name": "machine learning"
        }
      ]
    }
  }
}
```

#### Error Responses

**400 Bad Request - Validation Errors**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `EMAIL_EXISTS` | "Email already registered" | The provided email is already in use. |
| `NUMBER_EXISTS` | "Mobile number already registered" | The provided mobile number is already in use. |
| `SKILLS_HAVE_DUPLICATE` | "skillsOffered array contains duplicate elements" | Duplicate values found in `skillsOffered`. |
| `SKILLS_NEED_DUPLICATE` | "skillsNeeded array contains duplicate elements" | Duplicate values found in `skillsNeeded`. |
| `SKILLS_HAVE_AND_NEED_COMMON` | "skillsOffered and skillsNeeded arrays contain common elements" | A skill cannot be both offered and needed. |

**Example Error Response (Email Exists)**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Email already registered",
    "field": "email"
  }
}
```

**401 Unauthorized**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `USER_LOGGED_IN` | "User is already logged in" | Endpoint is accessible only to guests. |

**Example Error Response (User Logged In)**
```json
{
  "success": false,
  "error": {
    "code": "USER_LOGGED_IN",
    "message": "User is already logged in"
  }
}
```

### 2. Login
Authenticate a user and receive a JWT token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No (Guest Only - returns 401 if `Authorization` header is present)
- **Content-Type**: `application/json`

#### Request Body Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Yes | Registered email address. |
| `password` | String | Yes | User's password. |

#### Request Example
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

#### Success Response (200 OK)
Returns the user object and a JWT access token.

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "mobileNumber": "9876543210",
      "skillsOffered": [
        {
          "_id": "60d0fe4f5311236168a109cb",
          "name": "javascript"
        }
      ],
      "skillsNeeded": [
        {
          "_id": "60d0fe4f5311236168a109cd",
          "name": "python"
        }
      ]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**401 Unauthorized - Invalid Credentials**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `INVALID_CREDENTIALS` | "Invalid email or password" | The email does not exist or the password does not match. |

**Example Error Response**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**401 Unauthorized - Already Logged In**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `USER_LOGGED_IN` | "User is already logged in" | Endpoint is accessible only to guests. |

**Example Error Response**
```json
{
  "success": false,
  "error": {
    "code": "USER_LOGGED_IN",
    "message": "User is already logged in"
  }
}
```

### 3. Reset Password (Initiate)
Initiate the password reset process. This endpoint validates the user's email and ensures the new password is not the same as the current one. If valid, it sends a 6-digit OTP to the user's email.

- **URL**: `/auth/reset-password`
- **Method**: `POST`
- **Auth Required**: No (Guest Only)
- **Content-Type**: `application/json`

#### Request Body Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Yes | User's registered email address. |
| `newPassword` | String | Yes | The new password the user wishes to set. |

#### Request Example
```json
{
  "email": "john.doe@example.com",
  "newPassword": "newSecurePassword456"
}
```

#### Success Response (200 OK)
Returns the masked email and the TTL (Time To Live) for the OTP.

```json
{
  "success": true,
  "message": "6 digit OTP shared to j***@example.com",
  "data": {
    "email": "john.doe@example.com",
    "ttlSeconds": 180
  }
}
```

#### Error Responses

**400 Bad Request - Validation Errors**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | "Email and New Password are required" | Missing required fields. |
| `NEW_PASSWORD_SAME_AS_OLD` | "This password has already been used" | The new password cannot be the same as the current password. |

**Example Error Response (Same Password)**
```json
{
  "success": false,
  "error": {
    "code": "NEW_PASSWORD_SAME_AS_OLD",
    "message": "This password has already been used"
  }
}
```

**401 Unauthorized - Invalid Credentials**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `INVALID_CREDENTIALS` | "Invalid credentials" | The email provided does not exist in the system. |

**Example Error Response**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid credentials"
  }
}
```

**401 Unauthorized - Already Logged In**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `USER_LOGGED_IN` | "User is already logged in" | Endpoint is accessible only to guests. |

### 4. Resend OTP
Resend the OTP if the previous one expired or wasn't received. This generates a new 6-digit code and resets the TTL.

- **URL**: `/auth/resend-otp`
- **Method**: `POST`
- **Auth Required**: No (Guest Only)
- **Content-Type**: `application/json`

#### Request Body Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Yes | User's registered email address. |

#### Request Example
```json
{
  "email": "john.doe@example.com"
}
```

#### Success Response (200 OK)
Returns the masked email and the new TTL.

```json
{
  "success": true,
  "message": "New OTP sent to j***@example.com",
  "data": {
    "email": "john.doe@example.com",
    "ttlSeconds": 180
  }
}
```

#### Error Responses

**400 Bad Request - Validation Errors**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | "Email is required" | Missing required field. |

**Example Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required"
  }
}
```

**401 Unauthorized - Invalid Credentials**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `INVALID_CREDENTIALS` | "Invalid credentials" | The email provided does not exist in the system. |

**Example Error Response**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid credentials"
  }
}
```

**401 Unauthorized - Already Logged In**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `USER_LOGGED_IN` | "User is already logged in" | Endpoint is accessible only to guests. |

### 5. Verify OTP
Verify the OTP to finalize the password reset or email update process. This endpoint checks the OTP against the one stored in Redis. If valid, it executes the pending action (update password or email) and clears the OTP context.

- **URL**: `/auth/verify-otp`
- **Method**: `POST`
- **Auth Required**: No
- **Content-Type**: `application/json`

#### Request Body Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Yes | User's registered email address. |
| `otp` | String | Yes | The 6-digit OTP received via email. |

#### Request Example
```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

#### Success Response (200 OK)
Returns a success message indicating the action is complete.

```json
{
  "success": true,
  "message": "OTP verified successfully! Please log in"
}
```

#### Error Responses

**400 Bad Request - Validation Errors**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | "Email and OTP are required" | Missing required fields. |
| `OTP_INVALID` | "Please enter a valid 6-digit OTP" | The OTP is incorrect or has expired. |
| `RESET_CONTEXT_MISSING` | "Missing password reset context" | Found OTP but missing the new password data (internal/expiry issue). |
| `UPDATE_EMAIL_CONTEXT_MISSING` | "Missing email update context" | Found OTP but missing the new email data (internal/expiry issue). |
| `UNKNOWN_OTP_CONTEXT` | "Unknown OTP context" | The OTP context type is invalid. |

**Example Error Response (Invalid OTP)**
```json
{
  "success": false,
  "error": {
    "code": "OTP_INVALID",
    "message": "Please enter a valid 6-digit OTP"
  }
}
```

### 6. Get Profile
Retrieve the currently logged-in user's comprehensive profile. This includes personal details, contact info, skills, requests, and reviews.

- **URL**: `/auth/profile`
- **Method**: `GET`
- **Auth Required**: Yes (Bearer Token)

#### Success Response (200 OK)
Returns the full user profile object.

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "fullName": "John Doe",
      "bio": "Passionate Full Stack Developer",
      "avatar": "https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg",
      "email": "john.doe@example.com",
      "mobileNumber": "9876543210",
      "location": "New York, USA",
      "contact": {
        "businessEmail": "contact@johndoe.com",
        "linkedIn": "https://linkedin.com/in/johndoe",
        "instagram": "https://instagram.com/johndoe",
        "links": [
          {
            "name": "Portfolio",
            "url": "https://johndoe.com",
            "_id": "60d0fe4f5311236168a109cb"
          }
        ]
      },
      "skillsOffered": [
        {
          "_id": "60d0fe4f5311236168a109cc",
          "name": "javascript"
        }
      ],
      "skillsNeeded": [
        {
          "_id": "60d0fe4f5311236168a109cd",
          "name": "python"
        }
      ],
      "requestsReceived": [],
      "requestsSent": [],
      "review": [],
      "rating": 4.5,
      "createdAt": "2023-01-01T12:00:00.000Z"
    }
  }
}
```

#### Error Responses

**401 Unauthorized**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `NO_TOKEN` | "No token provided" | Missing Authorization header. |
| `INVALID_TOKEN` | "Session expired. Please log in again." | Invalid or expired JWT. |
| `INVALID_CREDENTIALS` | "User not found" | The user ID in the token does not exist in the database. |

**Example Error Response**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Session expired. Please log in again."
  }
}
```

### 7. Update Profile
Update basic profile information and skills. This endpoint allows partial updates, meaning you can send only the fields you wish to change.

- **URL**: `/auth/update-profile`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)
- **Content-Type**: `application/json`

#### Request Body Parameters (Partial Update)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `fullName` | String | No | Full name of the user. |
| `bio` | String | No | A short biography or introduction. |
| `location` | String | No | User's current city or region. |
| `skillsOffered` | Array<String> | No | List of skill names to replace the current offered skills. |
| `skillsNeeded` | Array<String> | No | List of skill names to replace the current needed skills. |

> **Note**: If `skillsOffered` or `skillsNeeded` are provided, they *replace* the existing lists entirely. They must also follow the unique and non-overlapping constraints.

#### Request Example
```json
{
  "bio": "Updated bio with new interests.",
  "location": "San Francisco, CA",
  "skillsOffered": ["JavaScript", "TypeScript", "Node.js"]
}
```

#### Success Response (200 OK)
Returns the updated user profile and a list of fields that were modified.

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "fullName": "John Doe",
      "bio": "Updated bio with new interests.",
      "location": "San Francisco, CA",
      "skillsOffered": [
        {
          "_id": "60d0fe4f5311236168a109cb",
          "name": "javascript"
        },
        {
          "_id": "60d0fe4f5311236168a109cc",
          "name": "typescript"
        },
        {
          "_id": "60d0fe4f5311236168a109cd",
          "name": "node.js"
        }
      ],
      "skillsNeeded": [ ... ]
    },
    "updatedFields": {
      "bio": true,
      "location": true,
      "skillsOffered": true
    }
  }
}
```

#### Error Responses

**400 Bad Request - Validation Errors**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | "{field} is required" | A provided field was empty or invalid. |
| `NO_UPDATE_FIELDS` | "No valid fields to update" | The request body contained no recognized fields. |
| `SKILLS_HAVE_DUPLICATE` | "skillsOffered array contains duplicate elements" | Duplicate values found in `skillsOffered`. |
| `SKILLS_NEED_DUPLICATE` | "skillsNeeded array contains duplicate elements" | Duplicate values found in `skillsNeeded`. |
| `SKILLS_HAVE_AND_NEED_COMMON` | "skillsOffered and skillsNeeded arrays contain common elements" | A skill cannot be both offered and needed. |

**Example Error Response (No Update Fields)**
```json
{
  "success": false,
  "error": {
    "code": "NO_UPDATE_FIELDS",
    "message": "No valid fields to update"
  }
}
```

**401 Unauthorized**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `NO_TOKEN` | "No token provided" | Missing Authorization header. |
| `INVALID_TOKEN` | "Session expired. Please log in again." | Invalid or expired JWT. |

### 8. Update Contact
Update contact details and social links. This endpoint allows partial updates. You can pass fields directly or nested under a `contact` object.

- **URL**: `/auth/update-contact`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)
- **Content-Type**: `application/json`

#### Request Body Parameters (Partial Update)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `mobileNumber` | String | No | Valid mobile number (e.g., 10 digits). |
| `businessEmail` | String | No | Publicly visible email address. |
| `linkedIn` | String | No | Valid LinkedIn profile URL. |
| `instagram` | String | No | Valid Instagram profile URL. |
| `links` | Array<Object> | No | Custom links array. |

**Links Object Structure:**
```json
{
  "name": "Portfolio",
  "url": "https://johndoe.com"
}
```

#### Request Example
```json
{
  "mobileNumber": "9876543210",
  "businessEmail": "contact@johndoe.com",
  "linkedIn": "https://linkedin.com/in/johndoe",
  "links": [
    { "name": "Portfolio", "url": "https://johndoe.com" }
  ]
}
```

#### Success Response (200 OK)
Returns the updated user profile and a list of fields that were modified.

```json
{
  "success": true,
  "message": "Contact updated successfully",
  "data": {
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "fullName": "John Doe",
      "mobileNumber": "9876543210",
      "contact": {
        "businessEmail": "contact@johndoe.com",
        "linkedIn": "https://linkedin.com/in/johndoe",
        "links": [
          {
            "name": "Portfolio",
            "url": "https://johndoe.com",
            "_id": "60d0fe4f5311236168a109cb"
          }
        ]
      }
    },
    "updatedFields": {
      "mobileNumber": "9876543210",
      "businessEmail": "contact@johndoe.com",
      "linkedIn": "https://linkedin.com/in/johndoe",
      "links": [ ... ]
    }
  }
}
```

#### Error Responses

**400 Bad Request - Validation Errors**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | "{field} is required" | A provided field was empty or invalid. |
| `INVALID_MOBILE` | "Invalid mobile number format" | Phone number format check failed. |
| `NO_UPDATE_FIELDS` | "No valid contact fields to update" | The request body contained no recognized fields. |

**Example Error Response (Invalid Mobile)**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_MOBILE",
    "message": "Invalid mobile number format",
    "field": "mobileNumber"
  }
}
```

**401 Unauthorized**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `NO_TOKEN` | "No token provided" | Missing Authorization header. |
| `INVALID_TOKEN` | "Session expired. Please log in again." | Invalid or expired JWT. |

### 9. Update Email
Initiate an email update process. This generates an OTP sent to the *current* email address to verify the request.

- **URL**: `/auth/update-email`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)
- **Content-Type**: `application/json`

#### Request Body Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `currentEmail` | String | Yes | The user's current registered email. |
| `newEmail` | String | Yes | The new email address to switch to. |

#### Request Example
```json
{
  "currentEmail": "old.email@example.com",
  "newEmail": "new.email@example.com"
}
```

#### Success Response (200 OK)
Returns the masked *current* email and the OTP TTL.

```json
{
  "success": true,
  "message": "6 digit OTP shared to o***@example.com",
  "data": {
    "email": "old.email@example.com",
    "ttlSeconds": 180
  }
}
```

#### Error Responses

**400 Bad Request - Validation Errors**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | "Email is required" | Missing current or new email. |
| `EMAIL_EXISTS` | "This Email is already in use" | The `newEmail` is already registered to another user. |

**Example Error Response (Email Exists)**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "This Email is already in use"
  }
}
```

**401 Unauthorized - Invalid Credentials**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `INVALID_CREDENTIALS` | "User not found" | The `currentEmail` does not match any user record (or token user mismatch). |
| `NO_TOKEN` | "No token provided" | Missing Authorization header. |
| `INVALID_TOKEN` | "Session expired. Please log in again." | Invalid or expired JWT. |

**Example Error Response**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "User not found"
  }
}
```

### 9. Update Avatar
Upload and update the user's profile picture. This endpoint uses `multipart/form-data`.

- **URL**: `/auth/update-avatar`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)
- **Content-Type**: `multipart/form-data`

#### Request Body Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `avatar` | File | Yes | Image file (JPG, PNG, GIF, WebP). Max size: 5MB. |

#### Request Example (FormData)
```
Key: avatar
Value: [Binary File Data]
```

#### Success Response (200 OK)
Returns the updated user profile with the new avatar URL.

```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "data": {
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "fullName": "John Doe",
      "avatar": "https://res.cloudinary.com/demo/image/upload/v1/new-avatar.jpg",
      "email": "john.doe@example.com",
      "mobileNumber": "9876543210",
      "contact": { ... },
      "skillsOffered": [ ... ],
      "skillsNeeded": [ ... ]
    },
    "updatedFields": {
      "avatar": "https://res.cloudinary.com/demo/image/upload/v1/new-avatar.jpg"
    }
  }
}
```

#### Error Responses

**400 Bad Request - Upload Errors**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `NO_FILE_UPLOADED` | "Please upload an image file" | No file was found in the `avatar` field. |
| `INVALID_FILE_TYPE` | "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed." | File format is not supported. |
| `LIMIT_FILE_SIZE` | "File too large" | File exceeds the 5MB limit. |

**Example Error Response (No File)**
```json
{
  "success": false,
  "error": {
    "code": "NO_FILE_UPLOADED",
    "message": "Please upload an image file"
  }
}
```

**401 Unauthorized**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `NO_TOKEN` | "No token provided" | Missing Authorization header. |
| `INVALID_TOKEN` | "Session expired. Please log in again." | Invalid or expired JWT. |

---

## Error Responses
The API uses a standardized error response format for all 4xx and 5xx errors.

### Standard Error Structure
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human readable error message",
    "field": "fieldName" // Optional: Present for validation errors
  }
}
```

### Common Global Error Codes

| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| **400** | `VALIDATION_ERROR` | The request body or parameters failed validation. Check the `field` property for details. |
| **400** | `INVALID_FILE_TYPE` | Uploaded file format is not supported. |
| **400** | `LIMIT_FILE_SIZE` | Uploaded file exceeds the maximum allowed size. |
| **401** | `NO_TOKEN` | Authorization header is missing or invalid. |
| **401** | `INVALID_TOKEN` | JWT is invalid or expired. |
| **401** | `USER_LOGGED_IN` | Route is accessible only to guests (e.g., Login/Signup). |
| **401** | `INVALID_CREDENTIALS` | User not found or password incorrect. |
| **404** | `USER_NOT_FOUND` | The requested user resource does not exist. |
| **500** | `INTERNAL_SERVER_ERROR` | An unexpected server error occurred. |

### Example: Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "field": "email"
  }
}
```

### Example: Unauthorized Error
```json
{
  "success": false,
  "error": {
    "code": "NO_TOKEN",
    "message": "No token provided"
  }
}
```

---

## GET /profiles

Get recommended user profiles with intelligent sorting and pagination.

- **URL**: `/api/profiles`
- **Method**: `GET`
- **Auth Required**: No (Optional - results personalized if authenticated)

### Query Parameters

| Parameter | Type | Required | Default | Max | Description |
|-----------|------|----------|---------|-----|-------------|
| `page` | integer | No | 1 | - | Page number (minimum: 1) |
| `limit` | integer | No | 9 | 50 | Profiles per page |

### Sorting Logic

**For Authenticated Users:**
1. Skill Match Count (user's skillsNeeded vs profile's skillsOffered)
2. Review Count (descending)
3. Rating (descending)
4. Accepted Requests Count (descending)

**For Guest Users:**
1. Review Count (descending)
2. Rating (descending)
3. Accepted Requests Count (descending)

### Caching

- **Guest Users**: Results cached for 5 minutes (Redis/in-memory)
- **Authenticated Users**: Not cached (personalized results)

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Profiles retrieved successfully",
  "data": {
    "profiles": [
      {
        "_id": "60d0fe4f5311236168a109ca",
        "fullName": "John Doe",
        "bio": "Full stack developer with 5 years experience",
        "avatar": "https://res.cloudinary.com/...",
        "mobileNumber": "9876543210",
        "location": "New York, USA",
        "rating": 4.5,
        "contact": {
          "businessEmail": "contact@johndoe.com",
          "linkedIn": "https://linkedin.com/in/johndoe",
          "instagram": "https://instagram.com/johndoe",
          "links": [
            {
              "name": "Portfolio",
              "url": "https://johndoe.com"
            }
          ]
        },
        "skillsOffered": [
          {
            "_id": "60d0fe4f5311236168a109cb",
            "name": "javascript"
          },
          {
            "_id": "60d0fe4f5311236168a109cc",
            "name": "react"
          }
        ],
        "skillsNeeded": [
          {
            "_id": "60d0fe4f5311236168a109cd",
            "name": "python"
          }
        ],
        "review": [
          {
            "_id": "60d0fe4f5311236168a109ce",
            "user": "60d0fe4f5311236168a109cf",
            "rating": 5,
            "comment": "Great teacher!",
            "createdAt": "2024-01-15T10:30:00.000Z"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "reviewCount": 15,
        "acceptedRequestsCount": 8
      }
      // ... 8 more profiles
    ],
    "pagination": {
      "page": 1,
      "limit": 9,
      "total": 51,
      "totalPages": 6
    }
  }
}
```

### Example Requests

**Default (Page 1, Limit 9):**
```bash
GET /api/profiles
```

**Custom Pagination:**
```bash
GET /api/profiles?page=2&limit=9
GET /api/profiles?page=1&limit=20
```

**With Authentication (Skill-based sorting):**
```bash
GET /api/profiles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `profiles` | array | Array of profile objects |
| `profiles[].reviewCount` | integer | Calculated count of reviews |
| `profiles[].acceptedRequestsCount` | integer | Calculated count of accepted requests |
| `pagination.page` | integer | Current page number |
| `pagination.limit` | integer | Profiles per page |
| `pagination.total` | integer | Total number of profiles available |
| `pagination.totalPages` | integer | Total number of pages |

### Notes

- Profiles are sorted differently for authenticated vs guest users
- Authenticated users see profiles with matching skills first
- Current user is excluded from results (if authenticated)
- Results are cached for guest users to improve performance
- Maximum limit is 50 profiles per page
- Minimum page is 1

---

## GET /profiles/skills

Get all available skills with pagination support. Ideal for infinite scroll dropdowns and skill selection interfaces.

- **URL**: `/api/profiles/skills`
- **Method**: `GET`
- **Auth Required**: No (Optional - results personalized if authenticated)

### Query Parameters

| Parameter | Type | Required | Default | Max | Description |
|-----------|------|----------|---------|-----|-------------|
| `page` | integer | No | 1 | - | Page number (minimum: 1) |
| `limit` | integer | No | 10 | 50 | Skills per page |

### Sorting

**For Authenticated Users:**
Skills are intelligently sorted based on the user's profile:
1. **Skills user needs** (from `skillsNeeded`) - Highest priority
2. **Skills user doesn't have** - Medium priority
3. **Skills user already has** (from `skillsOffered`) - Lowest priority

**For Guest Users:**
- Skills appear in **natural database order** (insertion order)
- No sorting applied

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Skills retrieved successfully",
  "data": {
    "skills": [
      {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "javascript"
      },
      {
        "_id": "60d0fe4f5311236168a109cb",
        "name": "python"
      },
      {
        "_id": "60d0fe4f5311236168a109cc",
        "name": "react"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15,
      "hasMore": true
    }
  }
}
```

### Example Requests

**Default (Page 1, Limit 10):**
```bash
GET /api/profiles/skills
```

**Custom Pagination:**
```bash
GET /api/profiles/skills?page=2&limit=20
GET /api/profiles/skills?page=1&limit=50
```

**For Infinite Scroll:**
```bash
# Load first batch
GET /api/profiles/skills?page=1&limit=10

# Load next batch when user scrolls
GET /api/profiles/skills?page=2&limit=10
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `skills` | array | Array of skill objects |
| `skills[]._id` | string | Unique skill identifier |
| `skills[].name` | string | Skill name (lowercase) |
| `pagination.page` | integer | Current page number |
| `pagination.limit` | integer | Skills per page |
| `pagination.total` | integer | Total number of skills available |
| `pagination.totalPages` | integer | Total number of pages |
| `pagination.hasMore` | boolean | True if more pages exist (useful for infinite scroll) |

### Notes

- All skill names are stored in **lowercase**
- Skills are unique (no duplicates)
- The `hasMore` field is particularly useful for implementing infinite scroll
- Maximum limit is 50 skills per page
- Minimum page is 1
- **Personalization**: When a user is authenticated, skills they need are shown first, making it easier to find relevant skills
- **Smart Sorting**: Skills the user already has are shown last, reducing clutter
- **Guest Experience**: Non-authenticated users see all skills in alphabetical order

### Use Cases

1. **Dropdown/Combobox**: Load skills in batches as user scrolls
2. **Autocomplete**: Fetch all skills and filter client-side
3. **Skill Selection**: Display paginated list of available skills
4. **Analytics**: Get total count of skills in the platform

---

## GET /profiles/search

Search for user profiles based on text query and/or skill filtering with pagination.

- **URL**: `/api/profiles/search`
- **Method**: `GET`
- **Auth Required**: No (Optional - authenticated users excluded from their own results)

### Query Parameters

| Parameter | Type | Required | Default | Max | Description |
|-----------|------|----------|---------|-----|-------------|
| `q` | string | No | - | - | Text search query (searches in fullName, bio, location, and skills) |
| `skills` | array<string> | No | - | - | Array of skill IDs to filter by |
| `page` | integer | No | 1 | - | Page number (minimum: 1) |
| `limit` | integer | No | 9 | 50 | Profiles per page |

### Search Criteria

1. **Text Search**: Searches across `fullName`, `bio`, `location`, and `skills` (by name) fields
2. **Skill Filtering**: Matches profiles that have any of the specified skills in either `skillsOffered` or `skillsNeeded`

### Sorting Priority

1. **Skill Priority**:
   - Skills offered by the profile (priority 1)
   - Skills needed by the profile (priority 2)
   - No skill match (priority 3)
2. **Rating** (high to low)
3. **Accepted Requests Count** (high to low)
4. **Review Count** (high to low)
5. **Creation Date** (most recent first)

### Caching

- **All Requests**: No caching (real-time search results)

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Profiles retrieved successfully",
  "data": {
    "profiles": [
      {
        "_id": "60d0fe4f5311236168a109ca",
        "fullName": "John Doe",
        "bio": "Full stack developer with 5 years experience",
        "avatar": "https://res.cloudinary.com/...",
        "mobileNumber": "9876543210",
        "location": "New York, USA",
        "rating": 4.5,
        "contact": {
          "businessEmail": "contact@johndoe.com",
          "linkedIn": "https://linkedin.com/in/johndoe",
          "instagram": "https://instagram.com/johndoe",
          "links": [
            {
              "name": "Portfolio",
              "url": "https://johndoe.com"
            }
          ]
        },
        "skillsOffered": [
          {
            "_id": "60d0fe4f5311236168a109cb",
            "name": "javascript"
          },
          {
            "_id": "60d0fe4f5311236168a109cc",
            "name": "react"
          }
        ],
        "skillsNeeded": [
          {
            "_id": "60d0fe4f5311236168a109cd",
            "name": "python"
          }
        ],
        "review": [
          {
            "_id": "60d0fe4f5311236168a109ce",
            "user": "60d0fe4f5311236168a109cf",
            "rating": 5,
            "comment": "Great teacher!",
            "createdAt": "2024-01-15T10:30:00.000Z"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "reviewCount": 15,
        "acceptedRequestsCount": 8
      }
      // ... 8 more profiles
    ],
    "pagination": {
      "page": 1,
      "limit": 9,
      "total": 51,
      "totalPages": 6
    }
  }
}
```

### Example Requests

**Text Search:**
```bash
GET /api/profiles/search?q=developer
```

**Skill Filtering:**
```bash
GET /api/profiles/search?skills[]=60d0fe4f5311236168a109cb&skills[]=60d0fe4f5311236168a109cc
```

**Combined Search with Pagination:**
```bash
GET /api/profiles/search?q=javascript&skills[]=60d0fe4f5311236168a109cb&page=1&limit=9
```

**With Authentication (Excludes Current User):**
```bash
GET /api/profiles/search?q=developer
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `profiles` | array | Array of profile objects |
| `profiles[].reviewCount` | integer | Calculated count of reviews |
| `profiles[].acceptedRequestsCount` | integer | Calculated count of accepted requests |
| `pagination.page` | integer | Current page number |
| `pagination.limit` | integer | Profiles per page |
| `pagination.total` | integer | Total number of profiles matching the search criteria |
| `pagination.totalPages` | integer | Total number of pages |

### Notes

- Profiles are sorted by skill priority first (skills offered before skills needed)
- Authenticated users are automatically excluded from their own search results
- No caching is applied to search results to ensure real-time data
- Maximum limit is 50 profiles per page
- Minimum page is 1
- Skill filtering requires valid skill IDs from the `/api/profiles/skills` endpoint

## GET /profiles/:id

Get a single user profile by ID.

- **URL**: `/api/profiles/:id`
- **Method**: `GET`
- **Auth Required**: No (Optional)

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "60d0fe4f5311236168a109ca",
    "fullName": "John Doe",
    "bio": "Full stack developer",
    "avatar": "https://res.cloudinary.com/...",
    "mobileNumber": "9876543210",
    "location": "New York, USA",
    "rating": 4.5,
    "contact": { ... },
    "skillsOffered": [ ... ],
    "skillsNeeded": [ ... ],
    "review": [ ... ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "reviewCount": 15,
    "acceptedRequestsCount": 8
  }
}
```

### Error Responses

**404 Not Found**

| Error Code | Message | Description |
| :--- | :--- | :--- |
| `USER_NOT_FOUND` | "Profile not found" | The requested profile ID does not exist. |

**Example Error Response**
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "Profile not found"
  }
}
```

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `EMAIL_EXISTS` | 400 | Email already registered |
| `NUMBER_EXISTS` | 400 | Mobile number already registered |
| `SKILLS_HAVE_DUPLICATE` | 400 | skillsOffered contains duplicates |
| `SKILLS_NEED_DUPLICATE` | 400 | skillsNeeded contains duplicates |
| `SKILLS_HAVE_AND_NEED_COMMON` | 400 | skillsOffered and skillsNeeded overlap |
| `INVALID_CREDENTIALS` | 401 | Invalid email/password or user not found |
| `NO_TOKEN` | 401 | Authorization header missing |
| `INVALID_TOKEN` | 401 | Token expired or invalid |
| `USER_LOGGED_IN` | 401 | User already authenticated (guest-only routes) |
| `NEW_PASSWORD_SAME_AS_OLD` | 400 | New password matches current password |
| `OTP_INVALID` | 400 | Invalid or expired OTP |
| `VALIDATION_ERROR` | 400 | Required field missing or invalid |
| `NO_UPDATE_FIELDS` | 400 | No valid fields provided for update |
| `USER_NOT_FOUND` | 404 | User not found |
| `INVALID_MOBILE` | 400 | Invalid mobile number format |
| `INVALID_URL` | 400 | Invalid URL format |
| `NO_FILE_UPLOADED` | 400 | File upload required but not provided |
| `INVALID_FILE_TYPE` | 400 | Unsupported file type |
### 12. Get Profile by ID
Retrieve a single user profile by their ID. This provides detailed information about a specific user, including their stats and reviews.

- **URL**: `/profiles/:id`
- **Method**: `GET`
- **Auth Required**: Public (Optional Auth)
- **Content-Type**: `application/json`

#### Query Parameters
| Field | Type | Description |
| :--- | :--- | :--- |
| `reviewSort` | String | Sort reviews by: `highest`, `lowest`, `newest`, `oldest`, or `my-review` (authenticated only). Default: `highest`. |

#### Success Response (200 OK)
Returns the detailed profile object with computed statistics.

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "60d0fe...",
    "fullName": "Jane Doe",
    "bio": "Expert Designer",
    "reviewCount": 15,
    "acceptedRequestsCount": 5,
    "rating": 4.8,
    "review": [
       {
         "user": { "fullName": "John", "avatar": "..." },
         "rating": 5,
         "comment": "Great work!",
         "createdAt": "2023-01-01T10:00:00Z"
       }
    ]
  }
}
```

#### Error Responses

**404 Not Found**
| Error Code | Message | Description |
| :--- | :--- | :--- |
| `USER_NOT_FOUND` | "Profile not found" | No user exists with the provided ID. |

---

### 13. Add Review
Add a review to a user's profile.

- **URL**: `/profiles/:id/reviews`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)
- **Content-Type**: `application/json`

#### Request Body Parameters
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `rating` | Number | Yes | Rating 1-5. |
| `comment` | String | Yes | Review text. |

#### Request Example
```json
{
  "rating": 5,
  "comment": "Excellent mentor!"
}
```

#### Success Response (201 Created)
Returns a success message.

```json
{
  "success": true,
  "message": "Review added successfully"
}
```

#### Error Responses
**400 Bad Request**
| Error Code | Message | Description |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | "Rating and comment are required" | Missing fields. |
| `SELF_REVIEW` | "You cannot review your own profile" | User tried to review themselves. |
| `REVIEW_EXISTS` | "Review already exists, please delete first" | User has already left a review for this profile. |

**404 Not Found**
| Error Code | Message | Description |
| :--- | :--- | :--- |
| `USER_NOT_FOUND` | "Profile not found" | Target user does not exist. |

---

### 14. Delete Review
Remove your review from a user's profile.

- **URL**: `/profiles/:id/reviews`
- **Method**: `DELETE`
- **Auth Required**: Yes (Bearer Token)

#### Success Response (200 OK)
Returns a success message.

```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

#### Error Responses
**404 Not Found**
| Error Code | Message | Description |
| :--- | :--- | :--- |
| `USER_NOT_FOUND` | "Profile not found" | Target user does not exist. |
| `REVIEW_NOT_FOUND` | "Review not found" | You have not reviewed this user. |
