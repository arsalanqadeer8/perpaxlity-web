const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const htmlPath = 'H:/web/index.html';
    let content = fs.readFileSync(htmlPath, 'utf8');

    // 1. Replace the Supabase credentials
    const oldUrl = "const SUPABASE_URL  = 'https://owojgzrzstigmumsehdw.supabase.co';";
    const oldKeyLineStart = "const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
    
    // We'll replace using regex to be safe and accurate
    content = content.replace(/const SUPABASE_URL\s*=\s*'[^']+';/, "const SUPABASE_URL  = 'https://iprqtkmtelgdhlenlsrc.supabase.co';");
    content = content.replace(/const SUPABASE_KEY\s*=\s*'[^']+';/, "const SUPABASE_KEY  = 'sb_publishable_DX0GG-V6vp9ey7_FxbvLdw_ql-E8nEt';");

    fs.writeFileSync(htmlPath, content, 'utf8');
    console.log('index.html updated with new Supabase credentials.');

    // 2. Set up the admin user
    console.log('Registering admin@school.edu...');
    const sb = createClient('https://iprqtkmtelgdhlenlsrc.supabase.co', 'sb_publishable_DX0GG-V6vp9ey7_FxbvLdw_ql-E8nEt');
    
    const { data, error } = await sb.auth.signUp({
        email: 'admin@school.edu',
        password: 'Password123!'
    });

    if (error) {
        console.error('Error creating admin user:', error.message);
    } else {
        console.log('Successfully created/registered admin user!');
    }
}

main().catch(console.error);
