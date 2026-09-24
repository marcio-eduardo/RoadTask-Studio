from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

DependencyType = Literal['FS', 'SS', 'FF', 'SF']
EntityType = Literal['epic', 'phase', 'sprint', 'story', 'milestone']
TimeUnit = Literal['hours', 'days', 'weeks', 'months']

class Dependency(BaseModel):
    model_config = ConfigDict(extra='allow')
    id: str
    targetTaskId: str
    type: DependencyType = 'FS'
    lag: Optional[int] = 0

class TaskBaseline(BaseModel):
    model_config = ConfigDict(extra='allow')
    startDate: str
    endDate: str
    duration: int

class Task(BaseModel):
    model_config = ConfigDict(extra='allow')
    id: str
    name: str
    type: EntityType = 'story'
    phaseId: Optional[str] = None
    epicId: Optional[str] = None
    sprintId: Optional[str] = None
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
    status: Optional[str] = None
    health: Optional[str] = None
    subtasks: Optional[List[Dict[str, Any]]] = None
    checklist: Optional[List[Dict[str, Any]]] = None
    updates: Optional[List[Dict[str, Any]]] = None
    actualStartDate: Optional[str] = None
    actualEndDate: Optional[str] = None
    lastUpdateNote: Optional[str] = None
    earlyStart: Optional[str] = None
    earlyFinish: Optional[str] = None
    lateStart: Optional[str] = None
    lateFinish: Optional[str] = None
    totalFloat: Optional[int] = None
    baseline: Optional[TaskBaseline] = None

class CalendarConfig(BaseModel):
    model_config = ConfigDict(extra='allow')
    includeWeekends: bool = False
    saturdayIsWorkday: bool = False
    holidays: List[str] = Field(default_factory=list)
    workHoursPerDay: int = 8

class Project(BaseModel):
    model_config = ConfigDict(extra='allow')
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
    model_config = ConfigDict(extra='allow')
    id: str
    name: str
    clientName: Optional[str] = None
    description: Optional[str] = None
    targetDate: Optional[str] = None
    updatedAt: str
    taskCount: int
