const { createClient } = require('@supabase/supabase-js');

async function fixDbSnapshot() {
    const sb = createClient('https://iprqtkmtelgdhlenlsrc.supabase.co', 'sb_publishable_DX0GG-V6vp9ey7_FxbvLdw_ql-E8nEt');
    
    await sb.auth.signInWithPassword({
        email: 'admin@oxfordexcellence.com',
        password: 'Password123!'
    });

    const { data, error } = await sb.from('db_snapshot').select('data').eq('id', 1).single();
    if (error) {
        console.error('FETCH ERROR:', error.message);
        return;
    }

    const db = data.data;
    if (db.admissions) {
        db.admissions = [];
    }

    const { error: updateError } = await sb.from('db_snapshot').update({ data: db }).eq('id', 1);
    if (updateError) {
        console.error('UPDATE ERROR:', updateError.message);
    } else {
        console.log('Successfully cleared admissions from db_snapshot JSON blob!');
    }
}

fixDbSnapshot().catch(console.error);
