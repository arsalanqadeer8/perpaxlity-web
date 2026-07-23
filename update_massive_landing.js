const fs = require('fs');
const path = 'H:/web/index.html';

try {
    let content = fs.readFileSync(path, 'utf8');

    const newCSS = `
    /* MASSIVE FEATURE-RICH LIGHT THEME LANDING CSS */
    .ox-landing { font-family: 'Inter', system-ui, sans-serif; background: #ffffff; color: #1e293b; margin: 0; padding: 0; overflow-x: hidden; position: relative; }
    
    /* Top Ticker */
    .ox-ticker { background: #0a192f; color: #d4af37; padding: 8px 5%; font-size: 0.85rem; font-weight: 600; text-align: center; text-transform: uppercase; letter-spacing: 1px; }

    /* Navigation */
    .ox-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 5%; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 20px rgba(0,0,0,0.05); transition: padding 0.3s; }
    .ox-brand { font-size: 1.5rem; font-weight: 800; color: #0a192f; letter-spacing: -0.5px; display: flex; align-items: center; gap: 12px; z-index: 10; }
    .ox-brand-icon { width: 36px; height: 36px; background: #0a192f; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #d4af37; font-size: 1.1rem; }
    .ox-nav-links { display: flex; gap: 30px; z-index: 10; }
    .ox-nav-links a { text-decoration: none; color: #475569; font-weight: 600; transition: color 0.3s; font-size: 0.95rem; }
    .ox-nav-links a:hover { color: #0a192f; }
    .ox-btn { background: #0a192f; color: #ffffff; padding: 12px 28px; border-radius: 50px; font-weight: 600; text-decoration: none; cursor: pointer; transition: all 0.3s ease; border: none; font-size: 0.95rem; z-index: 10; }
    .ox-btn:hover { background: #d4af37; color: #0a192f; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(212, 175, 55, 0.2); }
    .ox-btn-outline { background: transparent; border: 2px solid #0a192f; color: #0a192f; }
    .ox-btn-outline:hover { background: #0a192f; color: #ffffff; }
    
    /* Hero Section */
    .ox-hero { padding: 80px 5% 120px; display: flex; align-items: center; justify-content: space-between; gap: 60px; min-height: 90vh; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); position: relative; overflow: hidden; }
    .ox-hero::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 100px; background: linear-gradient(to top, #ffffff, transparent); }
    .ox-hero-content { flex: 1; max-width: 650px; position: relative; z-index: 2; }
    .ox-badge { display: inline-block; background: rgba(10, 25, 47, 0.05); color: #0a192f; padding: 8px 24px; border-radius: 30px; font-size: 0.85rem; font-weight: 700; margin-bottom: 24px; letter-spacing: 1px; text-transform: uppercase; border: 1px solid rgba(10,25,47,0.1); }
    .ox-hero h1 { font-size: 4.5rem; line-height: 1.1; color: #0a192f; margin-bottom: 24px; font-weight: 800; letter-spacing: -1.5px; }
    .ox-hero h1 span { color: #d4af37; }
    .ox-hero p { font-size: 1.25rem; color: #475569; margin-bottom: 40px; line-height: 1.7; max-width: 550px; }
    .ox-hero-actions { display: flex; gap: 20px; }
    .ox-hero-img { flex: 1; display: flex; justify-content: center; position: relative; z-index: 1; }
    .ox-hero-img img { max-width: 100%; border-radius: 30px; box-shadow: 0 30px 60px rgba(0,0,0,0.15); object-fit: cover; aspect-ratio: 4/3; }

    /* Stats Bar */
    .ox-stats { background: #0a192f; color: #ffffff; padding: 60px 5%; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 40px; position: relative; z-index: 10; margin-top: -60px; border-radius: 24px; max-width: 1200px; margin-left: auto; margin-right: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
    .ox-stat-item { text-align: center; flex: 1; min-width: 150px; }
    .ox-stat-num { font-size: 3.5rem; font-weight: 800; color: #d4af37; margin-bottom: 5px; display: flex; align-items: center; justify-content: center; }
    .ox-stat-label { font-size: 0.95rem; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }

    /* Section Headers */
    .ox-sec-head { text-align: center; margin-bottom: 60px; max-width: 700px; margin-left: auto; margin-right: auto; }
    .ox-sec-badge { color: #d4af37; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; font-size: 0.9rem; margin-bottom: 15px; display: block; }
    .ox-sec-head h2 { font-size: 3rem; color: #0a192f; margin-bottom: 20px; font-weight: 800; letter-spacing: -1px; }
    .ox-sec-head p { color: #475569; font-size: 1.15rem; line-height: 1.7; }

    /* Principal's Message */
    .ox-principal { padding: 120px 5%; display: flex; align-items: center; gap: 80px; background: #ffffff; }
    .ox-principal-img { flex: 1; position: relative; }
    .ox-principal-img img { width: 100%; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    .ox-principal-img::before { content: ''; position: absolute; top: -20px; left: -20px; right: 20px; bottom: 20px; border: 2px solid #d4af37; border-radius: 20px; z-index: -1; }
    .ox-principal-text { flex: 1; }
    .ox-principal-text h2 { font-size: 2.5rem; color: #0a192f; margin-bottom: 20px; font-weight: 800; }
    .ox-principal-text p { font-size: 1.15rem; color: #475569; line-height: 1.8; margin-bottom: 30px; }
    .ox-signature { font-family: 'Brush Script MT', cursive, serif; font-size: 2.5rem; color: #0a192f; }
    .ox-principal-name { font-weight: 700; color: #0a192f; margin-top: 10px; }
    .ox-principal-title { color: #64748b; font-size: 0.95rem; }

    /* Academic Programs */
    .ox-programs { padding: 120px 5%; background: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
    .ox-prog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; max-width: 1200px; margin: 0 auto; }
    .ox-prog-card { background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); transition: transform 0.3s; }
    .ox-prog-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    .ox-prog-img { height: 200px; background: #e2e8f0; overflow: hidden; }
    .ox-prog-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .ox-prog-card:hover .ox-prog-img img { transform: scale(1.05); }
    .ox-prog-body { padding: 40px; }
    .ox-prog-body h3 { font-size: 1.5rem; color: #0a192f; margin-bottom: 15px; font-weight: 700; }
    .ox-prog-body p { color: #475569; line-height: 1.6; margin-bottom: 20px; }
    .ox-prog-link { color: #d4af37; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 5px; }
    .ox-prog-link:hover { color: #0a192f; }

    /* Facilities / Campus Grid */
    .ox-facilities { padding: 120px 5%; background: #ffffff; }
    .ox-fac-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 250px; gap: 20px; max-width: 1200px; margin: 0 auto; }
    .ox-fac-item { border-radius: 20px; overflow: hidden; position: relative; }
    .ox-fac-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .ox-fac-item:hover img { transform: scale(1.1); }
    .ox-fac-overlay { position: absolute; bottom: 0; left: 0; width: 100%; padding: 30px 20px 20px; background: linear-gradient(to top, rgba(10,25,47,0.9), transparent); color: white; font-weight: 700; font-size: 1.2rem; transform: translateY(20px); opacity: 0; transition: all 0.3s; }
    .ox-fac-item:hover .ox-fac-overlay { transform: translateY(0); opacity: 1; }
    .ox-fac-large { grid-column: span 2; grid-row: span 2; }

    /* Events Calendar */
    .ox-events { padding: 120px 5%; background: #0a192f; color: white; }
    .ox-events .ox-sec-head h2 { color: white; }
    .ox-events .ox-sec-head p { color: #94a3b8; }
    .ox-event-list { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
    .ox-event-row { display: flex; background: rgba(255,255,255,0.05); border-radius: 16px; padding: 30px; align-items: center; gap: 30px; transition: background 0.3s; border: 1px solid rgba(255,255,255,0.05); }
    .ox-event-row:hover { background: rgba(255,255,255,0.1); border-color: #d4af37; }
    .ox-event-date { background: #d4af37; color: #0a192f; padding: 15px 25px; border-radius: 12px; text-align: center; min-width: 100px; }
    .ox-event-date span { display: block; font-size: 2rem; font-weight: 800; line-height: 1; }
    .ox-event-date small { font-weight: 700; text-transform: uppercase; }
    .ox-event-details flex: 1; }
    .ox-event-details h3 { font-size: 1.4rem; margin-bottom: 10px; font-weight: 700; }
    .ox-event-details p { color: #94a3b8; margin: 0; }

    /* Testimonials */
    .ox-testimonials { padding: 120px 5%; background: #ffffff; }
    .ox-testimonial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; max-width: 1200px; margin: 0 auto; }
    .ox-testi-card { background: #f8fafc; padding: 40px; border-radius: 20px; position: relative; border: 1px solid #e2e8f0; }
    .ox-testi-text { font-size: 1.1rem; color: #475569; line-height: 1.7; font-style: italic; margin-bottom: 20px; }
    .ox-testi-author { font-weight: 700; color: #0a192f; }
    .ox-testi-role { font-size: 0.9rem; color: #d4af37; font-weight: 600; }

    /* FAQ */
    .ox-faq { padding: 120px 5%; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    .ox-faq-container { max-width: 800px; margin: 0 auto; }
    .ox-faq-item { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 15px; padding: 25px; cursor: pointer; transition: all 0.3s; }
    .ox-faq-item:hover { border-color: #d4af37; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
    .ox-faq-q { font-size: 1.2rem; font-weight: 700; color: #0a192f; display: flex; justify-content: space-between; align-items: center; margin: 0; }
    .ox-faq-q::after { content: '+'; color: #d4af37; font-size: 1.5rem; }
    .ox-faq-a { display: none; color: #475569; line-height: 1.6; margin-top: 15px; border-top: 1px solid #f1f5f9; padding-top: 15px; }

    /* CTA Section */
    .ox-cta { padding: 100px 5%; background: linear-gradient(135deg, #0a192f 0%, #112a4f 100%); color: white; text-align: center; }
    .ox-cta h2 { font-size: 3.5rem; font-weight: 800; margin-bottom: 20px; }
    .ox-cta p { font-size: 1.2rem; color: #cbd5e1; max-width: 600px; margin: 0 auto 40px auto; line-height: 1.6; }
    .ox-cta .ox-btn { background: #d4af37; color: #0a192f; font-size: 1.15rem; padding: 18px 45px; }

    /* Comprehensive Footer */
    .ox-footer { background: #050d1a; color: #94a3b8; padding: 80px 5% 40px; }
    .ox-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 40px; max-width: 1200px; margin: 0 auto 60px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 60px; }
    .ox-footer h4 { color: #ffffff; font-size: 1.2rem; margin-bottom: 25px; font-weight: 700; }
    .ox-footer p { line-height: 1.7; margin-bottom: 20px; }
    .ox-footer ul { list-style: none; padding: 0; margin: 0; }
    .ox-footer ul li { margin-bottom: 12px; }
    .ox-footer ul a { color: #94a3b8; text-decoration: none; transition: color 0.3s; }
    .ox-footer ul a:hover { color: #d4af37; }
    .ox-newsletter input { width: 100%; padding: 15px 20px; border-radius: 8px; border: none; background: rgba(255,255,255,0.05); color: white; margin-bottom: 15px; }
    .ox-newsletter button { width: 100%; background: #d4af37; color: #0a192f; border: none; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: background 0.3s; }
    .ox-newsletter button:hover { background: #ffffff; }
    .ox-footer-bottom { text-align: center; font-size: 0.9rem; }
    
    @media (max-width: 992px) {
        .ox-hero { flex-direction: column; text-align: center; padding: 60px 5% 100px; }
        .ox-hero-actions { justify-content: center; }
        .ox-nav-links { display: none; }
        .ox-principal { flex-direction: column; text-align: center; }
        .ox-fac-grid { grid-template-columns: 1fr 1fr; }
        .ox-fac-large { grid-column: span 1; grid-row: span 1; }
        .ox-footer-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 768px) {
        .ox-stats { flex-direction: column; gap: 30px; }
        .ox-event-row { flex-direction: column; text-align: center; }
        .ox-footer-grid { grid-template-columns: 1fr; }
    }
    `;

    // Remove old CSS using substring to avoid regex errors
    let cssStartIndex = content.indexOf('/* EXTRAORDINARY GSAP LANDING CSS */');
    if (cssStartIndex === -1) cssStartIndex = content.indexOf('/* PREMIUM LANDING CSS - COMPLETE EDITION */');
    if (cssStartIndex === -1) cssStartIndex = content.indexOf('/* PREMIUM LANDING CSS */');
    
    if (cssStartIndex !== -1) {
        const styleEndIndex = content.indexOf('</style>', cssStartIndex);
        if (styleEndIndex !== -1) {
            content = content.substring(0, cssStartIndex) + newCSS + '\\n' + content.substring(styleEndIndex);
        }
    } else {
        content = content.replace('</style>', newCSS + '\\n</style>');
    }

    const newHTML = `<!-- LANDING -->
<div id="landing-page" class="ox-landing">

    <div class="ox-ticker">🎉 Admissions for the Fall 2026 Academic Year are now open! Limited seats available.</div>

    <nav class="ox-nav gs-anim">
        <div class="ox-brand" id="land-name">
            <div class="ox-brand-icon">OE</div>
            Oxford Excellence
        </div>
        <div class="ox-nav-links">
            <a href="#about">About Us</a>
            <a href="#programs">Academics</a>
            <a href="#campus">Campus Life</a>
            <a href="#events">Events</a>
            <a href="#admissions">Admissions</a>
        </div>
        <button class="ox-btn" onclick="openLogin()">Access Portal</button>
    </nav>

    <header class="ox-hero">
        <div class="ox-hero-content gs-anim-up">
            <div class="ox-badge">A Legacy of Excellence Since 1995</div>
            <h1>Empowering the <br><span>Global Leaders</span> of Tomorrow</h1>
            <p id="land-copy">Discover an educational environment where tradition meets innovation, preparing students for success at the world's top universities.</p>
            <div class="ox-hero-actions">
                <button class="ox-btn" onclick="openLogin()" style="padding: 16px 36px; font-size: 1.1rem;">Enroll Now</button>
                <button class="ox-btn ox-btn-outline" onclick="document.getElementById('about').scrollIntoView({behavior: 'smooth'})" style="padding: 16px 36px; font-size: 1.1rem;">Explore Campus</button>
            </div>
        </div>
        <div class="ox-hero-img gs-anim-in">
            <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Oxford Excellence Students" />
        </div>
    </header>

    <div class="ox-stats gs-stats">
        <div class="ox-stat-item">
            <div class="ox-stat-num"><span class="gs-counter" data-target="99">0</span><span>%</span></div>
            <div class="ox-stat-label">Graduation Rate</div>
        </div>
        <div class="ox-stat-item">
            <div class="ox-stat-num"><span class="gs-counter" data-target="50">0</span><span>+</span></div>
            <div class="ox-stat-label">Global Awards</div>
        </div>
        <div class="ox-stat-item">
            <div class="ox-stat-num"><span>1:</span><span class="gs-counter" data-target="15">0</span></div>
            <div class="ox-stat-label">Teacher-Student Ratio</div>
        </div>
        <div class="ox-stat-item">
            <div class="ox-stat-num"><span class="gs-counter" data-target="10">0</span><span>k+</span></div>
            <div class="ox-stat-label">Alumni Worldwide</div>
        </div>
    </div>

    <!-- Principal Message -->
    <section class="ox-principal gs-scroll-up" id="about">
        <div class="ox-principal-img">
            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Principal" />
        </div>
        <div class="ox-principal-text">
            <span class="ox-sec-badge">Welcome to Excellence</span>
            <h2>A Message From The Head of School</h2>
            <p>At Oxford Excellence Academy, we don't just teach curriculum; we cultivate character. For over three decades, we have been dedicated to providing a holistic environment where intellectual curiosity thrives, ethical values are instilled, and global perspectives are embraced.</p>
            <p>Our students go on to attend Ivy League institutions and become leaders in their respective fields because we equip them with resilience, critical thinking, and a profound sense of purpose.</p>
            <div class="ox-signature">Alexander Wright</div>
            <div class="ox-principal-name">Dr. Alexander Wright</div>
            <div class="ox-principal-title">Founding Principal & Head of Education</div>
        </div>
    </section>

    <!-- Academic Programs -->
    <section class="ox-programs" id="programs">
        <div class="ox-sec-head gs-scroll-up">
            <span class="ox-sec-badge">Our Curriculum</span>
            <h2>Academic Programs</h2>
            <p>A rigorous, globally recognized framework tailored for every stage of a student's developmental journey.</p>
        </div>
        <div class="ox-prog-grid gs-stagger">
            <div class="ox-prog-card">
                <div class="ox-prog-img"><img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Early Years" /></div>
                <div class="ox-prog-body">
                    <h3>Early Years (Pre-K to Grade 2)</h3>
                    <p>Fostering natural curiosity and foundational cognitive skills through play-based and structured experiential learning.</p>
                    <a href="#" class="ox-prog-link">Learn More &rarr;</a>
                </div>
            </div>
            <div class="ox-prog-card">
                <div class="ox-prog-img"><img src="https://images.unsplash.com/photo-1427504494785-319ce8372ac0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Primary School" /></div>
                <div class="ox-prog-body">
                    <h3>Primary School (Grades 3 to 8)</h3>
                    <p>Building strong analytical abilities, collaborative teamwork, and a deep understanding of core STEM and Arts subjects.</p>
                    <a href="#" class="ox-prog-link">Learn More &rarr;</a>
                </div>
            </div>
            <div class="ox-prog-card">
                <div class="ox-prog-img"><img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Secondary School" /></div>
                <div class="ox-prog-body">
                    <h3>Secondary School (Grades 9 to 12)</h3>
                    <p>Rigorous college-preparatory coursework, Advanced Placement (AP) classes, and specialized career pathway accelerators.</p>
                    <a href="#" class="ox-prog-link">Learn More &rarr;</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Campus Facilities -->
    <section class="ox-facilities" id="campus">
        <div class="ox-sec-head gs-scroll-up">
            <span class="ox-sec-badge">Student Life</span>
            <h2>World-Class Facilities</h2>
            <p>Our 50-acre campus provides the perfect ecosystem for academic, athletic, and artistic brilliance.</p>
        </div>
        <div class="ox-fac-grid gs-stagger">
            <div class="ox-fac-item ox-fac-large">
                <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Library" />
                <div class="ox-fac-overlay">The Grand Library & Research Center</div>
            </div>
            <div class="ox-fac-item">
                <img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Science Lab" />
                <div class="ox-fac-overlay">Advanced STEM Laboratories</div>
            </div>
            <div class="ox-fac-item">
                <img src="https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Sports Field" />
                <div class="ox-fac-overlay">Olympic-Grade Athletics</div>
            </div>
            <div class="ox-fac-item">
                <img src="https://images.unsplash.com/photo-1514302240736-b1fee5985889?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Arts Center" />
                <div class="ox-fac-overlay">Performing Arts Theater</div>
            </div>
            <div class="ox-fac-item">
                <img src="https://images.unsplash.com/photo-1588702547923-70659a6df286?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Cafeteria" />
                <div class="ox-fac-overlay">Organic Dining Commons</div>
            </div>
        </div>
    </section>

    <!-- Events Calendar -->
    <section class="ox-events" id="events">
        <div class="ox-sec-head gs-scroll-up">
            <span class="ox-sec-badge" style="color:#ffffff;">Stay Updated</span>
            <h2>Upcoming Events</h2>
            <p>Join us at our upcoming academic and cultural gatherings.</p>
        </div>
        <div class="ox-event-list gs-stagger">
            <div class="ox-event-row">
                <div class="ox-event-date"><span>15</span><small>Oct</small></div>
                <div class="ox-event-details">
                    <h3>Fall Open House & Campus Tour</h3>
                    <p>Prospective parents and students are invited to tour the facilities and meet the faculty.</p>
                </div>
                <button class="ox-btn" style="background:#ffffff; color:#0a192f;">RSVP</button>
            </div>
            <div class="ox-event-row">
                <div class="ox-event-date"><span>22</span><small>Oct</small></div>
                <div class="ox-event-details">
                    <h3>Annual STEM Innovation Fair</h3>
                    <p>Witness groundbreaking projects from our secondary school engineering students.</p>
                </div>
                <button class="ox-btn" style="background:#ffffff; color:#0a192f;">RSVP</button>
            </div>
            <div class="ox-event-row">
                <div class="ox-event-date"><span>05</span><small>Nov</small></div>
                <div class="ox-event-details">
                    <h3>Winter Performing Arts Gala</h3>
                    <p>A spectacular evening featuring our award-winning choir and theater ensemble.</p>
                </div>
                <button class="ox-btn" style="background:#ffffff; color:#0a192f;">RSVP</button>
            </div>
        </div>
    </section>

    <!-- Testimonials -->
    <section class="ox-testimonials">
        <div class="ox-sec-head gs-scroll-up">
            <span class="ox-sec-badge">Parent Voices</span>
            <h2>What Our Community Says</h2>
        </div>
        <div class="ox-testimonial-grid gs-stagger">
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
            <div class="ox-testi-card">
                <div class="ox-testi-text">"The college counseling team is phenomenal. They guided my son into his dream Ivy League university with unparalleled dedication."</div>
                <div class="ox-testi-author">Elena Rodriguez</div>
                <div class="ox-testi-role">Parent of Alumni</div>
            </div>
        </div>
    </section>

    <!-- FAQ -->
    <section class="ox-faq">
        <div class="ox-sec-head gs-scroll-up">
            <span class="ox-sec-badge">Information</span>
            <h2>Frequently Asked Questions</h2>
        </div>
        <div class="ox-faq-container gs-stagger">
            <div class="ox-faq-item" onclick="this.querySelector('.ox-faq-a').style.display = this.querySelector('.ox-faq-a').style.display === 'block' ? 'none' : 'block'">
                <div class="ox-faq-q">What are the school hours?</div>
                <div class="ox-faq-a">Regular school hours are from 8:00 AM to 3:30 PM, Monday through Friday. Extracurricular activities run from 3:45 PM to 5:30 PM.</div>
            </div>
            <div class="ox-faq-item" onclick="this.querySelector('.ox-faq-a').style.display = this.querySelector('.ox-faq-a').style.display === 'block' ? 'none' : 'block'">
                <div class="ox-faq-q">Is financial aid available?</div>
                <div class="ox-faq-a">Yes, we offer need-based financial aid and merit scholarships to ensure that exceptional students can attend regardless of financial background.</div>
            </div>
            <div class="ox-faq-item" onclick="this.querySelector('.ox-faq-a').style.display = this.querySelector('.ox-faq-a').style.display === 'block' ? 'none' : 'block'">
                <div class="ox-faq-q">What is the admissions process?</div>
                <div class="ox-faq-a">The process involves submitting an online application via the portal, providing past academic transcripts, taking an entrance assessment, and attending a family interview.</div>
            </div>
        </div>
    </section>

    <!-- CTA & Footer -->
    <section class="ox-cta" id="admissions">
        <h2 class="gs-scroll-up">Ready to Join Our Legacy?</h2>
        <p class="gs-scroll-up">Take the first step towards a brilliant future. Access the portal to start your application, manage documents, and connect with our admissions team.</p>
        <div class="gs-scroll-up">
            <button class="ox-btn" onclick="openLogin()">Access Secure Portal</button>
        </div>
    </section>

    <footer class="ox-footer">
        <div class="ox-footer-grid">
            <div>
                <div class="ox-brand" style="color:white; margin-bottom:20px;">
                    <div class="ox-brand-icon" style="background:#d4af37; color:#0a192f;">OE</div>
                    Oxford Excellence
                </div>
                <p>Empowering the leaders of tomorrow through rigorous academics, profound character development, and a commitment to global excellence.</p>
            </div>
            <div>
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="#about">About Us</a></li>
                    <li><a href="#programs">Academics</a></li>
                    <li><a href="#campus">Campus Life</a></li>
                    <li><a href="#admissions">Admissions</a></li>
                </ul>
            </div>
            <div>
                <h4>Contact Us</h4>
                <ul>
                    <li>📞 (555) 123-4567</li>
                    <li>✉️ info@oxfordexcellence.edu</li>
                    <li>📍 100 University Ave, Tech District</li>
                </ul>
            </div>
            <div class="ox-newsletter">
                <h4>Newsletter</h4>
                <p>Subscribe for the latest news and event updates.</p>
                <input type="email" placeholder="Enter your email address" />
                <button>Subscribe</button>
            </div>
        </div>
        <div class="ox-footer-bottom">
            <p>&copy; 2026 Oxford Excellence Academy. All rights reserved. | Designed for Excellence.</p>
        </div>
    </footer>

    <!-- GSAP Scripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script>
        document.addEventListener("DOMContentLoaded", (event) => {
            if (typeof gsap !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);

                // Initial Load
                gsap.from(".gs-anim", { y: -50, opacity: 0, duration: 1, ease: "power3.out" });
                gsap.from(".gs-anim-up", { y: 50, opacity: 0, duration: 1, delay: 0.2, ease: "power3.out" });
                gsap.from(".gs-anim-in", { x: 50, opacity: 0, duration: 1.5, delay: 0.4, ease: "power3.out" });

                // Stats Counters
                ScrollTrigger.create({
                    trigger: ".gs-stats",
                    start: "top 85%",
                    onEnter: () => {
                        const counters = document.querySelectorAll('.gs-counter');
                        counters.forEach(counter => {
                            const target = +counter.getAttribute('data-target');
                            gsap.to(counter, { innerHTML: target, duration: 2.5, snap: { innerHTML: 1 }, ease: "power2.out" });
                        });
                    },
                    once: true
                });

                // Scroll Up Elements
                const upElements = document.querySelectorAll('.gs-scroll-up');
                upElements.forEach(el => {
                    gsap.from(el, { scrollTrigger: { trigger: el, start: "top 85%" }, y: 40, opacity: 0, duration: 1, ease: "power3.out" });
                });

                // Staggered Grids
                const staggerGroups = document.querySelectorAll('.gs-stagger');
                staggerGroups.forEach(group => {
                    gsap.from(group.children, { scrollTrigger: { trigger: group, start: "top 80%" }, y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" });
                });
            }
        });
    </script>
</div>
`;

    const startIndex = content.indexOf('<!-- LANDING -->');
    const endIndex = content.indexOf('<!-- LOGIN -->');

    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        const before = content.substring(0, startIndex);
        const after = content.substring(endIndex);
        content = before + newHTML + after;
        fs.writeFileSync(path, content, 'utf8');
        console.log('Massive Light Landing Page HTML & CSS injected successfully.');
    } else {
        console.log('Could not find HTML boundaries.', {startIndex, endIndex});
    }

} catch(err) {
    console.error('Error:', err);
}
