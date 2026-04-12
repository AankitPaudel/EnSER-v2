from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.post("/", response_model=schemas.SubmissionOut)
def create_submission(submission: schemas.SubmissionCreate, db: Session = Depends(get_db)):
    db_submission = models.Submission(**submission.model_dump())
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission


@router.get("/application/{application_id}", response_model=List[schemas.SubmissionOut])
def get_submissions(application_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Submission)
        .filter(models.Submission.application_id == application_id)
        .order_by(models.Submission.submitted_at.desc())
        .all()
    )
