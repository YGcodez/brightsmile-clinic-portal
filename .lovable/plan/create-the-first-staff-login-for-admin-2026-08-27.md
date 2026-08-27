# Create the first staff login for /admin

No accounts exist in the backend yet, which is why nothing can sign in at `/admin`.

## What I'll do

1. Create the account `gbaafrancisdre@gmail.com` with the password you gave, email pre-confirmed so it can sign in immediately.
2. Give that account the `admin` role in the roles table (this also satisfies the staff check used by the appointments dashboard and the confirm action).
3. Verify the account and role exist, then you sign in at `/admin`.

## Notes

- The password is short and simple; fine for a fictional demo clinic, but worth changing before any real use.
- Anyone else who signs in without a role will see the "No staff access" screen — extra staff accounts can be added the same way later.
