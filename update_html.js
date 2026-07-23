const fs = require('fs');

const path = 'H:/web/index.html';
let content = fs.readFileSync(path, 'utf8');

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

const startIndex = content.indexOf('<!-- LANDING -->');
const endIndex = content.indexOf('<!-- LOGIN -->');

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    content = before + newHTML + after;
    fs.writeFileSync(path, content, 'utf8');
    console.log('HTML replaced successfully.');
} else {
    console.log('Could not find boundaries.', {startIndex, endIndex});
}
