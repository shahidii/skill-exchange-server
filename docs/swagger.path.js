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
 *               EmailExists:
 *                 value: { success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } }
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
