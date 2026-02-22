/**
 * Seed Templates — GCET Blog
 *
 * 14 polished, ready-to-use blog post templates.
 *
 * Usage:
 *   npx tsx --require dotenv/config scripts/seed-templates.ts
 */

const templates = [
  // ─── ACADEMIC ────────────────────────────────────────────────
  {
    name: 'Event Coverage',
    description: 'A ready-to-fill report for campus fests, seminars, workshops, and cultural events.',
    category: 'academic',
    contentType: 'event',
    audience: 'all',
    icon: 'calendar',
    suggestedTitle: '[Event Name] — Highlights & Recap',
    suggestedTags: ['gcet', 'event', 'campus-life'],
    content: `<h2>Overview</h2>
<p>The annual <strong>[Event Name]</strong>, organized by <strong>[Department / Club]</strong>, was held on <strong>[Date]</strong> at <strong>[Venue]</strong>. Over <strong>[X]</strong> students, faculty members, and guests attended the day-long programme that combined knowledge sharing with lively student engagement.</p>

<h2>Opening &amp; Inauguration</h2>
<p>The event was inaugurated by <strong>[Chief Guest Name &amp; Designation]</strong>, who addressed the gathering on the importance of <em>[relevant topic]</em>. Welcome remarks were delivered by <strong>[Faculty Coordinator]</strong>.</p>

<h2>Session Highlights</h2>
<h3>Session 1 — <em>[Title]</em></h3>
<p>Presented by <strong>[Speaker]</strong>. The session explored <em>[brief summary — 2-3 sentences covering the core ideas discussed]</em>.</p>

<h3>Session 2 — <em>[Title]</em></h3>
<p>Led by <strong>[Speaker]</strong>. Key takeaway: <em>[one-liner insight or quote]</em>.</p>

<h2>Competitions &amp; Activities</h2>
<ul>
<li><strong>[Competition Name]</strong> — [No. of teams/participants]. Winner: <strong>[Name, Branch]</strong>.</li>
<li><strong>[Workshop / Hands-on]</strong> — [Brief outcome or skill covered].</li>
</ul>

<h2>Photo Gallery</h2>
<p><em>Add event photos here using the image upload button above.</em></p>

<h2>Key Takeaways</h2>
<ol>
<li>[First takeaway that attendees found most valuable]</li>
<li>[Second insight or learning outcome]</li>
<li>[Third point — any future opportunity announced]</li>
</ol>

<h2>Closing Note</h2>
<p>The vote of thanks was proposed by <strong>[Name]</strong>. The event showcased GCET's commitment to fostering holistic development beyond the classroom.</p>

<blockquote><p>"[Include a memorable quote from the chief guest or organizer.]"</p></blockquote>`,
  },

  {
    name: 'Department Spotlight',
    description: 'Showcase a department\'s strengths, achievements, and roadmap in a structured feature.',
    category: 'academic',
    contentType: 'academic',
    audience: 'all',
    icon: 'graduation',
    suggestedTitle: 'Department Spotlight — [Department Name]',
    suggestedTags: ['gcet', 'department', 'spotlight', 'academics'],
    content: `<h2>About the Department</h2>
<p>Established in <strong>[Year]</strong>, the Department of <strong>[Name]</strong> at GCET has grown into one of the college's most dynamic academic units. With <strong>[X]</strong> faculty members and over <strong>[X]</strong> students across four batches, the department blends rigorous academics with hands-on project experience.</p>

<h2>Vision &amp; Mission</h2>
<p><strong>Vision:</strong> <em>[One-sentence departmental vision statement]</em></p>
<p><strong>Mission:</strong> <em>[Brief mission — what the department aims to deliver to students and industry]</em></p>

<h2>Notable Faculty</h2>
<ul>
<li><strong>Dr. [Name]</strong>, HOD — Specializes in [area]. Published [X] papers in international journals.</li>
<li><strong>Prof. [Name]</strong> — Known for [research focus / industry experience]. Recipient of [award, if any].</li>
</ul>

<h2>Student Achievements (2024–25)</h2>
<ul>
<li><strong>[X]</strong> students placed in top MNCs including [Company 1], [Company 2].</li>
<li><strong>[Team/Student Name]</strong> won [Competition Name] at [Event/University].</li>
<li><strong>[X]</strong> research papers presented at national/international conferences.</li>
</ul>

<h2>Labs &amp; Infrastructure</h2>
<p>The department houses <strong>[X]</strong> specialized labs including <strong>[Lab Name 1]</strong> and <strong>[Lab Name 2]</strong>, equipped with <em>[notable software / hardware]</em>.</p>

<h2>What's Ahead</h2>
<p>In the upcoming academic year, the department plans to launch <strong>[new elective / certification / MoU]</strong> and is preparing students for <strong>[specific opportunity — hackathons, placements, research tracks]</strong>.</p>

<h2>By the Numbers</h2>
<ul>
<li><strong>[X]</strong> faculty members (including [X] PhDs)</li>
<li><strong>[X]%</strong> placement rate this year</li>
<li><strong>[X]</strong> active student clubs &amp; chapters</li>
<li><strong>[X]+</strong> industry collaborations</li>
</ul>`,
  },

  {
    name: 'Research Summary',
    description: 'Translate a faculty or student research paper into an accessible blog-friendly format.',
    category: 'academic',
    contentType: 'academic',
    audience: 'all',
    icon: 'book',
    suggestedTitle: 'Research Spotlight — [Paper Title]',
    suggestedTags: ['research', 'academic', 'gcet', 'innovation'],
    content: `<h2>Paper at a Glance</h2>
<p><strong>Title:</strong> [Full Paper Title]</p>
<p><strong>Authors:</strong> [Author 1], [Author 2] — Department of [Name], GCET</p>
<p><strong>Published in:</strong> [Journal / Conference], [Month Year]</p>
<p><strong>DOI:</strong> <a href="#">[Link if available]</a></p>

<h2>The Problem</h2>
<p>In simple terms, this research tackles <em>[describe the real-world problem in 2–3 sentences that any student can understand]</em>. Despite existing approaches like [X], the challenge of [Y] remained largely unsolved.</p>

<h2>The Approach</h2>
<p>The team proposed <strong>[methodology name or technique]</strong> — a novel approach that combines <em>[key technical elements]</em>. The workflow involved:</p>
<ol>
<li><strong>Data collection</strong> — [where and how the dataset was gathered]</li>
<li><strong>Model / Framework</strong> — [core technique used, e.g., CNN, regression, survey design]</li>
<li><strong>Evaluation</strong> — [metrics used: accuracy, F1, user study, etc.]</li>
</ol>

<h2>Key Findings</h2>
<ul>
<li>The proposed method achieved <strong>[X]% improvement</strong> over the baseline.</li>
<li>[Second significant result — in plain language].</li>
<li>[Third finding or unexpected insight].</li>
</ul>

<h2>Why It Matters</h2>
<p>This work has practical implications for <strong>[industry / domain]</strong>. For GCET students, it opens doors to [related project ideas, internship areas, or further study].</p>

<h2>Want to Read More?</h2>
<p>The full paper is available at <a href="#">[link]</a>. For questions, reach out to the authors via the [Department Name] office.</p>`,
  },

  {
    name: 'Placement Story',
    description: 'Feature a placed student\'s complete journey — preparation, rounds, and advice.',
    category: 'academic',
    contentType: 'news',
    audience: 'all',
    icon: 'briefcase',
    suggestedTitle: '[Student Name] — Placed at [Company]',
    suggestedTags: ['placement', 'career', 'interview-experience', 'gcet'],
    content: `<h2>Meet the Candidate</h2>
<p><strong>Name:</strong> [Full Name]</p>
<p><strong>Branch &amp; Batch:</strong> [e.g., CSE — Class of 2026]</p>
<p><strong>Placed at:</strong> [Company Name]</p>
<p><strong>Role:</strong> [Job Title, e.g., Software Engineer]</p>
<p><strong>Package:</strong> [CTC, e.g., ₹8.5 LPA]</p>

<h2>The Preparation Journey</h2>
<p>[Student Name] started preparing in their <strong>[Xth semester / year]</strong>. Their strategy focused on three pillars:</p>
<ol>
<li><strong>Data Structures &amp; Algorithms</strong> — Solved [X]+ problems on [LeetCode / HackerRank / CodeChef]. Focused on [arrays, trees, DP, etc.].</li>
<li><strong>Core Subjects</strong> — Revised [DBMS, OS, CN, OOPs] using [resource — Gate Smashers, GeeksforGeeks, etc.].</li>
<li><strong>Projects &amp; Skills</strong> — Built [Project Name/Type] using [tech stack], which became a key talking point in interviews.</li>
</ol>

<h2>The Interview Experience</h2>
<h3>Round 1 — Online Assessment</h3>
<p>[Format: MCQs + 2 coding questions / aptitude + verbal]. Difficulty: [Easy / Moderate / Hard]. Time: [X minutes].</p>
<p><em>Tip: "[One specific tip about this round]."</em></p>

<h3>Round 2 — Technical Interview</h3>
<p>Duration: ~[X] minutes. Topics covered: [e.g., "They asked me to write a function to detect a cycle in a linked list, then discussed my project architecture"]. The interviewer was [friendly / thorough / focused on problem-solving approach].</p>

<h3>Round 3 — HR Interview</h3>
<p>Questions included: <em>"Tell me about yourself," "Why [Company]?," "Where do you see yourself in 5 years?"</em>. Keep it genuine — they're checking for culture fit, not textbook answers.</p>

<h2>Advice for Juniors</h2>
<ol>
<li><strong>Start early</strong> — Don't wait until placement season. Build consistency from 3rd year.</li>
<li><strong>Focus on fundamentals</strong> — Fancy frameworks don't matter if your DSA is weak.</li>
<li><strong>Mock interviews help</strong> — Practice with friends or platforms like Pramp / InterviewBit.</li>
<li><strong>Stay calm on the day</strong> — You've prepared. Trust the process.</li>
</ol>

<blockquote><p>"[A genuine, motivational quote from the student — something they'd actually say.]"</p></blockquote>`,
  },

  // ─── GENERAL ─────────────────────────────────────────────────
  {
    name: 'How-To Guide',
    description: 'Step-by-step tutorial for any technical topic — clear, structured, and beginner-friendly.',
    category: 'general',
    contentType: 'tutorial',
    audience: 'all',
    icon: 'lightbulb',
    suggestedTitle: 'How to [Do Something] — A Step-by-Step Guide',
    suggestedTags: ['tutorial', 'guide', 'how-to'],
    content: `<h2>What You'll Learn</h2>
<p>By the end of this guide, you'll be able to <strong>[specific outcome, e.g., "deploy a React app to Vercel" or "set up a virtual environment in Python"]</strong>. No advanced knowledge required — just [basic prerequisite].</p>

<h2>Prerequisites</h2>
<ul>
<li>[Tool / Language] version [X] or newer installed on your machine</li>
<li>Basic familiarity with [topic, e.g., "the command line" or "HTML/CSS"]</li>
<li>A free account on [platform, if applicable]</li>
</ul>

<h2>Step 1 — Setting Up</h2>
<p>[Clear instructions for the first step. Include the exact command if applicable.]</p>
<p>Once done, you should see <em>[expected outcome — e.g., "a new project folder with the following structure"]</em>.</p>

<h2>Step 2 — Building the Core</h2>
<p>[Walk through the main implementation. Break complex logic into small paragraphs. Use bold for file names and code terms.]</p>

<h2>Step 3 — Testing It Out</h2>
<p>Run the following to verify everything works:</p>
<p><em>[Describe the expected output or behavior so the reader knows they're on track.]</em></p>

<h2>Step 4 — Polish &amp; Deploy (Optional)</h2>
<p>[Suggest improvements: styling, environment variables, deployment. Keep it brief — just enough to point the reader in the right direction.]</p>

<h2>Troubleshooting</h2>
<ul>
<li><strong>"[Error message]"</strong> → [Fix: explanation + command]</li>
<li><strong>"[Another common issue]"</strong> → [Fix]</li>
</ul>

<h2>Wrap-Up</h2>
<p>You've successfully [what they accomplished]. From here, you could explore [related topic 1] or [related topic 2]. If you run into issues, drop a comment below.</p>`,
  },

  {
    name: 'Opinion Piece',
    description: 'A well-structured editorial or opinion article with balanced arguments.',
    category: 'general',
    contentType: 'literary',
    audience: 'all',
    icon: 'megaphone',
    suggestedTitle: '[Your Stance] — Why [Topic] Matters for Students Today',
    suggestedTags: ['opinion', 'editorial', 'perspective'],
    content: `<h2>The Hook</h2>
<p>[Open with a striking fact, a question, or a brief anecdote that immediately pulls the reader in. One paragraph — make every word count.]</p>

<h2>The Argument</h2>
<p><strong>Here's what I believe:</strong> <em>[State your thesis clearly in one or two sentences. This is the core claim the rest of the piece supports.]</em></p>

<h3>Point 1 — [Subheading]</h3>
<p>[Present your first supporting argument. Use data, examples, or personal experience to make it concrete. Avoid vague generalizations.]</p>

<h3>Point 2 — [Subheading]</h3>
<p>[Second supporting argument. Each point should build on the previous one, creating a logical chain.]</p>

<h3>Point 3 — [Subheading]</h3>
<p>[Third argument — this is often the most personal or forward-looking one.]</p>

<h2>The Other Side</h2>
<p>Some might argue that <em>[counter-argument]</em>. That's a fair point — but it overlooks <em>[your rebuttal, stated respectfully]</em>.</p>

<h2>So What Now?</h2>
<p>[Close with a call to action or a thought-provoking final statement. What should the reader think, feel, or do after reading this?]</p>

<blockquote><p>"[End with a quote — either your own or from someone relevant — that reinforces the message.]"</p></blockquote>`,
  },

  {
    name: 'Listicle',
    description: 'A numbered "Top N" post — engaging, scannable, and easy to write.',
    category: 'general',
    contentType: 'media',
    audience: 'all',
    icon: 'list',
    suggestedTitle: '[Number] [Things] Every [Audience] Should Know About [Topic]',
    suggestedTags: ['listicle', 'top-picks', 'resources'],
    content: `<h2>Why This List?</h2>
<p>[1–2 sentences setting context. Why did you put this list together? Who will benefit from it?]</p>

<h2>1. [Item Name]</h2>
<p>[2–3 sentences explaining why this item is on the list. Be specific — link to a resource if possible.]</p>

<h2>2. [Item Name]</h2>
<p>[Description. Each entry should offer standalone value — the reader might only read one or two.]</p>

<h2>3. [Item Name]</h2>
<p>[Description.]</p>

<h2>4. [Item Name]</h2>
<p>[Description.]</p>

<h2>5. [Item Name]</h2>
<p>[Description.]</p>

<h2>6. [Item Name]</h2>
<p>[Description.]</p>

<h2>7. [Item Name]</h2>
<p>[Description.]</p>

<h2>Over to You</h2>
<p>Did we miss something? Share your picks in the comments — we might feature them in a future update.</p>`,
  },

  {
    name: 'Project Showcase',
    description: 'Present a student project professionally — problem, stack, features, and learnings.',
    category: 'general',
    contentType: 'tutorial',
    audience: 'contributor_only',
    icon: 'code',
    suggestedTitle: 'Project Showcase — [Project Name]',
    suggestedTags: ['project', 'showcase', 'development'],
    content: `<h2>The Project</h2>
<p><strong>[Project Name]</strong> is a [type — web app / mobile app / ML model / IoT system] built by <strong>[Team Member 1, Team Member 2, ...]</strong> during [course / hackathon / self-driven]. It solves the problem of <em>[one-line problem statement]</em>.</p>
<p><strong>Live Demo:</strong> <a href="#">[URL]</a> &nbsp; | &nbsp; <strong>Source Code:</strong> <a href="#">[GitHub Link]</a></p>

<h2>The Problem</h2>
<p>[Explain the problem in 3–4 sentences. Why does it matter? Who faces it? What's missing from existing solutions?]</p>

<h2>Tech Stack</h2>
<ul>
<li><strong>Frontend:</strong> [React / Next.js / Flutter / etc.]</li>
<li><strong>Backend:</strong> [Node.js / Django / Spring Boot / etc.]</li>
<li><strong>Database:</strong> [MongoDB / PostgreSQL / Firebase / etc.]</li>
<li><strong>Other:</strong> [Cloud services, APIs, ML libraries, etc.]</li>
</ul>

<h2>How It Works</h2>
<p>[Describe the user flow or architecture in plain language. A short paragraph or a numbered sequence works well here.]</p>

<h2>Key Features</h2>
<ol>
<li><strong>[Feature 1]</strong> — [What it does and why it's useful]</li>
<li><strong>[Feature 2]</strong> — [Description]</li>
<li><strong>[Feature 3]</strong> — [Description]</li>
</ol>

<h2>Screenshots</h2>
<p><em>Upload screenshots here using the image button above.</em></p>

<h2>Challenges &amp; What We Learned</h2>
<p>The biggest challenge was <strong>[specific challenge]</strong>. We overcame it by <em>[approach / tool / technique]</em>. Looking back, we'd do <strong>[thing]</strong> differently.</p>

<h2>What's Next</h2>
<ul>
<li>[Planned feature or improvement 1]</li>
<li>[Planned feature or improvement 2]</li>
</ul>`,
  },

  {
    name: 'Book / Course Review',
    description: 'An honest, structured review of any learning resource — book, course, or tool.',
    category: 'general',
    contentType: 'literary',
    audience: 'contributor_only',
    icon: 'book',
    suggestedTitle: 'Review — [Book / Course Title] by [Author]',
    suggestedTags: ['review', 'learning', 'resources'],
    content: `<h2>At a Glance</h2>
<p><strong>Title:</strong> [Book / Course Name]</p>
<p><strong>Author / Instructor:</strong> [Name]</p>
<p><strong>Platform:</strong> [Udemy / Coursera / Publisher / YouTube / etc.]</p>
<p><strong>My Rating:</strong> [X] / 5</p>
<p><strong>Best For:</strong> [Target audience — e.g., "Beginners in web development" or "Final-year students preparing for ML interviews"]</p>

<h2>What It Covers</h2>
<p>[Summarize the content in 3–4 sentences. What topics are covered? How is the material structured? Theory-heavy or project-based?]</p>

<h2>What I Liked</h2>
<ul>
<li><strong>[Pro 1]</strong> — [Brief explanation of why this stood out]</li>
<li><strong>[Pro 2]</strong> — [e.g., "The real-world examples made abstract concepts click"]</li>
<li><strong>[Pro 3]</strong> — [e.g., "Great community support / exercises / production-grade code"]</li>
</ul>

<h2>What Could Be Better</h2>
<ul>
<li><strong>[Con 1]</strong> — [Honest but constructive: e.g., "The pacing in Section 3 felt rushed"]</li>
<li><strong>[Con 2]</strong> — [e.g., "Some code samples use outdated syntax"]</li>
</ul>

<h2>My Key Takeaways</h2>
<ol>
<li>[The single most important thing you learned]</li>
<li>[A concept or technique you've already applied]</li>
<li>[Something that changed how you think about the subject]</li>
</ol>

<h2>Final Verdict</h2>
<p>[2–3 sentences: Would you recommend it? To whom? Is it worth the price/time?]</p>`,
  },

  // ─── NEWS ────────────────────────────────────────────────────
  {
    name: 'Official Announcement',
    description: 'Formal college announcement with clear structure — details, dates, and contact info.',
    category: 'news',
    contentType: 'news',
    audience: 'editor_only',
    icon: 'megaphone',
    suggestedTitle: 'GCET Notice — [Subject]',
    suggestedTags: ['announcement', 'gcet', 'official', 'notice'],
    content: `<h2>Notice</h2>
<p><strong>Date:</strong> [DD Month YYYY]</p>
<p><strong>Issued by:</strong> [Department / Office / Authority Name]</p>
<p><strong>Subject:</strong> [Clear, one-line subject]</p>

<h2>Details</h2>
<p>[Provide the full details of the announcement. What is happening, why, and how it affects students and faculty. Keep it factual and direct — 2–3 paragraphs at most.]</p>

<h2>Important Dates</h2>
<ul>
<li><strong>[DD Mon]</strong> — [Deadline / Event 1]</li>
<li><strong>[DD Mon]</strong> — [Deadline / Event 2]</li>
<li><strong>[DD Mon]</strong> — [Deadline / Event 3]</li>
</ul>

<h2>What You Need to Do</h2>
<ol>
<li>[First action step — e.g., "Fill the registration form at [link] before [date]."]</li>
<li>[Second step, if applicable]</li>
<li>[Third step, if applicable]</li>
</ol>

<h2>Contact</h2>
<p>For queries, reach out to:</p>
<ul>
<li><strong>[Name]</strong> — [Email / Phone]</li>
<li><strong>[Office Name]</strong> — [Location], [Working Hours]</li>
</ul>`,
  },

  // ─── EDITORIAL ───────────────────────────────────────────────
  {
    name: 'Interview Feature',
    description: 'A polished Q&A format for featuring faculty, alumni, achievers, or guests.',
    category: 'editorial',
    contentType: 'literary',
    audience: 'editor_only',
    icon: 'users',
    suggestedTitle: 'In Conversation with [Name] — [Role / Title]',
    suggestedTags: ['interview', 'feature', 'people', 'gcet'],
    content: `<h2>About [Name]</h2>
<p><strong>[Full Name]</strong> is [one sentence bio — their role, what they're known for, and their connection to GCET]. [Optional second sentence adding a personal or lesser-known detail.]</p>

<p><em>Upload a portrait photo of the interviewee here.</em></p>

<h2>The Conversation</h2>

<p><strong>Q: To start off — how would you describe your journey to where you are today?</strong></p>
<p>[Answer — 3–5 sentences. Keep it conversational, not formal.]</p>

<p><strong>Q: What's one experience at GCET that shaped you the most?</strong></p>
<p>[Answer]</p>

<p><strong>Q: [Question specific to their field or achievement]</strong></p>
<p>[Answer]</p>

<p><strong>Q: What advice would you give to current students?</strong></p>
<p>[Answer — this is often the most-read part. Make it genuine.]</p>

<p><strong>Q: Anything you're currently working on that excites you?</strong></p>
<p>[Answer]</p>

<h2>Rapid Fire</h2>
<ul>
<li><strong>Favourite book:</strong> [Answer]</li>
<li><strong>Go-to productivity tool:</strong> [Answer]</li>
<li><strong>One skill every student should learn:</strong> [Answer]</li>
</ul>

<blockquote><p>"[Pull the most memorable or quotable line from the interview here.]"</p></blockquote>`,
  },

  {
    name: 'Semester Roundup',
    description: 'End-of-semester editorial summarizing events, achievements, milestones, and what\'s next.',
    category: 'editorial',
    contentType: 'news',
    audience: 'editor_only',
    icon: 'trophy',
    suggestedTitle: '[Semester] Roundup — Looking Back at [Period]',
    suggestedTags: ['roundup', 'semester', 'gcet', 'recap'],
    content: `<h2>Semester at a Glance</h2>
<p>The <strong>[Odd / Even Semester, YYYY]</strong> was a defining chapter for GCET. From [highlight 1] to [highlight 2], the campus was busier — and more accomplished — than ever. Here's a look back at what made this semester stand out.</p>

<h2>Timeline</h2>
<ul>
<li><strong>[Month]</strong> — [Event / Milestone 1]: [one-sentence summary]</li>
<li><strong>[Month]</strong> — [Event / Milestone 2]: [summary]</li>
<li><strong>[Month]</strong> — [Event / Milestone 3]: [summary]</li>
<li><strong>[Month]</strong> — [Event / Milestone 4]: [summary]</li>
</ul>

<h2>Top Achievements</h2>
<ol>
<li><strong>[Achievement 1]</strong> — [Who, what, where. Keep it tight.]</li>
<li><strong>[Achievement 2]</strong> — [Details]</li>
<li><strong>[Achievement 3]</strong> — [Details]</li>
</ol>

<h2>By the Numbers</h2>
<ul>
<li><strong>[X]</strong> campus events organized</li>
<li><strong>[X]</strong> students placed across [Y] companies</li>
<li><strong>[X]</strong> articles published on GCET Blog</li>
<li><strong>[X]</strong> new student clubs or chapters launched</li>
</ul>

<h2>Looking Ahead</h2>
<p>Next semester promises [upcoming event / initiative / change]. The editorial team is excited to cover [specific upcoming feature or story]. Stay tuned.</p>

<blockquote><p>"[A closing thought from the editorial team or a quote from the Dean / Principal.]"</p></blockquote>`,
  },

  // ─── EXTRA ────────────────────────────────────────────────────
  {
    name: 'Club Spotlight',
    description: 'Feature a campus club or society — their mission, best events, and how to get involved.',
    category: 'academic',
    contentType: 'event',
    audience: 'all',
    icon: 'star',
    suggestedTitle: 'Club Spotlight — [Club Name]',
    suggestedTags: ['club', 'student-life', 'gcet', 'community'],
    content: `<h2>What Is [Club Name]?</h2>
<p><strong>[Club Name]</strong> is GCET's [type — technical / cultural / literary / social] student organization, founded in <strong>[Year]</strong> under the Department of <strong>[Name or "Student Affairs"]</strong>. Currently led by <strong>[President Name, Branch, Year]</strong>, the club has <strong>[X]</strong> active members across all branches.</p>

<h2>Mission</h2>
<p><em>[One or two sentences — what does the club aim to do for its members and the campus?]</em></p>

<h2>Flagship Events</h2>
<ul>
<li><strong>[Event 1]</strong> — [What it is, when it happens, what makes it special]. Past editions saw [X] participants.</li>
<li><strong>[Event 2]</strong> — [Description]</li>
<li><strong>[Event 3]</strong> — [Description]</li>
</ul>

<h2>Highlights &amp; Wins</h2>
<p>[Club Name] has achieved [specific milestones — inter-college wins, partnerships, content produced, community impact]. In [Year], they [notable achievement].</p>

<h2>What Members Say</h2>
<blockquote><p>"[Genuine testimonial from an active member — keep it natural.]" — <strong>[Name, Branch, Year]</strong></p></blockquote>

<h2>How to Join</h2>
<p>The club accepts new members [every semester / during orientation / through auditions]. To get involved:</p>
<ol>
<li>Follow <strong>[@handle]</strong> on Instagram for announcements.</li>
<li>Attend the next open meeting on <strong>[date / "TBA next semester"]</strong>.</li>
<li>Speak to any current member or reach out at <strong>[email / contact]</strong>.</li>
</ol>`,
  },

  {
    name: 'Tech News Digest',
    description: 'Weekly curated tech news roundup — global stories with a GCET student lens.',
    category: 'news',
    contentType: 'news',
    audience: 'all',
    icon: 'code',
    suggestedTitle: 'Tech Digest — Week of [Date]',
    suggestedTags: ['tech-news', 'weekly', 'digest', 'industry'],
    content: `<h2>This Week in Tech</h2>
<p>A curated roundup of the most relevant tech stories this week — with context for why GCET students should care.</p>

<h3>1. [Headline]</h3>
<p><strong>Source:</strong> <a href="#">[Publication]</a></p>
<p>[3–4 sentence summary of the story. Focus on what happened and why it matters. Avoid copy-pasting — rewrite in your voice.]</p>

<h3>2. [Headline]</h3>
<p><strong>Source:</strong> <a href="#">[Publication]</a></p>
<p>[Summary]</p>

<h3>3. [Headline]</h3>
<p><strong>Source:</strong> <a href="#">[Publication]</a></p>
<p>[Summary]</p>

<h2>GCET Angle</h2>
<p>[Connect the dots: Is any campus lab working on related tech? Are there upcoming events, courses, or opportunities tied to these stories? This is what makes the digest unique to GCET.]</p>

<h2>One Thing to Try This Week</h2>
<p>[A micro-challenge or recommendation: e.g., "Try building a simple API using [tool] — it's directly related to Story #1. Here's a starter tutorial: [link]."]</p>`,
  },
]

// ── Seed Script Logic ───────────────────────────────────────────

async function seed() {
  const { getPayload } = await import('payload')
  const configPromise = (await import('../src/payload.config')).default

  const payload = await getPayload({ config: configPromise })

  console.log('\n🌱 Seeding templates...\n')

  let created = 0
  let skipped = 0

  for (const tpl of templates) {
    const existing = await payload.find({
      collection: 'templates',
      where: { name: { equals: tpl.name } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      // Update existing template content
      await payload.update({
        collection: 'templates',
        id: existing.docs[0].id,
        data: {
          ...tpl,
          status: 'published',
        } as any,
      })
      console.log(`  🔄 Updated: ${tpl.name}`)
      skipped++
      continue
    }

    await payload.create({
      collection: 'templates',
      data: {
        ...tpl,
        status: 'published',
        usageCount: 0,
      } as any,
    })

    console.log(`  ✅ Created: ${tpl.name}`)
    created++
  }

  console.log(`\n🎉 Done! ${created} created, ${skipped} updated.\n`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
