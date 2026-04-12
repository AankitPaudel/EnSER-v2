from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.post("/", response_model=schemas.GradeOut)
def assign_grade(grade: schemas.GradeCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Grade).filter(models.Grade.submission_id == grade.submission_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="This submission is already graded")

    db_grade = models.Grade(**grade.model_dump())
    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)
    return db_grade


@router.get("/submission/{submission_id}", response_model=schemas.GradeOut)
def get_grade(submission_id: int, db: Session = Depends(get_db)):
    grade = db.query(models.Grade).filter(models.Grade.submission_id == submission_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    return grade


@router.patch("/{grade_id}")
def update_grade(grade_id: int, grade: schemas.GradeCreate, db: Session = Depends(get_db)):
    db_grade = db.query(models.Grade).filter(models.Grade.id == grade_id).first()
    if not db_grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    db_grade.score = grade.score
    db_grade.feedback = grade.feedback
    db.commit()
    db.refresh(db_grade)
    return db_grade
