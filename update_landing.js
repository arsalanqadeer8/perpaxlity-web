const fs = require('fs');

const path = 'H:/web/index.html';
let content = fs.readFileSync(path, 'utf8');

// The new CSS to inject before </style>
const newCSS = `
    /* PREMIUM LANDING CSS */
    .ox-landing { font-family: 'Inter', system-ui, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 0; overflow-x: hidden; min-height: 100vh; }
    .ox-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 5%; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 1000; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .ox-brand { font-size: 1.5rem; font-weight: 800; color: #0a192f; letter-spacing: -0.5px; }
    .ox-nav-links { display: flex; gap: 32px; }
    .ox-nav-links a { text-decoration: none; color: #475569; font-weight: 500; transition: color 0.3s; font-size: 0.95rem; }
    .ox-nav-links a:hover { color: #0a192f; }
    .ox-btn { background: #0a192f; color: white; padding: 10px 24px; border-radius: 50px; font-weight: 600; text-decoration: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: none; font-size: 0.95rem; }
    .ox-btn:hover { background: #112a4f; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(10, 25, 47, 0.2); }
    .ox-hero { padding: 80px 5% 120px; display: flex; align-items: center; justify-content: space-between; gap: 40px; min-height: calc(100vh - 80px); background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); position: relative; overflow: hidden;}
    .ox-hero::before { content: ''; position: absolute; top: -20%; right: -10%; width: 60vw; height: 60vw; background: radial-gradient(circle, rgba(212,175,55,0.12) 0%, rgba(255,255,255,0) 70%); border-radius: 50%; z-index: 0; }
    .ox-hero-content { flex: 1; max-width: 600px; z-index: 1; }
    .ox-badge { display: inline-block; background: rgba(10, 25, 47, 0.05); color: #0a192f; padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; margin-bottom: 24px; letter-spacing: 0.5px; text-transform: uppercase; border: 1px solid rgba(10,25,47,0.1);}
    .ox-hero h1 { font-size: 4.5rem; line-height: 1.05; color: #0a192f; margin-bottom: 24px; font-weight: 800; letter-spacing: -1.5px;}
    .ox-hero h1 span { color: #d4af37; }
    .ox-hero p { font-size: 1.25rem; color: #475569; margin-bottom: 40px; line-height: 1.6; max-width: 500px; }
    .ox-hero-img { flex: 1; z-index: 1; display: flex; justify-content: center; position: relative; }
    .ox-hero-img img { max-width: 100%; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: float 6s ease-in-out infinite; object-fit: cover; aspect-ratio: 4/3; }
    
    .ox-features { padding: 120px 5%; background: white; position: relative; z-index: 2; border-top: 1px solid #f1f5f9; }
    .ox-sec-head { text-align: center; margin-bottom: 60px; }
    .ox-sec-head h2 { font-size: 2.75rem; color: #0a192f; margin-bottom: 16px; font-weight: 800; letter-spacing: -0.5px; }
    .ox-sec-head p { color: #64748b; font-size: 1.15rem; max-width: 600px; margin: 0 auto; line-height: 1.6; }
    .ox-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; max-width: 1200px; margin: 0 auto; }
    .ox-card { padding: 40px; border-radius: 24px; background: #ffffff; border: 1px solid #e2e8f0; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); cursor: default; }
    .ox-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -15px rgba(10,25,47,0.15); border-color: #d4af37; }
    .ox-card-icon { width: 56px; height: 56px; border-radius: 16px; background: rgba(10,25,47,0.05); color: #0a192f; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; margin-bottom: 24px; transition: all 0.3s; }
    .ox-card:hover .ox-card-icon { background: #0a192f; color: white; transform: scale(1.05) rotate(-5deg); }
    .ox-card h3 { font-size: 1.4rem; color: #0a192f; margin-bottom: 12px; font-weight: 700; }
    .ox-card p { color: #475569; line-height: 1.65; font-size: 1.05rem; margin: 0; }
    
    @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
    
    @media (max-width: 992px) {
        .ox-hero { flex-direction: column; text-align: center; padding: 60px 5% 80px; }
        .ox-hero-content { margin-bottom: 40px; max-width: 100%; }
        .ox-hero h1 { font-size: 3.5rem; }
        .ox-hero p { margin: 0 auto 30px auto; }
        .ox-nav-links { display: none; }
    }
    @media (max-width: 480px) {
        .ox-hero h1 { font-size: 2.75rem; }
    }
`;

// Insert CSS
if (!content.includes('PREMIUM LANDING CSS')) {
    content = content.replace('</style>', newCSS + '\\n</style>');
}

// The new HTML block
const newHTML = `<!-- LANDING -->
<div id="landing-page" class="ox-landing">
    <nav class="ox-nav">
        <div class="ox-brand" id="land-name">Oxford Excellence Academy</div>
        <div class="ox-nav-links">
            <a href="#about">About</a>
            <a href="#curriculum">Curriculum</a>
            <a href="#admissions">Admissions</a>
        </div>
        <button class="ox-btn" onclick="openLogin()">Access Portal</button>
    </nav>

    <header class="ox-hero">
        <div class="ox-hero-content">
            <div class="ox-badge">World-Class Education</div>
            <h1>Empowering the <span>Leaders</span> of Tomorrow</h1>
            <p id="land-copy">Learn • Grow • Excel</p>
            <button class="ox-btn" onclick="openLogin()" style="padding: 16px 36px; font-size: 1.15rem;">Student & Parent Login</button>
        </div>
        <div class="ox-hero-img">
            <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Oxford Excellence Students" />
        </div>
    </header>

    <section class="ox-features" id="about">
        <div class="ox-sec-head">
            <h2>Our Educational Pillars</h2>
            <p>We provide a comprehensive framework designed to nurture academic brilliance, personal growth, and unparalleled success.</p>
        </div>
        <div class="ox-grid">
            <div class="ox-card">
                <div class="ox-card-icon">📚</div>
                <h3>Rigorous Curriculum</h3>
                <p>Our globally recognized syllabus challenges students to think critically and master complex concepts across all disciplines.</p>
            </div>
            <div class="ox-card">
                <div class="ox-card-icon">🌱</div>
                <h3>Holistic Growth</h3>
                <p>Beyond academics, we focus on character building, leadership skills, and emotional intelligence for well-rounded development.</p>
            </div>
            <div class="ox-card">
                <div class="ox-card-icon">🏆</div>
                <h3>Proven Excellence</h3>
                <p>Join a legacy of top-tier achievers. Our students consistently excel in standardized testing and university placements.</p>
            </div>
        </div>
    </section>
</div>
`;

// Replace HTML
// Use regex to replace everything from <!-- LANDING --> up to <!-- LOGIN -->
const regex = /<!-- LANDING -->[\\s\\S]*?(?=<!-- LOGIN -->)/;
content = content.replace(regex, newHTML + '\\n');

fs.writeFileSync(path, content, 'utf8');
console.log('Update successful.');
