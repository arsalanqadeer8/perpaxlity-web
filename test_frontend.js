const { createClient } = require('@supabase/supabase-js');

async function testFrontendInsert() {
    const sb = createClient('https://iprqtkmtelgdhlenlsrc.supabase.co', 'sb_publishable_DX0GG-V6vp9ey7_FxbvLdw_ql-E8nEt');
    
    // Simulate what the frontend does
    const app = {
        studentName: 'Frontend Test Name',
        classId: 'c1',
        className: 'Class 1',
        dob: '2015-05-05',
        gender: 'Male',
        father: 'Frontend Father',
        mother: '',
        phone: '0987654321',
        whatsapp: '',
        email: 'test@example.com',
        address: '123 Test St',
        previousSchool: '',
        notes: '',
        status: 'new'
    };

    function localToSupabaseAdmission(app) {
      return {
        student_name: app.studentName, applying_class: app.classId, applying_class_name: app.className,
        dob: app.dob || null, gender: app.gender || '', father_name: app.father || '', mother_name: app.mother || '',
        phone: app.phone || '', whatsapp: app.whatsapp || '', email: app.email || '', address: app.address || '',
        previous_school: app.previousSchool || '', notes: app.notes || '', status: app.status || 'new'
      };
    }

    console.log('Inserting...');
    const { error } = await sb.from('admission_applications').insert(localToSupabaseAdmission(app));

    if (error) {
        console.error('FRONTEND INSERT FAILED:', error.message, error.details);
    } else {
        console.log('FRONTEND INSERT SUCCESS');
    }
}

testFrontendInsert().catch(console.error);
