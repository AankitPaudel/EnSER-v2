from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.database import get_db
from app.services.openai_service import generate_syllabus_and_rubric
from app import models, schemas

router = APIRouter()


@router.post("/", response_model=schemas.ApplicationOut)
def apply_to_project(application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(models.Application)
        .filter(
            models.Application.project_id == application.project_id,
            models.Application.student_id == application.student_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this project")

    db_app = models.Application(**application.model_dump())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app


@router.get("/student/{student_id}", response_model=List[schemas.ApplicationOut])
def get_student_applications(student_id: UUID, db: Session = Depends(get_db)):
    return (
        db.query(models.Application)
        .filter(models.Application.student_id == student_id)
        .order_by(models.Application.created_at.desc())
        .all()
    )


@router.get("/professor/{professor_id}", response_model=List[schemas.ApplicationOut])
def get_professor_applications(professor_id: UUID, db: Session = Depends(get_db)):
    return (
        db.query(models.Application)
        .filter(models.Application.professor_id == professor_id)
        .order_by(models.Application.created_at.desc())
        .all()
    )


@router.patch("/{application_id}/accept")
def accept_application(
    application_id: int,
    db: Session = Depends(get_db),
    x_openai_key: Optional[str] = Header(default=None),
):
    app_record = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    app_record.status = "accepted"
    db.commit()

    project = db.query(models.Project).filter(models.Project.id == app_record.project_id).first()
    student = db.query(models.Profile).filter(models.Profile.id == app_record.student_id).first()

    result = generate_syllabus_and_rubric(
        project_title=project.title,
        project_description=project.description,
        student_name=student.full_name,
        user_api_key=x_openai_key,
    )

    syllabus = models.Syllabus(
        application_id=application_id,
        content=result["syllabus"],
        rubric=result["rubric"],
    )
    db.add(syllabus)
    db.commit()
    db.refresh(syllabus)

    return {
        "message": "Application accepted and syllabus generated",
        "syllabus_id": syllabus.id,
    }


@router.patch("/{application_id}/reject")
def reject_application(application_id: int, db: Session = Depends(get_db)):
    app_record = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
    app_record.status = "rejected"
    db.commit()
    return {"message": "Application rejected"}
