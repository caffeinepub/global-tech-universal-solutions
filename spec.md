# Global Tech Universal Solutions

## Current State
The site has a job application form that always accepts submissions. There is no way to disable or close applications.

## Requested Changes (Diff)

### Add
- Backend: `acceptingApplications` stable boolean flag (default true)
- Backend: `setAcceptingApplications(Bool)` admin function to toggle
- Backend: `isAcceptingApplications()` public query
- Frontend: Check the flag on load; if false, show a "Not currently accepting applications" notice instead of the form

### Modify
- `submitApplication` should trap if `acceptingApplications` is false

### Remove
Nothing removed.

## Implementation Plan
1. Add stable var and two new functions to main.mo
2. Regenerate backend bindings
3. Update ApplicationForm.tsx to query the flag and conditionally render the form or a closed notice
