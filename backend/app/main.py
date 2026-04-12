from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import projects, applications, syllabus, grades, submissions

app = FastAPI(title="EnSer API", version="2.0.0")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
# Add your Vercel URL here after deployment, e.g.:
# ALLOWED_ORIGINS.append("https://enser-v2.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/projects", tags=["Projects"])
app.include_router(applications.router, prefix="/applications", tags=["Applications"])
app.include_router(syllabus.router, prefix="/syllabus", tags=["Syllabus"])
app.include_router(grades.router, prefix="/grades", tags=["Grades"])
app.include_router(submissions.router, prefix="/submissions", tags=["Submissions"])


@app.get("/")
def root():
    return {"message": "EnSer API v2.0 is running"}
