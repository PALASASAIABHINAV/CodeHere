-- 🔥 RESET SCRIPT: This will DELETE existing frontend data and recreate it.

-- 1. Drop existing tables if they exist
DROP TABLE IF EXISTS frontend_submissions;
DROP TABLE IF EXISTS frontend_projects;

-- 2. Create Projects Table (Updated with expected_solution_url)
CREATE TABLE frontend_projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    tags TEXT[] DEFAULT '{}',
    requirements JSONB NOT NULL DEFAULT '[]',
    
    -- Starter code
    starter_html TEXT DEFAULT '',
    starter_css TEXT DEFAULT '',
    starter_js TEXT DEFAULT '',
    
    -- Expected Solution URL (Live Website Link)
    expected_solution_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Submissions Table
CREATE TABLE frontend_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES frontend_projects(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'completed',
    submission_code JSONB, -- Stores final html, css, js
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, project_id) -- User can only have one successful completion record per project
);

-- 4. Insert Data (With Live Solution URLs)

-- PROJECT 1: Digital Business Card
INSERT INTO frontend_projects (title, slug, description, difficulty, tags, requirements, expected_solution_url, starter_html, starter_css, starter_js)
VALUES (
    'Digital Business Card',
    'digital-business-card',
    'Build a personal digital business card. This simple project tests your ability to structure HTML and apply basic CSS for layout and styling.',
    'Easy',
    ARRAY['HTML Basics', 'CSS Box Model', 'Flexbox'],
    '[
        {"id": "container", "text": "Create a main container <div>", "selector": ".card-container"},
        {"id": "img", "text": "Include a profile image <img>", "selector": "img"},
        {"id": "h1", "text": "Add your name in an <h1> tag", "selector": "h1"},
        {"id": "p", "text": "Add a short bio in a <p> tag", "selector": "p"},
        {"id": "social", "text": "Add at least 2 social links <a>", "selector": "a", "minCount": 2}
    ]',
    'https://codepen.io/pen/', -- Placeholder for a live demo
    '<!-- Create your business card structure here -->
<div class="card-container">
    
</div>',
    '/* Add your styles here */
body {
    background-color: #f0f2f5;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-family: sans-serif;
}

.card-container {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    text-align: center;
    max-width: 300px;
    width: 100%;
}',
    '// No JS needed for this challenge'
);

-- PROJECT 2: Newsletter Signup Form
INSERT INTO frontend_projects (title, slug, description, difficulty, tags, requirements, expected_solution_url, starter_html, starter_css, starter_js)
VALUES (
    'Newsletter Signup',
    'newsletter-signup',
    'Create a responsive newsletter signup component. You need to use proper form elements and create a visually appealing layout.',
    'Medium',
    ARRAY['Forms', 'Input Handling', 'Hover Effects', 'Flexbox'],
    '[
        {"id": "form", "text": "Use a <form> element", "selector": "form"},
        {"id": "email", "text": "Include an <input> with type=\"email\"", "selector": "input[type=\"email\"]"},
        {"id": "submit", "text": "Add a submit <button>", "selector": "button"},
        {"id": "label", "text": "Include a <label> for the email input", "selector": "label"},
        {"id": "container", "text": "Wrap specific content in a section or div", "selector": ".newsletter-wrapper"}
    ]',
    'https://codepen.io/pen/', -- Placeholder
    '<div class="newsletter-wrapper">
    <h2>Subscribe to our Newsletter</h2>
    <p>Get the latest tips and tricks weekly.</p>
    
    <!-- Add your form here -->
    
</div>',
    '.newsletter-wrapper {
    background: white;
    padding: 3rem;
    border-radius: 16px;
    max-width: 500px;
    margin: 2rem auto;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

h2 {
    color: #1f2937;
    margin-bottom: 0.5rem;
}

/* Style your form elements below */
input[type="email"] {
    width: 100%;
    padding: 0.75rem;
    margin: 1rem 0;
    border: 1px solid #d1d5db;
    border-radius: 6px;
}

button {
    background-color: #2563eb;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    width: 100%;
    font-weight: 600;
}

button:hover {
    background-color: #1d4ed8;
}',
    'const form = document.querySelector("form");
if(form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Thanks for subscribing!");
    });
}'
);

-- PROJECT 3: Interactive Photo Gallery
INSERT INTO frontend_projects (title, slug, description, difficulty, tags, requirements, expected_solution_url, starter_html, starter_css, starter_js)
VALUES (
    'Interactive Photo Gallery',
    'interactive-gallery',
    'Build a grid-based photo gallery that is responsive. Implement a simple "lightbox" effect where clicking an image displays the alt text or a larger version using JavaScript.',
    'Hard',
    ARRAY['CSS Grid', 'DOM Manipulation', 'Event Listeners', 'Media Queries'],
    '[
        {"id": "grid", "text": "Use CSS Grid for the layout", "selector": ".gallery-grid"},
        {"id": "images", "text": "Include at least 6 images", "selector": ".gallery-item img", "minCount": 6},
        {"id": "modal", "text": "Create a modal/overlay div (hidden by default)", "selector": "#lightbox"},
        {"id": "click", "text": "Use JS to handle click events on images", "selector": "script:contains(\"addEventListener\")"} 
    ]',
    'https://codepen.io/pen/', -- Placeholder
    '<header>
    <h1>My Photography</h1>
</header>

<main class="gallery-grid">
    <!-- Add your images here with class "gallery-item" -->
    <div class="gallery-item"><img src="https://picsum.photos/400/400?random=1" alt="Mountain View"></div>
    <div class="gallery-item"><img src="https://picsum.photos/400/400?random=2" alt="City Lights"></div>
    <div class="gallery-item"><img src="https://picsum.photos/400/400?random=3" alt="Ocean Waves"></div>
    <div class="gallery-item"><img src="https://picsum.photos/400/400?random=4" alt="Forest Trail"></div>
    <div class="gallery-item"><img src="https://picsum.photos/400/400?random=5" alt="Desert Sun"></div>
    <div class="gallery-item"><img src="https://picsum.photos/400/400?random=6" alt="Starry Night"></div>
</main>

<div id="lightbox" class="hidden">
    <div class="lightbox-content">
        <span class="close">&times;</span>
        <p id="lightbox-text"></p>
    </div>
</div>',
    '.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
    padding: 2rem;
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
}

.gallery-item img:hover {
    transform: scale(1.05);
}

/* Modal Styles */
.hidden { display: none; }

#lightbox {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8);
    display: none; /* JS will toggle Flex/None */
    justify-content: center;
    align-items: center;
}

.lightbox-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    min-width: 300px;
    text-align: center;
}',
    '// Write JS to open the lightbox when an image is clicked
const lightbox = document.getElementById("lightbox");
const lightboxText = document.getElementById("lightbox-text");
const closeBtn = document.querySelector(".close");
const images = document.querySelectorAll(".gallery-item img");

// Add your event listeners here
'
);
