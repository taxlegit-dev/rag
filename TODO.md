         # TODO: Assign Default Plan to Users

## Tasks

- [x] Modify src/lib/auth.ts to assign default plan to new users during signup (OTP and Google)
- [x] Update src/app/api/user/plan/route.ts to fallback to default plan if user's planId is null
- [x] Test the changes: Signup new user, check if plan assigned; Check existing user API returns default plan
- [x] Verify frontend: userPlan not null, canDownloadProcess defined

## Notes

- Ensure a default plan exists in the database (isDefault: true)
- If no default plan, handle gracefully in API (return null or error)
