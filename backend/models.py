from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

DependencyType = Literal['FS', 'SS', 'FF', 'SF']
EntityType = Literal['phase', 'sprint', 'story', 'milestone']
TimeUnit = Literal['days', 'hours']

class Dependency(BaseModel):
    id: str
    targetTaskId: str
    type: DependencyType = 'FS'
    lag: Optional[int] = 0

class TaskBaseline(BaseModel):
    startDate: str
    endDate: str
    duration: int

class Task(BaseModel):
    id: str
    name: str
    type: EntityType = 'story'
    phaseId: Optional[str] = None
    startDate: str
    duration: int
    endDate: str
    progress: int = 0
    dependencies: List[Dependency] = Field(default_factory=list)
    color: Optional[str] = None
    assignee: Optional[str] = None
    notes: Optional[str] = None
    isMilestone: Optional[bool] = False
    isCritical: Optional[bool] = False
    baseline: Optional[TaskBaseline] = None

class CalendarConfig(BaseModel):
    includeWeekends: bool = False
    saturdayIsWorkday: bool = False
    holidays: List[str] = Field(default_factory=list)
    workHoursPerDay: int = 8

class Project(BaseModel):
    id: str
    name: str
    clientName: Optional[str] = None
    description: Optional[str] = None
    targetDate: Optional[str] = None
    timeUnit: TimeUnit = 'days'
    calendar: CalendarConfig = Field(default_factory=CalendarConfig)
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().strftime('%Y-%m-%d'))
    updatedAt: str = Field(default_factory=lambda: datetime.utcnow().strftime('%Y-%m-%d'))
    tasks: List[Task] = Field(default_factory=list)

class ProjectSummary(BaseModel):
    id: str
    name: str
    clientName: Optional[str] = None
    description: Optional[str] = None
    targetDate: Optional[str] = None
    updatedAt: str
    taskCount: int
