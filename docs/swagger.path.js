/**
 * @swagger
 * /:
 *   get:
 *     summary: API Resources
 *     description: Get available API resources and version information
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API Resources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'API Resources' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     version: { type: string, example: 'v1' }
 *                     resources:
 *                       type: object
 *                       properties:
 *                         auth: { type: string, example: '/api/auth' }
 *                         profiles: { type: string, example: '/api/profiles' }
 *                         ai: { type: string, example: '/api/ai' }
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password, mobileNumber, skillsOffered, skillsNeeded]
 *             properties:
 *               fullName: { type: string, example: 'John Doe', description: 'Trimmed' }
 *               email: { type: string, format: email, example: 'john.doe@example.com', description: 'Unique, Lowercase' }
 *               password: { type: string, minLength: 6, example: 'securePassword123' }
 *               mobileNumber: { type: string, example: '9876543210', description: 'Unique' }
 *               skillsOffered: { type: array, items: { type: string }, example: ['JavaScript', 'React'], description: 'Unique items' }
 *               skillsNeeded: { type: array, items: { type: string }, example: ['Python', 'Machine Learning'], description: 'Unique items' }
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               EmailExists:
 *                 value: { success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered', field: 'email' } }
 *               NumberExists:
 *                 value: { success: false, error: { code: 'NUMBER_EXISTS', message: 'Mobile number already registered', field: 'mobileNumber' } }
 *               SkillsDuplicate:
 *                 value: { success: false, error: { code: 'SKILLS_HAVE_DUPLICATE', message: 'skillsOffered array contains duplicate elements' } }
 *               SkillsNeedDuplicate:
 *                 value: { success: false, error: { code: 'SKILLS_NEED_DUPLICATE', message: 'skillsNeeded array contains duplicate elements' } }
 *               SkillsCommon:
 *                 value: { success: false, error: { code: 'SKILLS_HAVE_AND_NEED_COMMON', message: 'skillsOffered and skillsNeeded arrays contain common elements' } }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               UserLoggedIn:
 *                 value: { success: false, error: { code: 'USER_LOGGED_IN', message: 'User is already logged in' } }
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: 'john.doe@example.com' }
 *               password: { type: string, example: 'securePassword123' }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/User' }
 *                         token: { type: string, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
 *             example:
 *               success: true
 *               message: 'User logged in successfully'
 *               data:
 *                 user:
 *                   _id: '60d0fe4f5311236168a109ca'
 *                   fullName: 'John Doe'
 *                   email: 'john.doe@example.com'
 *                   mobileNumber: '9876543210'
 *                   skillsOffered: [{ _id: '60d0fe4f5311236168a109cb', name: 'javascript' }]
 *                   skillsNeeded: [{ _id: '60d0fe4f5311236168a109cd', name: 'python' }]
 *                 token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               InvalidCredentials:
 *                 value: { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } }
 *               UserLoggedIn:
 *                 value: { success: false, error: { code: 'USER_LOGGED_IN', message: 'User is already logged in' } }
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Initiate password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, newPassword]
 *             properties:
 *               email: { type: string, format: email, example: 'john.doe@example.com' }
 *               newPassword: { type: string, minLength: 6, example: 'newSecurePassword456' }
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         email: { type: string, example: 'john.doe@example.com' }
 *                         ttlSeconds: { type: integer, example: 180 }
 *       400:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               ValidationError:
 *                 value: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and New Password are required' } }
 *               SamePassword:
 *                 value: { success: false, error: { code: 'NEW_PASSWORD_SAME_AS_OLD', message: 'This password has already been used' } }
 *       401:
 *         description: Invalid Credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               InvalidCredentials:
 *                 value: { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } }
 *               UserLoggedIn:
 *                 value: { success: false, error: { code: 'USER_LOGGED_IN', message: 'User is already logged in' } }
 */

