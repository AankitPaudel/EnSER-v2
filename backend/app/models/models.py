from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    department = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    projects = relationship("Project", back_populates="proposer")
    student_applications = relationship("Application", foreign_keys="Application.student_id", back_populates="student")
    professor_applications = relationship("Application", foreign_keys="Application.professor_id", back_populates="professor")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    department = Column(String, nullable=False)
    proposed_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    status = Column(String, default="open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    proposer = relationship("Profile", back_populates="projects")
    applications = relationship("Application", back_populates="project")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    student_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    professor_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"))
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="applications")
    student = relationship("Profile", foreign_keys=[student_id], back_populates="student_applications")
    professor = relationship("Profile", foreign_keys=[professor_id], back_populates="professor_applications")
    syllabus = relationship("Syllabus", back_populates="application", uselist=False)
    submissions = relationship("Submission", back_populates="application")


class Syllabus(Base):
    __tablename__ = "syllabuses"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), unique=True)
    content = Column(Text, nullable=False)
    rubric = Column(Text, nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    application = relationship("Application", back_populates="syllabus")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    file_url = Column(Text, nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    application = relationship("Application", back_populates="submissions")
    grade = relationship("Grade", back_populates="submission", uselist=False)


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), unique=True)
    score = Column(Integer, nullable=False)
    feedback = Column(Text)
    graded_at = Column(DateTime(timezone=True), server_default=func.now())

    submission = relationship("Submission", back_populates="grade")
