# Bulk Import Notes

Use `students_bulk_template.csv` for the portal bulk import. Open the portal as admin, go to Students -> Bulk Import, choose the CSV file, and import.

The `password` column is not stored in the portal. It is only for creating Supabase Auth users. Use `supabase_auth_users_template.csv` or a secure local admin script for Supabase Auth.

For images, put a public image URL or a base64 data URL in the `photo` column. Browser security does not allow the portal to read local image file paths from a CSV.

Do not commit real student data, passwords, or private image URLs to GitHub. Keep real CSV files private.