/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Resend OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: 'john.doe@example.com' }
 *     responses:
 *       200:
 *         description: New OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         email: { type: string, example: 'john.doe@example.com' }
 *                         ttlSeconds: { type: integer, example: 180 }
 *       400:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               ValidationError:
 *                 value: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email is required' } }
 *       401:
 *         description: Invalid Credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               InvalidCredentials:
 *                 value: { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } }
 *               UserLoggedIn:
 *                 value: { success: false, error: { code: 'USER_LOGGED_IN', message: 'User is already logged in' } }
 */

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email, example: 'john.doe@example.com' }
 *               otp: { type: string, example: '123456' }
 *     responses:
 *       200:
 *         description: OTP Verified
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     message: { type: string, example: 'OTP verified successfully! Please log in' }
 *             example:
 *               success: true
 *               message: 'OTP verified successfully! Please log in'
 *       400:
 *         description: Invalid OTP or Context Missing
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               ValidationError:
 *                 value: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and OTP are required' } }
 *               OtpInvalid:
 *                 value: { success: false, error: { code: 'OTP_INVALID', message: 'Please enter a valid 6-digit OTP' } }
 *               ContextMissing:
 *                 value: { success: false, error: { code: 'RESET_CONTEXT_MISSING', message: 'Missing password reset context' } }
 *               UpdateContextMissing:
 *                 value: { success: false, error: { code: 'UPDATE_EMAIL_CONTEXT_MISSING', message: 'Missing email update context' } }
 *               UnknownContext:
 *                 value: { success: false, error: { code: 'UNKNOWN_OTP_CONTEXT', message: 'Unknown OTP context' } }
 */

/**
 * @swagger
 * /auth/update-email:
 *   post:
 *     summary: Update email address
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentEmail, newEmail]
 *             properties:
 *               currentEmail: { type: string, format: email }
 *               newEmail: { type: string, format: email }
 *     responses:
 *       200:
 *         description: OTP sent to current email
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         email: { type: string }
 *                         ttlSeconds: { type: integer }
 *             example:
 *               success: true
 *               message: '6 digit OTP shared to o***@example.com'
 *               data:
 *                 email: 'old.email@example.com'
 *                 ttlSeconds: 180
 *       400:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               ValidationError:
 *                 value: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email is required' } }
 *               EmailExists:
 *                 value: { success: false, error: { code: 'EMAIL_EXISTS', message: 'This Email is already in use' } }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               NoToken:
 *                 value: { success: false, error: { code: 'NO_TOKEN', message: 'No token provided' } }
 *               InvalidToken:
 *                 value: { success: false, error: { code: 'INVALID_TOKEN', message: 'Session expired. Please log in again.' } }
 */

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/Profile' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               NoToken:
 *                 value: { success: false, error: { code: 'NO_TOKEN', message: 'No token provided' } }
 *               InvalidToken:
 *                 value: { success: false, error: { code: 'INVALID_TOKEN', message: 'Session expired. Please log in again.' } }
 *               InvalidCredentials:
 *                 value: { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'User not found' } }
 */

/**
 * @swagger
 * /auth/update-profile:
 *   post:
 *     summary: Update profile details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               bio: { type: string }
 *               location: { type: string }
 *               skillsOffered: { type: array, items: { type: string } }
 *               skillsNeeded: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/Profile' }
 *                         updatedFields: { type: object }
 *       400:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               ValidationError:
 *                 value: { success: false, error: { code: 'VALIDATION_ERROR', message: '{field} is required' } }
 *               NoUpdateFields:
 *                 value: { success: false, error: { code: 'NO_UPDATE_FIELDS', message: 'No valid fields to update' } }
 *               SkillsDuplicate:
 *                 value: { success: false, error: { code: 'SKILLS_HAVE_DUPLICATE', message: 'skillsOffered array contains duplicate elements' } }
 *               SkillsNeedDuplicate:
 *                 value: { success: false, error: { code: 'SKILLS_NEED_DUPLICATE', message: 'skillsNeeded array contains duplicate elements' } }
 *               SkillsCommon:
 *                 value: { success: false, error: { code: 'SKILLS_HAVE_AND_NEED_COMMON', message: 'skillsOffered and skillsNeeded arrays contain common elements' } }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               NoToken:
 *                 value: { success: false, error: { code: 'NO_TOKEN', message: 'No token provided' } }
 *               InvalidToken:
 *                 value: { success: false, error: { code: 'INVALID_TOKEN', message: 'Session expired. Please log in again.' } }
 */

