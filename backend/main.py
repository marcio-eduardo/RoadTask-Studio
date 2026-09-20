from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from models import Project, ProjectSummary
from database import db_adapter

app = FastAPI(
    title="RoadTask Studio API",
    description="Executive Gantt & Timeline Project Management Backend",
    version="1.0.0",
)

# Configure CORS for local dev and Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    db_status = await db_adapter.ping()
    return {
        "status": "healthy",
        "service": "RoadTask Studio Backend",
        "database": db_status
    }

@app.get("/api/projects", response_model=List[ProjectSummary])
async def list_projects():
    """Returns summaries of all stored projects."""
    projects = await db_adapter.list_projects()
    return projects

@app.get("/api/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Returns the full project including all tasks, phases, and dependencies."""
    project = await db_adapter.get_project(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Projeto com ID '{project_id}' não foi encontrado."
        )
    return project

@app.post("/api/projects", response_model=Project)
async def save_project(project: Project):
    """Saves or updates a project document."""
    saved = await db_adapter.save_project(project.model_dump())
    return saved

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    """Deletes a project document."""
    deleted = await db_adapter.delete_project(project_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Projeto com ID '{project_id}' não foi encontrado para exclusão."
        )
    return {"message": f"Projeto '{project_id}' excluído com sucesso."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
