-- ============================================================
-- EnSer 2.0 — Dynamic Demo Seed
-- Run this in Supabase SQL Editor AFTER creating the 3 demo
-- accounts in Authentication → Users:
--   demo-student@enser.dev   / demo1234
--   demo-professor@enser.dev / demo1234
--   demo-community@enser.dev / demo1234
-- This script finds their UUIDs automatically.
-- ============================================================

DO $$
DECLARE
  v_student   UUID;
  v_professor UUID;
  v_community UUID;
  v_proj1     INT;
  v_proj2     INT;
  v_app1      INT;
  v_app2      INT;
  v_sub1      INT;
BEGIN

  -- ── Get real UUIDs from auth ──────────────────────────────
  SELECT id INTO v_student   FROM auth.users WHERE email = 'demo-student@enser.dev'   LIMIT 1;
  SELECT id INTO v_professor FROM auth.users WHERE email = 'demo-professor@enser.dev' LIMIT 1;
  SELECT id INTO v_community FROM auth.users WHERE email = 'demo-community@enser.dev' LIMIT 1;

  IF v_student IS NULL OR v_professor IS NULL OR v_community IS NULL THEN
    RAISE EXCEPTION 'One or more demo accounts not found in auth.users. Create them in Authentication → Users first.';
  END IF;

  -- ── Profiles ─────────────────────────────────────────────
  INSERT INTO profiles (id, full_name, role, department) VALUES
    (v_student,   'Alex Johnson',             'student',   'Computer Science'),
    (v_professor, 'Dr. Maria Rodriguez',      'professor', 'Computer Science'),
    (v_community, 'City Planning Department', 'community', NULL)
  ON CONFLICT (id) DO UPDATE SET
    full_name  = EXCLUDED.full_name,
    role       = EXCLUDED.role,
    department = EXCLUDED.department;

  -- ── Projects (proposed by community) ─────────────────────
  INSERT INTO projects (title, description, department, proposed_by, status) VALUES
    (
      'Smart Traffic Light Optimization System',
      'Design and implement an AI-driven traffic light system that reduces average wait times by 30% during peak hours. The system should integrate with existing city infrastructure and provide a real-time analytics dashboard.',
      'Computer Science',
      v_community,
      'in_progress'
    )
  RETURNING id INTO v_proj1;

  INSERT INTO projects (title, description, department, proposed_by, status) VALUES
    (
      'Solar-Powered Water Purification Unit',
      'Develop a portable, low-cost water purification system powered by solar panels for rural communities. Must purify at least 200 L/day and be maintainable with locally available tools.',
      'Civil',
      v_community,
      'open'
    )
  RETURNING id INTO v_proj2;

  INSERT INTO projects (title, description, department, proposed_by, status) VALUES
    (
      'Community Bridge Structural Analysis',
      'Perform a full structural integrity assessment of the Main Street pedestrian bridge and propose cost-effective reinforcement solutions including 3D modeling and load simulations.',
      'Civil',
      v_community,
      'open'
    ),
    (
      'Electric Vehicle Charging Network Feasibility',
      'Evaluate feasibility and propose locations for a 10-station EV charging network across downtown. Include cost-benefit analysis, grid impact assessment, and a phased rollout plan.',
      'Electrical',
      v_community,
      'open'
    ),
    (
      'Industrial Waste Heat Recovery System',
      'Design a heat recovery system for the local manufacturing plant that captures waste heat and converts it to usable energy. Target: 15% reduction in total energy consumption.',
      'Mechanical',
      v_community,
      'open'
    );

  -- ── Application 1 — Accepted (with syllabus + submission + grade) ──
  INSERT INTO applications (project_id, student_id, professor_id, status) VALUES
    (v_proj1, v_student, v_professor, 'accepted')
  RETURNING id INTO v_app1;

  INSERT INTO syllabuses (application_id, content, rubric) VALUES
    (
      v_app1,
      E'# Smart Traffic Light Optimization System\n## Student: Alex Johnson\n\n### Learning Objectives\n- Understand traffic flow modeling and optimization algorithms\n- Apply machine learning techniques to real-world urban infrastructure\n- Design and implement embedded systems for IoT applications\n- Develop professional-grade documentation and reporting\n\n### Weekly Milestones\n**Week 1–2:** Literature review and requirements gathering\n- Study existing traffic management systems\n- Interview city traffic engineers\n- Define functional and non-functional requirements\n\n**Week 3–4:** System architecture and design\n- Design overall system architecture\n- Select appropriate ML algorithms (Q-learning, deep RL)\n- Create database schema for traffic data\n\n**Week 5–8:** Core implementation\n- Implement traffic simulation environment\n- Train and validate optimization model\n- Build REST API for real-time control\n\n**Week 9–10:** Dashboard and integration\n- Build analytics dashboard\n- Integrate with city API (mock)\n- End-to-end testing\n\n**Week 11–12:** Documentation and presentation\n- Write technical report\n- Record demo video\n- Final presentation\n\n### Deliverables\n1. Requirements document (Week 2)\n2. Architecture design document (Week 4)\n3. Working prototype with simulation (Week 8)\n4. Final system with dashboard (Week 10)\n5. Technical report + presentation (Week 12)',
      E'# Grading Rubric — Smart Traffic Light Optimization\n\n| Criterion | Weight | Excellent (90–100) | Good (75–89) | Satisfactory (60–74) | Needs Work (<60) |\n|-----------|--------|--------------------|--------------|----------------------|------------------|\n| Technical Implementation | 35% | Fully functional, exceeds requirements, clean code | Mostly functional, minor bugs | Core features work, some bugs | Incomplete |\n| Algorithm Quality | 20% | Novel approach, measurable 30%+ improvement | Standard approach, 15–29% improvement | Basic approach, some improvement | No measurable improvement |\n| Documentation | 20% | Comprehensive, professional-grade | Good coverage, minor gaps | Adequate, missing some sections | Incomplete |\n| Testing & Validation | 15% | Thorough tests, edge cases covered | Good coverage, most cases | Basic tests, happy path only | Minimal testing |\n| Presentation | 10% | Clear, confident, handles Q&A expertly | Good delivery | Adequate | Unclear or unprepared |'
    );

  INSERT INTO submissions (application_id, file_url) VALUES
    (v_app1, 'https://example.com/sample-submission.pdf')
  RETURNING id INTO v_sub1;

  INSERT INTO grades (submission_id, score, feedback) VALUES
    (v_sub1, 87,
     'Excellent work on the ML implementation. The Q-learning approach showed clear results in the simulation. The dashboard is intuitive and well-designed. Suggestions: add more edge case handling in the intersection conflict resolution module, and expand test coverage for the API layer. Overall a strong submission — well done!');

  -- ── Application 2 — Pending (shows professor notification) ──
  INSERT INTO applications (project_id, student_id, professor_id, status) VALUES
    (v_proj2, v_student, v_professor, 'pending')
  RETURNING id INTO v_app2;

  RAISE NOTICE 'Seed complete. Student UUID: %, Professor UUID: %, Community UUID: %', v_student, v_professor, v_community;

END $$;