/**
 * @swagger
 * /auth/update-contact:
 *   post:
 *     summary: Update contact details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobileNumber: { type: string }
 *               businessEmail: { type: string, format: email }
 *               linkedIn: { type: string, format: uri }
 *               instagram: { type: string, format: uri }
 *               links:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name: { type: string }
 *                     url: { type: string, format: uri }
 *     responses:
 *       200:
 *         description: Contact updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/Profile' }
 *                         updatedFields: { type: object }
 *       400:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               ValidationError:
 *                 value: { success: false, error: { code: 'VALIDATION_ERROR', message: '{field} is required' } }
 *               InvalidMobile:
 *                 value: { success: false, error: { code: 'INVALID_MOBILE', message: 'Invalid mobile number format' } }
 *               NoUpdateFields:
 *                 value: { success: false, error: { code: 'NO_UPDATE_FIELDS', message: 'No valid contact fields to update' } }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               NoToken:
 *                 value: { success: false, error: { code: 'NO_TOKEN', message: 'No token provided' } }
 *               InvalidToken:
 *                 value: { success: false, error: { code: 'INVALID_TOKEN', message: 'Session expired. Please log in again.' } }
 */

/**
 * @swagger
 * /auth/update-avatar:
 *   post:
 *     summary: Update avatar
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Avatar updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/Profile' }
 *                         updatedFields: { type: object }
 *       400:
 *         description: Upload Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               NoFile:
 *                 value: { success: false, error: { code: 'NO_FILE', message: 'Please upload a file' } }
 *               MulterError:
 *                 value: { success: false, error: { code: 'MULTER_ERROR', message: 'File upload error' } }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               NoToken:
 *                 value: { success: false, error: { code: 'NO_TOKEN', message: 'No token provided' } }
 *               InvalidToken:
 *                 value: { success: false, error: { code: 'INVALID_TOKEN', message: 'Session expired. Please log in again.' } }
 */

/**
 * @swagger
 * /auth/requests/seen:
 *   post:
 *     summary: Mark requests as seen
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type: { type: string, enum: [incoming, my] }
 *     responses:
 *       200:
 *         description: Requests marked as seen
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     message: { type: string, example: 'Requests marked as seen' }
 *             example:
 *               success: true
 *               message: 'Requests marked as seen'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @swagger
 * /auth/requests/{requestId}:
 *   post:
 *     summary: Update request status
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [accepted, declined] }
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: Request status updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     message: { type: string, example: 'Request accepted successfully' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *   delete:
 *     summary: Delete or Unsend request
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: action
 *         required: true
 *         schema: { type: string, enum: [unsend, delete] }
 *         description: Action to perform (unsend for pending, delete for history)
 *     responses:
 *       200:
 *         description: Request deleted/unsent
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     message: { type: string, example: 'Request unsent successfully' }
 *       400:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               ValidationError:
 *                 value: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Action query parameter is required' } }
 *               InvalidAction:
 *                 value: { success: false, error: { code: 'INVALID_ACTION', message: 'Invalid action' } }
 *               RequestNotFound:
 *                 value: { success: false, error: { code: 'REQUEST_NOT_FOUND', message: 'Request not found' } }
 *               Unauthorized:
 *                 value: { success: false, error: { code: 'UNAUTHORIZED', message: 'You are not authorized' } }
 *               CannotUnsend:
 *                 value: { success: false, error: { code: 'CANNOT_UNSEND', message: 'Cannot unsend processed request' } }
 *               CannotDelete:
 *                 value: { success: false, error: { code: 'CANNOT_DELETE', message: 'Cannot delete pending request' } }
 *       410:
 *         description: Gone (Previously 401 typo? 410 is clearer but stick to 400 for errors usually or 404. api_reference said 400.)
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @swagger
 * /profiles:
 *   get:
 *     summary: Get recommended profiles with pagination
 *     description: |
 *       Returns up to 9 user profiles with intelligent sorting based on authentication status.
 *       
 *       **For Authenticated Users:**
 *       - Profiles sorted by skill match (user's skillsNeeded vs profile's skillsOffered)
 *       - Then by review count, rating, and accepted requests
 *       
 *       **For Guest Users:**
 *       - Profiles sorted by popularity (review count, rating, accepted requests)
 *       - Results cached for 5 minutes
 *       
 *       **Pagination:**
 *       - Default: page=1, limit=9
 *       - Maximum limit: 50 profiles per page
 *     tags: [Profiles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (minimum 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 9
 *         description: Number of profiles per page (max 50)
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     responses:
 *       200:
 *         description: Profiles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Profiles retrieved successfully' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     profiles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id: { type: string }
 *                           fullName: { type: string }
 *                           bio: { type: string }
 *                           avatar: { type: string }
 *                           mobileNumber: { type: string }
 *                           location: { type: string }
 *                           rating: { type: number }
 *                           skillsOffered: { type: array }
 *                           skillsNeeded: { type: array }
 *                           reviewCount: { type: integer }
 *                           acceptedRequestsCount: { type: integer }
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page: { type: integer, example: 1 }
 *                         limit: { type: integer, example: 9 }
 *                         total: { type: integer, example: 51 }
 *                         totalPages: { type: integer, example: 6 }
 */

