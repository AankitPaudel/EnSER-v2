-- ============================================================
-- EnSer 2.0 — Demo Seed Data
-- Run AFTER schema.sql and AFTER creating demo accounts in
-- Supabase Auth (see instructions below)
-- ============================================================

-- STEP 1: Create these 3 users in Supabase Auth dashboard
-- (Authentication → Users → Invite user or use the SQL below)
-- Email: demo-student@enser.dev   Password: demo1234
-- Email: demo-professor@enser.dev Password: demo1234
-- Email: demo-community@enser.dev Password: demo1234

-- STEP 2: Run this SQL to insert their profiles.
-- Replace the UUIDs below with the actual UUIDs from auth.users after creating accounts.

-- You can find the UUIDs with: SELECT id, email FROM auth.users;

-- Insert demo profiles (replace UUIDs with real ones from auth.users)
INSERT INTO profiles (id, full_name, role, department) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alex Johnson', 'student', 'Computer Science'),
  ('00000000-0000-0000-0000-000000000002', 'Dr. Maria Rodriguez', 'professor', 'Computer Science'),
  ('00000000-0000-0000-0000-000000000003', 'City Planning Department', 'community', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert 5 sample projects
INSERT INTO projects (title, description, department, proposed_by, status) VALUES
  (
    'Smart Traffic Light Optimization System',
    'Design and implement an AI-driven traffic light system that reduces average wait times by 30% during peak hours. The system should integrate with existing city infrastructure and provide real-time analytics dashboard.',
    'Computer Science',
    '00000000-0000-0000-0000-000000000003',
    'in_progress'
  ),
  (
    'Solar-Powered Water Purification Unit',
    'Develop a portable, low-cost water purification system powered by solar panels for rural communities. Must be maintainable with locally available tools and purify at least 200L/day.',
    'Civil',
    '00000000-0000-0000-0000-000000000003',
    'open'
  ),
  (
    'Community Bridge Structural Analysis',
    'Perform a full structural integrity assessment of the Main Street pedestrian bridge and propose cost-effective reinforcement solutions. Include 3D modeling and load simulations.',
    'Civil',
    '00000000-0000-0000-0000-000000000003',
    'open'
  ),
  (
    'Electric Vehicle Charging Network Feasibility',
    'Evaluate feasibility and propose locations for a 10-station EV charging network across downtown. Include cost-benefit analysis, grid impact assessment, and a phased rollout plan.',
    'Electrical',
    '00000000-0000-0000-0000-000000000003',
    'open'
  ),
  (
    'Industrial Waste Heat Recovery System',
    'Design a heat recovery system for the local manufacturing plant that captures waste heat and converts it to usable energy. Target: 15% reduction in total energy consumption.',
    'Mechanical',
    '00000000-0000-0000-0000-000000000003',
    'open'
  );

-- Insert 1 accepted application (links student → project 1 → professor)
INSERT INTO applications (project_id, student_id, professor_id, status) VALUES
  (1, '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'accepted');

-- Insert AI-generated syllabus for application 1
INSERT INTO syllabuses (application_id, content, rubric) VALUES
  (
    1,
    E'# Smart Traffic Light Optimization System\n## Student: Alex Johnson\n\n### Learning Objectives\n- Understand traffic flow modeling and optimization algorithms\n- Apply machine learning techniques to real-world urban infrastructure\n- Design and implement embedded systems for IoT applications\n- Develop professional-grade documentation and reporting\n\n### Weekly Milestones\n**Week 1-2:** Literature review and requirements gathering\n- Study existing traffic management systems\n- Interview city traffic engineers\n- Define functional and non-functional requirements\n\n**Week 3-4:** System architecture and design\n- Design overall system architecture\n- Select appropriate ML algorithms (Q-learning, deep RL)\n- Create database schema for traffic data\n\n**Week 5-8:** Core implementation\n- Implement traffic simulation environment\n- Train and validate optimization model\n- Build REST API for real-time control\n\n**Week 9-10:** Dashboard and integration\n- Build analytics dashboard\n- Integrate with city API (mock)\n- End-to-end testing\n\n**Week 11-12:** Documentation and presentation\n- Write technical report\n- Record demo video\n- Final presentation\n\n### Deliverables\n1. Requirements document (Week 2)\n2. Architecture design document (Week 4)\n3. Working prototype with simulation (Week 8)\n4. Final system with dashboard (Week 10)\n5. Technical report + presentation (Week 12)',
    E'# Grading Rubric — Smart Traffic Light Optimization\n\n| Criterion | Weight | Excellent (90-100) | Good (75-89) | Satisfactory (60-74) | Needs Work (<60) |\n|-----------|--------|--------------------|--------------|----------------------|------------------|\n| Technical Implementation | 35% | Fully functional system, exceeds requirements, clean code | Mostly functional, minor bugs, good structure | Core features work, some bugs, adequate structure | Incomplete or non-functional |\n| Algorithm Quality | 20% | Novel approach, measurable 30%+ improvement | Standard approach, 15-29% improvement | Basic approach, some improvement shown | No measurable improvement |\n| Documentation | 20% | Comprehensive, professional-grade, well-formatted | Good coverage, minor gaps | Adequate, missing some sections | Incomplete or hard to follow |\n| Testing & Validation | 15% | Thorough tests, edge cases covered, benchmarks | Good test coverage, most cases covered | Basic tests, happy path only | Minimal or no testing |\n| Presentation | 10% | Clear, confident, handles Q&A expertly | Good delivery, minor uncertainties | Adequate, some preparation gaps | Unclear or unprepared |'
  );

-- Insert 1 sample submission
INSERT INTO submissions (application_id, file_url) VALUES
  (1, 'https://example.com/sample-submission.pdf');

-- Insert 1 sample grade
INSERT INTO grades (submission_id, score, feedback) VALUES
  (1, 87, 'Excellent work on the ML implementation. The Q-learning approach showed clear results in the simulation. The dashboard is intuitive and well-designed. Suggestions for improvement: add more edge case handling in the intersection conflict resolution module, and expand the test coverage for the API layer. Overall a strong submission — well done!');
