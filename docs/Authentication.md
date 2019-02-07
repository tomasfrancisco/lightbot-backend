# Authentication

The Lightbot backend supports 2 types of registration and login:

- Email and password based,
- Google Sign-in based.

### Email and password

Basic registration with an email and password and optionally a 'company'-token.

1. POST /v1/user/register

   - Fields:
     - email: string (required)
     - companyToken: string (optional)
   - Description: If no companyToken is provided, a new private company will be made.
     Also, a token will be send to the provided email.

2. POST /v1/user/reset

   - Fields:
     - token: string (required)
     - password: string (required)
   - Description: This route is used for password reset and to set the first password
     while registering.

3. POST /v1/user/login

   - Fields:
     - email: string (required)
     - password: string (required)
   - Description: Will set an known cookie when correct combination.

4. POST /v1/user/reset-password
   - Fields:
     - email: string (required)
   - Description: Sends a password reset token to the email

### Google sign-in

1. GET /v1/user/auth/google
   - Description: User should be redirected to this route when choosing Google sign-in  
     The user will be redirected back to the editor

### Logout

1. POST /v1/user/logout

   - Fields:
   - Description: User is logged out.