/**
 * @swagger
 * /profiles/skills:
 *   get:
 *     summary: Get all skills with pagination
 *     description: |
 *       Returns all available skills in the platform with pagination support.
 *       Ideal for infinite scroll dropdowns and skill selection interfaces.
 *       
 *       **Intelligent Sorting (Authenticated Users):**
 *       When a user is logged in, skills are intelligently sorted to show the most relevant first:
 *       1. Skills the user needs (from their `skillsNeeded` list) - Highest priority
 *       2. Skills the user doesn't have yet - Medium priority 
 *       3. Skills the user already has (from their `skillsOffered` list) - Lowest priority
 *       
 *       **Natural Order (Guest Users):**
 *       - Skills appear in natural database order (insertion order)
 *       - No sorting applied
 *       
 *       **Features:**
 *       - Pagination with customizable limit
 *       - Returns `hasMore` flag for infinite scroll implementation
 *       - All skill names are lowercase
 *       
 *       **Pagination:**
 *       - Default: page=1, limit=10
 *       - Maximum limit: 50 skills per page
 *       
 *       **Use Cases:**
 *       - Dropdown/Combobox with infinite scroll
 *       - Autocomplete skill selection
 *       - Skill analytics and reporting
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (minimum 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of skills per page (max 50)
 *     responses:
 *       200:
 *         description: Skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Skills retrieved successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: '60d0fe4f5311236168a109ca'
 *                           name:
 *                             type: string
 *                             example: 'javascript'
 *                             description: 'Skill name (lowercase)'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                           description: 'Current page number'
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                           description: 'Skills per page'
 *                         total:
 *                           type: integer
 *                           example: 150
 *                           description: 'Total number of skills available'
 *                         totalPages:
 *                           type: integer
 *                           example: 15
 *                           description: 'Total number of pages'
 *                         hasMore:
 *                           type: boolean
 *                           example: true
 *                           description: 'True if more pages exist (useful for infinite scroll)'
 *             example:
 *               success: true
 *               message: 'Skills retrieved successfully'
 *               data:
 *                 skills:
 *                   - _id: '60d0fe4f5311236168a109ca'
 *                     name: 'javascript'
 *                   - _id: '60d0fe4f5311236168a109cb'
 *                     name: 'python'
 *                   - _id: '60d0fe4f5311236168a109cc'
 *                     name: 'react'
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   total: 150
 *                   totalPages: 15
 *                   hasMore: true
 */

