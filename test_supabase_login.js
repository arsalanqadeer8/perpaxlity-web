const { createClient } = require('@supabase/supabase-js');

async function testLogin() {
    const sb = createClient('https://iprqtkmtelgdhlenlsrc.supabase.co', 'sb_publishable_DX0GG-V6vp9ey7_FxbvLdw_ql-E8nEt');
    
    console.log('Testing sign in with admin@oxfordexcellence.com ...');
    const { data, error } = await sb.auth.signInWithPassword({
        email: 'admin@oxfordexcellence.com',
        password: 'Password123!'
    });

    if (error) {
        console.error('LOGIN ERROR:', error.message);
        console.error('Status:', error.status);
    } else {
        console.log('LOGIN SUCCESS! User ID:', data.user.id);
    }
}

testLogin().catch(console.error);
