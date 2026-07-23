const fs = require('fs');
const path = 'H:/web/index.html';

try {
    let content = fs.readFileSync(path, 'utf8');

    const newCSS = `
    /* PREMIUM LANDING CSS - COMPLETE EDITION */
    .ox-landing { font-family: 'Inter', system-ui, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 0; overflow-x: hidden; }
    .ox-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 5%; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 1000; box-shadow: 0 1px 15px rgba(0,0,0,0.05); }
    .ox-brand { font-size: 1.5rem; font-weight: 800; color: #0a192f; letter-spacing: -0.5px; display: flex; align-items: center; gap: 10px; }
    .ox-brand-icon { width: 32px; height: 32px; background: #0a192f; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #d4af37; font-size: 1rem; }
    .ox-nav-links { display: flex; gap: 32px; }
    .ox-nav-links a { text-decoration: none; color: #475569; font-weight: 600; transition: color 0.3s; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .ox-nav-links a:hover { color: #d4af37; }
    .ox-btn { background: #0a192f; color: white; padding: 12px 28px; border-radius: 50px; font-weight: 600; text-decoration: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: none; font-size: 0.95rem; }
    .ox-btn:hover { background: #d4af37; color: #0a192f; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(212, 175, 55, 0.2); }
    
    /* Hero Section */
    .ox-hero { padding: 80px 5% 120px; display: flex; align-items: center; justify-content: space-between; gap: 40px; min-height: calc(100vh - 80px); background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); position: relative; overflow: hidden;}
    .ox-hero::before { content: ''; position: absolute; top: -20%; right: -10%; width: 60vw; height: 60vw; background: radial-gradient(circle, rgba(212,175,55,0.12) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; z-index: 0; }
    .ox-hero-content { flex: 1; max-width: 600px; z-index: 1; animation: slideUp 1s ease-out forwards; opacity: 0; transform: translateY(30px); }
    .ox-badge { display: inline-block; background: rgba(10, 25, 47, 0.05); color: #0a192f; padding: 8px 20px; border-radius: 30px; font-size: 0.85rem; font-weight: 700; margin-bottom: 24px; letter-spacing: 1px; text-transform: uppercase; border: 1px solid rgba(10,25,47,0.1);}
    .ox-hero h1 { font-size: 4.5rem; line-height: 1.1; color: #0a192f; margin-bottom: 24px; font-weight: 800; letter-spacing: -1.5px;}
    .ox-hero h1 span { color: #d4af37; }
    .ox-hero p { font-size: 1.25rem; color: #475569; margin-bottom: 40px; line-height: 1.6; max-width: 500px; }
    .ox-hero-img { flex: 1; z-index: 1; display: flex; justify-content: center; position: relative; animation: fadeIn 1.5s ease-out forwards; }
    .ox-hero-img img { max-width: 100%; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: float 6s ease-in-out infinite; object-fit: cover; aspect-ratio: 4/3; }
    
    /* Stats Bar */
    .ox-stats { background: #0a192f; color: white; padding: 60px 5%; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 30px; position: relative; z-index: 2; margin-top: -60px; border-radius: 24px; max-width: 1200px; margin-left: auto; margin-right: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
    .ox-stat-item { text-align: center; }
    .ox-stat-num { font-size: 3rem; font-weight: 800; color: #d4af37; margin-bottom: 5px; }
    .ox-stat-label { font-size: 1rem; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }

    /* Vision / About Split */
    .ox-vision { padding: 120px 5%; background: white; display: flex; align-items: center; gap: 60px; }
    .ox-vision-img { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .ox-vision-img img { width: 100%; height: 100%; object-fit: cover; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s; }
    .ox-vision-img img:hover { transform: scale(1.02); }
    .ox-vision-img img:nth-child(2) { transform: translateY(40px); }
    .ox-vision-img img:nth-child(2):hover { transform: translateY(40px) scale(1.02); }
    .ox-vision-text { flex: 1; }
    .ox-vision-text h2 { font-size: 3rem; color: #0a192f; margin-bottom: 20px; font-weight: 800; }
    .ox-vision-text p { font-size: 1.15rem; color: #475569; line-height: 1.7; margin-bottom: 30px; }
    .ox-vision-text ul { list-style: none; padding: 0; margin-bottom: 40px; }
    .ox-vision-text li { font-size: 1.1rem; color: #1e293b; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; font-weight: 600; }
    .ox-vision-text li::before { content: '✓'; color: #d4af37; font-weight: 800; font-size: 1.2rem; }

    /* Features / Curriculum */
    .ox-features { padding: 120px 5%; background: #f8fafc; }
    .ox-sec-head { text-align: center; margin-bottom: 60px; }
    .ox-sec-head h2 { font-size: 3rem; color: #0a192f; margin-bottom: 16px; font-weight: 800; letter-spacing: -0.5px; }
    .ox-sec-head p { color: #64748b; font-size: 1.15rem; max-width: 600px; margin: 0 auto; line-height: 1.6; }
    .ox-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; max-width: 1200px; margin: 0 auto; }
    .ox-card { padding: 50px 40px; border-radius: 24px; background: #ffffff; border: 1px solid #e2e8f0; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .ox-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px -15px rgba(10,25,47,0.15); border-color: #d4af37; }
    .ox-card-icon { width: 60px; height: 60px; border-radius: 16px; background: rgba(10,25,47,0.05); color: #0a192f; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 24px; transition: all 0.3s; }
    .ox-card:hover .ox-card-icon { background: #0a192f; color: #d4af37; transform: scale(1.1) rotate(-5deg); }
    .ox-card h3 { font-size: 1.5rem; color: #0a192f; margin-bottom: 15px; font-weight: 700; }
    .ox-card p { color: #475569; line-height: 1.65; font-size: 1.05rem; margin: 0; }

    /* Testimonials */
    .ox-testimonials { padding: 120px 5%; background: white; text-align: center; }
    .ox-testimonial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; max-width: 1000px; margin: 0 auto; margin-top: 60px; }
    .ox-testi-card { background: #f8fafc; padding: 40px; border-radius: 20px; position: relative; text-align: left; border-left: 4px solid #d4af37; }
    .ox-testi-card::before { content: '"'; font-size: 6rem; color: rgba(212,175,55,0.2); position: absolute; top: 10px; right: 20px; font-family: serif; line-height: 1; }
    .ox-testi-text { font-size: 1.1rem; color: #475569; line-height: 1.7; font-style: italic; margin-bottom: 20px; position: relative; z-index: 1; }
    .ox-testi-author { font-weight: 700; color: #0a192f; }
    .ox-testi-role { font-size: 0.9rem; color: #64748b; }

    /* CTA Section */
    .ox-cta { padding: 100px 5%; background: linear-gradient(135deg, #0a192f 0%, #112a4f 100%); color: white; text-align: center; }
    .ox-cta h2 { font-size: 3.5rem; font-weight: 800; margin-bottom: 20px; color: white; }
    .ox-cta p { font-size: 1.2rem; color: #cbd5e1; max-width: 600px; margin: 0 auto 40px auto; line-height: 1.6; }
    .ox-cta .ox-btn { background: #d4af37; color: #0a192f; font-size: 1.2rem; padding: 15px 40px; border-radius: 50px; }
    .ox-cta .ox-btn:hover { background: white; transform: translateY(-3px); box-shadow: 0 10px 25px rgba(255,255,255,0.2); }

    /* Footer */
    .ox-footer { background: #050d1a; color: #94a3b8; padding: 40px 5%; text-align: center; font-size: 0.9rem; }
    .ox-footer p { margin: 0; }
    
    @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
    @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    
    @media (max-width: 992px) {
        .ox-hero { flex-direction: column; text-align: center; padding: 60px 5% 120px; }
        .ox-hero-content { margin-bottom: 40px; max-width: 100%; }
        .ox-hero h1 { font-size: 3.5rem; }
        .ox-hero p { margin: 0 auto 30px auto; }
        .ox-nav-links { display: none; }
        .ox-stats { flex-direction: column; gap: 40px; margin-top: -80px; }
        .ox-vision { flex-direction: column; }
        .ox-vision-img { display: none; } /* Simplify on mobile */
    }
    @media (max-width: 480px) {
        .ox-hero h1 { font-size: 2.75rem; }
        .ox-cta h2 { font-size: 2.5rem; }
    }
    `;

    // Replace the old CSS entirely if it exists, otherwise just inject it before </style>
    if (content.includes('/* PREMIUM LANDING CSS */')) {
        const cssStart = content.indexOf('/* PREMIUM LANDING CSS */');
        const styleEnd = content.indexOf('</style>', cssStart);
        content = content.substring(0, cssStart) + newCSS + '\\n    ' + content.substring(styleEnd);
    } else if (content.includes('/* PREMIUM LANDING CSS - COMPLETE EDITION */')) {
        // Already updated
    } else {
        content = content.replace('</style>', newCSS + '\\n</style>');
    }

    const newHTML = `<!-- LANDING -->
<div id="landing-page" class="ox-landing">
    <!-- Navbar -->
    <nav class="ox-nav">
        <div class="ox-brand" id="land-name">
            <div class="ox-brand-icon">OE</div>
            Oxford Excellence Academy
        </div>
        <div class="ox-nav-links">
            <a href="#vision">Vision</a>
            <a href="#curriculum">Curriculum</a>
            <a href="#admissions">Admissions</a>
        </div>
        <button class="ox-btn" onclick="openLogin()">Access Portal</button>
    </nav>

    <!-- Hero -->
    <header class="ox-hero">
        <div class="ox-hero-content">
            <div class="ox-badge">Est. 1995 • World-Class Education</div>
            <h1>Empowering the <span style="color:#d4af37">Leaders</span> of Tomorrow</h1>
            <p id="land-copy">A premier institution dedicated to academic brilliance, character development, and holistic growth.</p>
            <button class="ox-btn" onclick="openLogin()" style="padding: 18px 40px; font-size: 1.15rem;">Student & Parent Login</button>
        </div>
        <div class="ox-hero-img">
            <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Oxford Excellence Students" />
        </div>
    </header>

    <!-- Stats Bar -->
    <div class="ox-stats">
        <div class="ox-stat-item">
            <div class="ox-stat-num">99%</div>
            <div class="ox-stat-label">Graduation Rate</div>
        </div>
        <div class="ox-stat-item">
            <div class="ox-stat-num">50+</div>
            <div class="ox-stat-label">Global Awards</div>
        </div>
        <div class="ox-stat-item">
            <div class="ox-stat-num">1:15</div>
            <div class="ox-stat-label">Teacher-Student Ratio</div>
        </div>
        <div class="ox-stat-item">
            <div class="ox-stat-num">10k+</div>
            <div class="ox-stat-label">Alumni Worldwide</div>
        </div>
    </div>

    <!-- Our Vision -->
    <section class="ox-vision" id="vision">
        <div class="ox-vision-img">
            <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Campus Library" />
            <img src="https://images.unsplash.com/photo-1427504494785-319ce8372ac0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Students studying" />
        </div>
        <div class="ox-vision-text">
            <h2>Shaping Minds, Building Futures</h2>
            <p>At Oxford Excellence Academy, we believe education goes beyond textbooks. We cultivate an environment where intellectual curiosity thrives and leaders are born.</p>
            <ul>
                <li>State-of-the-art campus facilities and laboratories</li>
                <li>Internationally recognized and accredited curriculum</li>
                <li>Focus on emotional intelligence and ethical leadership</li>
                <li>Comprehensive arts, sports, and tech programs</li>
            </ul>
            <button class="ox-btn" onclick="openLogin()">Discover More</button>
        </div>
    </section>

    <!-- Features Grid -->
    <section class="ox-features" id="curriculum">
        <div class="ox-sec-head">
            <h2>Our Educational Pillars</h2>
            <p>We provide a comprehensive framework designed to nurture academic brilliance, personal growth, and unparalleled success.</p>
        </div>
        <div class="ox-grid">
            <div class="ox-card">
                <div class="ox-card-icon">🔬</div>
                <h3>STEM Excellence</h3>
                <p>Advanced laboratories and project-based learning in Science, Technology, Engineering, and Mathematics to prepare students for the modern world.</p>
            </div>
            <div class="ox-card">
                <div class="ox-card-icon">🎨</div>
                <h3>Creative Arts</h3>
                <p>Nurturing creativity through comprehensive programs in visual arts, music, theater, and design thinking.</p>
            </div>
            <div class="ox-card">
                <div class="ox-card-icon">🌍</div>
                <h3>Global Leadership</h3>
                <p>Model UN, debate clubs, and community service initiatives designed to build global awareness and strong leadership qualities.</p>
            </div>
        </div>
    </section>

    <!-- Testimonials -->
    <section class="ox-testimonials">
        <div class="ox-sec-head">
            <h2>What Parents Say</h2>
            <p>Hear from the families who have experienced the Oxford Excellence difference.</p>
        </div>
        <div class="ox-testimonial-grid">
            <div class="ox-testi-card">
                <div class="ox-testi-text">"The transformation in our daughter's confidence and academic performance has been incredible. The teachers truly care about every individual student."</div>
                <div class="ox-testi-author">Sarah Jenkins</div>
                <div class="ox-testi-role">Parent of Grade 10 Student</div>
            </div>
            <div class="ox-testi-card">
                <div class="ox-testi-text">"Oxford Excellence Academy provides a perfect balance of rigorous academics and essential life skills. We couldn't have asked for a better environment."</div>
                <div class="ox-testi-author">Michael Chen</div>
                <div class="ox-testi-role">Parent of Grade 12 Student</div>
            </div>
        </div>
    </section>

    <!-- CTA & Footer -->
    <section class="ox-cta" id="admissions">
        <h2>Ready to Join Our Family?</h2>
        <p>Take the first step towards a brilliant future. Access the portal to manage your applications, view student progress, or connect with faculty.</p>
        <button class="ox-btn" onclick="openLogin()">Access School Portal</button>
    </section>

    <footer class="ox-footer">
        <p>&copy; 2026 Oxford Excellence Academy. All rights reserved. | Empowering the Leaders of Tomorrow.</p>
    </footer>
</div>
`;

    const startIndex = content.indexOf('<!-- LANDING -->');
    const endIndex = content.indexOf('<!-- LOGIN -->');

    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        const before = content.substring(0, startIndex);
        const after = content.substring(endIndex);
        content = before + newHTML + after;
        fs.writeFileSync(path, content, 'utf8');
        console.log('Complete Landing Page HTML & CSS injected successfully.');
    } else {
        console.log('Could not find HTML boundaries.', {startIndex, endIndex});
    }

} catch(err) {
    console.error('Error:', err);
}