/**
 * @swagger
 * /profiles/search:
 *   get:
 *     summary: Search profiles with text and skill filtering
 *     description: |
 *       Search for user profiles based on text query and/or skill filtering with pagination.
 *       Results are sorted by skill priority (skills offered first, then skills needed), 
 *       then by rating, accepted requests count, review count, and creation date.
 *       
 *       **Search Criteria:**
 *       - Text search across: fullName, bio, location
 *       - Skill filtering: matches profiles with skills in skillsOffered or skillsNeeded
 *       
 *       **Sorting Priority:**
 *       1. Skill priority (skills offered = 1, skills needed = 2, no match = 3)
 *       2. Rating (high to low)
 *       3. Accepted requests count (high to low)
 *       4. Review count (high to low)
 *       5. Creation date (most recent first)
 *       
 *       **Pagination:**
 *       - Default: page=1, limit=9
 *       - Maximum limit: 50 profiles per page
 *       
 *       **Authentication:**
 *       - Optional: Authenticated users will be excluded from their own search results
 *     tags: [Profiles]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Text search query (searches in fullName, bio, location, and skills)
 *       - in: query
 *         name: skills
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Array of skill IDs to filter by
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (minimum 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 9
 *         description: Number of profiles per page (max 50)
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     responses:
 *       200:
 *         description: Profiles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Profiles retrieved successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     profiles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           bio:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                           mobileNumber:
 *                             type: string
 *                           location:
 *                             type: string
 *                           rating:
 *                             type: number
 *                           skillsOffered:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                           skillsNeeded:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                           reviewCount:
 *                             type: integer
 *                           acceptedRequestsCount:
 *                             type: integer
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 9
 *                         total:
 *                           type: integer
 *                           example: 51
 *                         totalPages:
 *                           type: integer
 *                           example: 6
 */

/**
 * @swagger
 * /profiles/{id}:
 *   get:
 *     summary: Get profile by ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: reviewSort
 *         schema:
 *           type: string
 *           enum: [highest, lowest, newest, oldest, my-review]
 *           default: highest
 *         description: Sort order for reviews
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     responses:
 *       200:
 *         description: Profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/Profile' }
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             example:
 *               value: { success: false, error: { code: 'USER_NOT_FOUND', message: 'Profile not found' } }
 */

/**
 * @swagger
 * /profiles/{id}/reviews:
 *   post:
 *     summary: Add a review
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Review added
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     message: { type: string, example: 'Review added successfully' }
 *       400:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               ValidationError:
 *                 value: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Rating and comment are required' } }
 *               SelfReview:
 *                 value: { success: false, error: { code: 'SELF_REVIEW', message: 'You cannot review your own profile' } }
 *               ReviewExists:
 *                 value: { success: false, error: { code: 'REVIEW_EXISTS', message: 'Review already exists, please delete first' } }
 *       404:
 *         description: Profile Not Found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             example:
 *               value: { success: false, error: { code: 'USER_NOT_FOUND', message: 'Profile not found' } }
 *
 *   delete:
 *     summary: Delete a review
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to remove review from
 *     responses:
 *       200:
 *         description: Review deleted
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     message: { type: string, example: 'Review deleted successfully' }
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               ProfileNotFound:
 *                 value: { success: false, error: { code: 'USER_NOT_FOUND', message: 'Profile not found' } }
 *               ReviewNotFound:
 *                 value: { success: false, error: { code: 'REVIEW_NOT_FOUND', message: 'Review not found' } }
 */

/**
 * @swagger
 * /profiles/{id}/request:
 *   post:
 *     summary: Request a skill
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: User ID to request skill from
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [skillId]
 *             properties:
 *               skillId: { type: string }
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: Skill request sent
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     message: { type: string, example: 'Skill request sent successfully' }
 *       400:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               ValidationError:
 *                 value: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Skill ID is required' } }
 *               SelfRequest:
 *                 value: { success: false, error: { code: 'SELF_REQUEST', message: 'You cannot request a skill from yourself' } }
 *               RequestExists:
 *                 value: { success: false, error: { code: 'REQUEST_EXISTS', message: 'Request already sent' } }
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               UserNotFound:
 *                 value: { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } }
 *               SkillNotFound:
 *                 value: { success: false, error: { code: 'SKILL_NOT_FOUND', message: 'Skill not found' } }
 */

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Chat with AI Learning Assistant
 *     description: |
 *       Interact with the SkillSwap AI Assistant to get learning guidance, search for users, and learn about the platform.
 *       The assistant uses sophisticated function calling (tools) to search your database in real-time.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message: { type: string, example: 'Who can teach me React?' }
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role: { type: string, enum: [user, assistant] }
 *                     content: { type: string }
 *     responses:
 *       200:
 *         description: AI Response retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     message: { type: string, example: 'I found several experts who can help you with React! For example, Muhammed Shahid is a lead developer...' }
 *       400:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             example:
 *               value: { success: false, message: 'Message is required' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
