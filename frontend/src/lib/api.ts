import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})

// ── Projects ──────────────────────────────────────────────────────────────────
export const getProjects = (department?: string) =>
  api.get('/projects', { params: department ? { department } : {} })

export const getProject = (id: number) => api.get(`/projects/${id}`)

export const createProject = (data: {
  title: string
  description: string
  department: string
  proposed_by: string
}) => api.post('/projects', data)

// ── Applications ──────────────────────────────────────────────────────────────
export const applyToProject = (data: {
  project_id: number
  student_id: string
  professor_id: string
}) => api.post('/applications', data)

export const getStudentApplications = (studentId: string) =>
  api.get(`/applications/student/${studentId}`)

export const getProfessorApplications = (professorId: string) =>
  api.get(`/applications/professor/${professorId}`)

export const acceptApplication = (id: number) =>
  api.patch(`/applications/${id}/accept`)

export const rejectApplication = (id: number) =>
  api.patch(`/applications/${id}/reject`)

// ── Syllabus ──────────────────────────────────────────────────────────────────
export const getSyllabus = (id: number) => api.get(`/syllabus/${id}`)

export const getSyllabusByApplication = (applicationId: number) =>
  api.get(`/syllabus/application/${applicationId}`)

// ── Submissions ───────────────────────────────────────────────────────────────
export const createSubmission = (data: { application_id: number; file_url: string }) =>
  api.post('/submissions', data)

export const getSubmissions = (applicationId: number) =>
  api.get(`/submissions/application/${applicationId}`)

// ── Grades ────────────────────────────────────────────────────────────────────
export const assignGrade = (data: {
  submission_id: number
  score: number
  feedback?: string
}) => api.post('/grades', data)

export const getGrade = (submissionId: number) =>
  api.get(`/grades/submission/${submissionId}`)

export default api
