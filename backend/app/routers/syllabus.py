from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.get("/{syllabus_id}", response_model=schemas.SyllabusOut)
def get_syllabus(syllabus_id: int, db: Session = Depends(get_db)):
    syllabus = db.query(models.Syllabus).filter(models.Syllabus.id == syllabus_id).first()
    if not syllabus:
        raise HTTPException(status_code=404, detail="Syllabus not found")
    return syllabus


@router.get("/application/{application_id}", response_model=schemas.SyllabusOut)
def get_syllabus_by_application(application_id: int, db: Session = Depends(get_db)):
    syllabus = (
        db.query(models.Syllabus)
        .filter(models.Syllabus.application_id == application_id)
        .first()
    )
    if not syllabus:
        raise HTTPException(status_code=404, detail="Syllabus not found for this application")
    return syllabus
