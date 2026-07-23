const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const htmlPath = 'H:/web/index.html';
    let content = fs.readFileSync(htmlPath, 'utf8');

    // Update the local database to use a valid email instead of admin@school.edu
    content = content.replace(/admin@school\.edu/g, 'admin@oxfordexcellence.com');

    fs.writeFileSync(htmlPath, content, 'utf8');
    console.log('index.html updated with valid admin email.');

    // Set up the admin user
    console.log('Registering admin@oxfordexcellence.com...');
    const sb = createClient('https://iprqtkmtelgdhlenlsrc.supabase.co', 'sb_publishable_DX0GG-V6vp9ey7_FxbvLdw_ql-E8nEt');
    
    const { data, error } = await sb.auth.signUp({
        email: 'admin@oxfordexcellence.com',
        password: 'Password123!'
    });

    if (error) {
        console.error('Error creating admin user:', error.message);
    } else {
        console.log('Successfully created/registered admin user!');
    }
}

main().catch(console.error);
