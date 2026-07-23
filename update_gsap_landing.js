const fs = require('fs');
const path = 'H:/web/index.html';

try {
    let content = fs.readFileSync(path, 'utf8');

    const newCSS = `
    /* EXTRAORDINARY GSAP LANDING CSS */
    .ox-landing { font-family: 'Inter', system-ui, sans-serif; background: #030a16; color: #f8fafc; margin: 0; padding: 0; overflow-x: hidden; position: relative; }
    
    /* Ambient Glows */
    .ox-ambient-1 { position: absolute; top: -10%; left: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(3,10,22,0) 70%); filter: blur(80px); z-index: 0; animation: pulseGlow 8s infinite alternate; }
    .ox-ambient-2 { position: absolute; top: 40%; right: -20%; width: 60vw; height: 60vw; background: radial-gradient(circle, rgba(10,25,47,0.8) 0%, rgba(3,10,22,0) 70%); filter: blur(100px); z-index: 0; }

    .ox-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 5%; background: rgba(3, 10, 22, 0.7); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 1000; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .ox-brand { font-size: 1.5rem; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; display: flex; align-items: center; gap: 12px; z-index: 10; }
    .ox-brand-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #d4af37 0%, #aa8c2c 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #030a16; font-size: 1.1rem; box-shadow: 0 0 20px rgba(212,175,55,0.4); }
    .ox-nav-links { display: flex; gap: 32px; z-index: 10; }
    .ox-nav-links a { text-decoration: none; color: #94a3b8; font-weight: 500; transition: color 0.3s; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px; }
    .ox-nav-links a:hover { color: #d4af37; }
    .ox-btn { background: #d4af37; color: #030a16; padding: 12px 30px; border-radius: 50px; font-weight: 700; text-decoration: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: none; font-size: 0.95rem; z-index: 10; position: relative; overflow: hidden; }
    .ox-btn::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transition: 0.5s; }
    .ox-btn:hover::after { left: 100%; }
    .ox-btn:hover { background: #e5c358; transform: translateY(-3px); box-shadow: 0 15px 30px rgba(212, 175, 55, 0.3); }
    
    /* Hero Section */
    .ox-hero { padding: 100px 5% 150px; display: flex; align-items: center; justify-content: space-between; gap: 60px; min-height: 100vh; position: relative; z-index: 1; }
    .ox-hero-content { flex: 1; max-width: 650px; }
    .ox-badge { display: inline-block; background: rgba(255, 255, 255, 0.05); color: #d4af37; padding: 8px 24px; border-radius: 30px; font-size: 0.85rem; font-weight: 700; margin-bottom: 30px; letter-spacing: 2px; text-transform: uppercase; border: 1px solid rgba(212,175,55,0.2); backdrop-filter: blur(10px); }
    .ox-hero h1 { font-size: 5rem; line-height: 1.05; color: #ffffff; margin-bottom: 30px; font-weight: 800; letter-spacing: -2px; }
    .ox-hero h1 .gradient-text { background: linear-gradient(135deg, #d4af37 0%, #ffffff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .ox-hero p { font-size: 1.35rem; color: #94a3b8; margin-bottom: 50px; line-height: 1.7; max-width: 550px; font-weight: 300; }
    .ox-hero-img { flex: 1; display: flex; justify-content: center; position: relative; perspective: 1000px; }
    .ox-hero-img img { max-width: 100%; border-radius: 30px; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6); object-fit: cover; aspect-ratio: 4/3; transform-style: preserve-3d; transition: transform 0.1s; }
    
    /* Stats Bar */
    .ox-stats { background: rgba(10, 25, 47, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); padding: 60px 5%; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 40px; position: relative; z-index: 10; margin-top: -80px; border-radius: 30px; max-width: 1200px; margin-left: auto; margin-right: auto; box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
    .ox-stat-item { text-align: center; flex: 1; min-width: 200px; }
    .ox-stat-num { font-size: 4rem; font-weight: 800; color: #d4af37; margin-bottom: 10px; font-variant-numeric: tabular-nums; display: flex; align-items: center; justify-content: center; }
    .ox-stat-num span { font-size: 3rem; color: #ffffff; margin-left: 5px; }
    .ox-stat-label { font-size: 1rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; }

    /* Vision / About Split */
    .ox-vision { padding: 150px 5%; position: relative; z-index: 2; display: flex; align-items: center; gap: 80px; }
    .ox-vision-img { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; position: relative; }
    .ox-vision-img img { width: 100%; height: 100%; object-fit: cover; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .ox-vision-img img:nth-child(2) { margin-top: 80px; }
    .ox-vision-text { flex: 1; }
    .ox-vision-text h2 { font-size: 3.5rem; color: #ffffff; margin-bottom: 30px; font-weight: 800; letter-spacing: -1px; }
    .ox-vision-text p { font-size: 1.2rem; color: #94a3b8; line-height: 1.8; margin-bottom: 40px; font-weight: 300; }
    .ox-vision-text ul { list-style: none; padding: 0; margin-bottom: 50px; }
    .ox-vision-text li { font-size: 1.15rem; color: #cbd5e1; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; font-weight: 500; }
    .ox-vision-text li i { color: #d4af37; font-size: 1.4rem; font-style: normal; }

    /* Features Grid */
    .ox-features { padding: 150px 5%; position: relative; z-index: 2; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); }
    .ox-sec-head { text-align: center; margin-bottom: 80px; }
    .ox-sec-head h2 { font-size: 3.5rem; color: #ffffff; margin-bottom: 20px; font-weight: 800; letter-spacing: -1px; }
    .ox-sec-head p { color: #94a3b8; font-size: 1.2rem; max-width: 600px; margin: 0 auto; line-height: 1.7; }
    .ox-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; max-width: 1200px; margin: 0 auto; perspective: 1000px; }
    .ox-card { padding: 50px; border-radius: 30px; background: rgba(10, 25, 47, 0.4); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05); transition: border-color 0.4s; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2); transform-style: preserve-3d; }
    .ox-card:hover { border-color: rgba(212,175,55,0.5); }
    .ox-card-icon { width: 70px; height: 70px; border-radius: 20px; background: rgba(212,175,55,0.1); color: #d4af37; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin-bottom: 30px; transform: translateZ(30px); }
    .ox-card h3 { font-size: 1.6rem; color: #ffffff; margin-bottom: 15px; font-weight: 700; transform: translateZ(20px); }
    .ox-card p { color: #94a3b8; line-height: 1.7; font-size: 1.1rem; margin: 0; transform: translateZ(10px); }

    /* Testimonials */
    .ox-testimonials { padding: 150px 5%; text-align: center; position: relative; z-index: 2; }
    .ox-testimonial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 40px; max-width: 1100px; margin: 0 auto; margin-top: 80px; }
    .ox-testi-card { background: linear-gradient(180deg, rgba(10,25,47,0.8) 0%, rgba(3,10,22,0.9) 100%); padding: 50px; border-radius: 30px; position: relative; text-align: left; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
    .ox-testi-card::before { content: '"'; font-size: 8rem; color: rgba(212,175,55,0.1); position: absolute; top: -10px; right: 30px; font-family: Georgia, serif; line-height: 1; }
    .ox-testi-text { font-size: 1.2rem; color: #cbd5e1; line-height: 1.8; font-style: italic; margin-bottom: 30px; position: relative; z-index: 1; font-weight: 300; }
    .ox-testi-author { font-weight: 700; color: #ffffff; font-size: 1.1rem; }
    .ox-testi-role { font-size: 0.95rem; color: #d4af37; margin-top: 5px; }

    /* CTA Section */
    .ox-cta { padding: 120px 5%; background: radial-gradient(circle at center, #0a192f 0%, #030a16 100%); color: white; text-align: center; position: relative; z-index: 2; border-top: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
    .ox-cta::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80vw; height: 80vw; background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 60%); border-radius: 50%; z-index: 0; pointer-events: none; }
    .ox-cta-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
    .ox-cta h2 { font-size: 4rem; font-weight: 800; margin-bottom: 30px; color: #ffffff; letter-spacing: -1px; }
    .ox-cta p { font-size: 1.3rem; color: #94a3b8; margin: 0 auto 50px auto; line-height: 1.7; font-weight: 300; }
    .ox-cta .ox-btn { font-size: 1.25rem; padding: 20px 50px; border-radius: 50px; }

    /* Footer */
    .ox-footer { background: #01040a; color: #64748b; padding: 40px 5%; text-align: center; font-size: 0.95rem; border-top: 1px solid rgba(255,255,255,0.02); }
    
    @keyframes pulseGlow { 0% { opacity: 0.5; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1.1); } }
    
    @media (max-width: 992px) {
        .ox-hero { flex-direction: column; text-align: center; padding: 100px 5% 150px; }
        .ox-hero-content { max-width: 100%; }
        .ox-hero h1 { font-size: 3.5rem; }
        .ox-nav-links { display: none; }
        .ox-stats { flex-direction: column; gap: 40px; margin-top: -80px; padding: 40px; }
        .ox-vision { flex-direction: column; text-align: center; }
        .ox-vision-img { display: none; } 
        .ox-vision-text li { justify-content: center; }
        .ox-cta h2 { font-size: 3rem; }
    }
    @media (max-width: 480px) {
        .ox-hero h1 { font-size: 2.75rem; }
        .ox-stat-num { font-size: 3rem; }
    }
    `;

    // Remove old CSS using substring to avoid regex errors
    let cssStartIndex = content.indexOf('/* PREMIUM LANDING CSS - COMPLETE EDITION */');
    if (cssStartIndex === -1) {
        cssStartIndex = content.indexOf('/* PREMIUM LANDING CSS */');
    }
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
    <!-- Ambient Backgrounds -->
    <div class="ox-ambient-1"></div>
    <div class="ox-ambient-2"></div>

    <!-- Navbar -->
    <nav class="ox-nav gs-nav">
        <div class="ox-brand" id="land-name">
            <div class="ox-brand-icon">OE</div>
            Oxford Excellence
        </div>
        <div class="ox-nav-links">
            <a href="#vision" class="gs-nav-link">Vision</a>
            <a href="#curriculum" class="gs-nav-link">Curriculum</a>
            <a href="#admissions" class="gs-nav-link">Admissions</a>
        </div>
        <button class="ox-btn gs-nav-btn" onclick="openLogin()">Access Portal</button>
    </nav>

    <!-- Hero -->
    <header class="ox-hero">
        <div class="ox-hero-content">
            <div class="ox-badge gs-hero-elem">Est. 1995 • Elite Education</div>
            <h1 class="gs-hero-elem">Empowering the <br><span class="gradient-text">Leaders</span> of Tomorrow</h1>
            <p id="land-copy" class="gs-hero-elem">A premier institution dedicated to academic brilliance, technological innovation, and elite holistic growth.</p>
            <div class="gs-hero-elem">
                <button class="ox-btn" onclick="openLogin()" style="padding: 18px 45px; font-size: 1.15rem;">Student & Parent Login</button>
            </div>
        </div>
        <div class="ox-hero-img gs-hero-img">
            <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Oxford Excellence Students" />
        </div>
    </header>

    <!-- Stats Bar -->
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

    <!-- Our Vision -->
    <section class="ox-vision" id="vision">
        <div class="ox-vision-img">
            <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Campus Library" class="gs-vision-img1" />
            <img src="https://images.unsplash.com/photo-1427504494785-319ce8372ac0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Students studying" class="gs-vision-img2" />
        </div>
        <div class="ox-vision-text gs-vision-text">
            <h2>Shaping Minds, Building Futures</h2>
            <p>At Oxford Excellence Academy, education transcends the ordinary. We merge tradition with cutting-edge innovation to forge the leaders of the next century.</p>
            <ul>
                <li><i>✦</i> State-of-the-art innovation labs & campuses</li>
                <li><i>✦</i> Ivy-League aligned accredited curriculum</li>
                <li><i>✦</i> Intensive focus on ethical leadership</li>
                <li><i>✦</i> Elite sports, arts, and tech accelerators</li>
            </ul>
            <button class="ox-btn" onclick="openLogin()">Discover Our Legacy</button>
        </div>
    </section>

    <!-- Features Grid -->
    <section class="ox-features" id="curriculum">
        <div class="ox-sec-head gs-feat-head">
            <h2>Our Educational Pillars</h2>
            <p>A comprehensive, world-renowned framework designed for unparalleled success.</p>
        </div>
        <div class="ox-grid">
            <div class="ox-card gs-card 3d-card">
                <div class="ox-card-icon">🔬</div>
                <h3>STEM Mastery</h3>
                <p>Robotics, AI accelerators, and quantum labs preparing students for a tech-driven future.</p>
            </div>
            <div class="ox-card gs-card 3d-card">
                <div class="ox-card-icon">🎭</div>
                <h3>Creative Arts</h3>
                <p>Nurturing boundless creativity through elite visual arts, music, and cinematic programs.</p>
            </div>
            <div class="ox-card gs-card 3d-card">
                <div class="ox-card-icon">🌍</div>
                <h3>Global Leadership</h3>
                <p>Model UN, international summits, and diplomacy training to build global awareness.</p>
            </div>
        </div>
    </section>

    <!-- Testimonials -->
    <section class="ox-testimonials gs-testi-sec">
        <div class="ox-sec-head">
            <h2>The Oxford Difference</h2>
        </div>
        <div class="ox-testimonial-grid">
            <div class="ox-testi-card gs-testi">
                <div class="ox-testi-text">"The transformation in our daughter's confidence is simply staggering. This isn't just a school, it's an accelerator for brilliant minds."</div>
                <div class="ox-testi-author">Sarah Jenkins</div>
                <div class="ox-testi-role">Parent of Grade 10 Student</div>
            </div>
            <div class="ox-testi-card gs-testi">
                <div class="ox-testi-text">"The perfect equilibrium of rigorous Ivy-tier academics and essential emotional intelligence. A truly extraordinary environment."</div>
                <div class="ox-testi-author">Michael Chen</div>
                <div class="ox-testi-role">Parent of Grade 12 Student</div>
            </div>
        </div>
    </section>

    <!-- CTA & Footer -->
    <section class="ox-cta gs-cta" id="admissions">
        <div class="ox-cta-content">
            <h2>Ready to Join The Elite?</h2>
            <p>Take the defining step towards a brilliant future. Access the portal to manage applications, view progress, and connect.</p>
            <button class="ox-btn" onclick="openLogin()">Access School Portal</button>
        </div>
    </section>

    <footer class="ox-footer">
        <p>&copy; 2026 Oxford Excellence Academy. All rights reserved. | Empowering the Leaders of Tomorrow.</p>
    </footer>

    <!-- GSAP Scripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script>
        document.addEventListener("DOMContentLoaded", (event) => {
            gsap.registerPlugin(ScrollTrigger);

            // Hero Entrance Animation
            const tl = gsap.timeline();
            tl.from(".gs-nav", { y: -50, opacity: 0, duration: 1, ease: "power3.out" })
              .from(".gs-hero-elem", { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: "power4.out" }, "-=0.5")
              .from(".gs-hero-img", { x: 100, opacity: 0, rotationY: 15, duration: 1.5, ease: "power3.out" }, "-=1");

            // Stats Counters on Scroll
            ScrollTrigger.create({
                trigger: ".gs-stats",
                start: "top 80%",
                onEnter: () => {
                    const counters = document.querySelectorAll('.gs-counter');
                    counters.forEach(counter => {
                        const target = +counter.getAttribute('data-target');
                        gsap.to(counter, {
                            innerHTML: target,
                            duration: 2.5,
                            snap: { innerHTML: 1 },
                            ease: "power2.out"
                        });
                    });
                },
                once: true
            });

            // Vision Parallax
            gsap.from(".gs-vision-img1", {
                scrollTrigger: { trigger: ".ox-vision", start: "top 80%", scrub: 1 },
                y: 100, opacity: 0, ease: "none"
            });
            gsap.from(".gs-vision-img2", {
                scrollTrigger: { trigger: ".ox-vision", start: "top 70%", scrub: 1 },
                y: 150, opacity: 0, ease: "none"
            });
            gsap.from(".gs-vision-text", {
                scrollTrigger: { trigger: ".ox-vision", start: "top 70%" },
                x: 50, opacity: 0, duration: 1, ease: "power3.out"
            });

            // Features Cards Stagger
            gsap.from(".gs-feat-head", {
                scrollTrigger: { trigger: ".ox-features", start: "top 80%" },
                y: 30, opacity: 0, duration: 1
            });
            gsap.from(".gs-card", {
                scrollTrigger: { trigger: ".ox-grid", start: "top 80%" },
                y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: "back.out(1.7)"
            });

            // Testimonials Stagger
            gsap.from(".gs-testi", {
                scrollTrigger: { trigger: ".gs-testi-sec", start: "top 80%" },
                scale: 0.9, opacity: 0, duration: 1, stagger: 0.3, ease: "power3.out"
            });

            // CTA
            gsap.from(".gs-cta", {
                scrollTrigger: { trigger: ".gs-cta", start: "top 90%" },
                y: 50, opacity: 0, duration: 1
            });

            // Interactive 3D Hover on Cards & Images
            const cards = document.querySelectorAll('.3d-card, .gs-hero-img img');
            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -10;
                    const rotateY = ((x - centerX) / centerX) * 10;
                    
                    gsap.to(card, {
                        rotateX: rotateX,
                        rotateY: rotateY,
                        transformPerspective: 1000,
                        ease: "power1.out",
                        duration: 0.3
                    });
                });
                card.addEventListener('mouseleave', () => {
                    gsap.to(card, {
                        rotateX: 0,
                        rotateY: 0,
                        ease: "power3.out",
                        duration: 0.5
                    });
                });
            });
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
        console.log('Extraordinary GSAP HTML & CSS injected successfully.');
    } else {
        console.log('Could not find HTML boundaries.', {startIndex, endIndex});
    }

} catch(err) {
    console.error('Error:', err);
}
