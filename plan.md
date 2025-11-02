# Implementation Plan: Password Reset Edge Cases

## Problem Statement
Handle two edge cases for password reset functionality:
1. User resets password and puts the same password
2. User uses an old/expired token - determine token validity duration

## Analysis
From reviewing the code:
- Better Auth v1.3.34 is being used for authentication
- Password reset functionality is delegated to Better Auth
- Verification tokens are stored in the `verification` table with `expiresAt` column
- Current tests don't cover the edge cases mentioned in the issue

## Implementation Strategy

### Edge Case 1: Same Password Prevention
Better Auth's reset password endpoint needs to be wrapped with custom logic that:
1. Verifies the new password is different from the current password
2. Uses bcrypt to compare the hashed passwords
3. Returns a meaningful error if passwords match

**Approach:**
- Create a custom middleware or handler wrapper in AuthService
- Use Better Auth's API to get the user's current password hash
- Compare with the new password before allowing the reset
- Return appropriate error response

### Edge Case 2: Token Expiration
Better Auth handles token expiration internally, but we need to:
1. Verify the default expiration time (typically 1 hour for Better Auth)
2. Ensure expired tokens return appropriate error messages
3. Add tests to verify this behavior

**Approach:**
- Review Better Auth configuration for token expiration settings
- Add explicit configuration if needed
- Create tests that simulate expired tokens

## Steps

1. **Research Better Auth password reset internals**
   - Check if Better Auth already prevents same password
   - Understand token expiration configuration
   - Review error codes returned by Better Auth

2. **Implement Same Password Prevention**
   - Extend AuthService to intercept reset password requests
   - Add password comparison logic
   - Return appropriate error response

3. **Configure Token Expiration**
   - Set explicit token expiration in Better Auth config
   - Document the expiration time

4. **Add Comprehensive Tests**
   - Test: User cannot reset to same password
   - Test: Expired token is rejected
   - Test: Token expiration duration is correct
   - Test: User can reuse old password after token expires (security consideration)

5. **Validate and Document**
   - Run all existing tests to ensure no regression
   - Run new tests to verify edge cases
   - Update any relevant documentation

## Expected Outcomes
- Users cannot reset their password to the same password
- Clear error message when same password is used
- Tokens expire after a defined period (default: 1 hour)
- Clear error message when expired token is used
- All tests pass including new edge case tests
