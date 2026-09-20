import os
import json
from typing import List, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = (
    os.getenv("MONGODB_URI")
    or os.getenv("MONGODB_URL")
    or os.getenv("DATABASE_URL")
    or "mongodb://localhost:27017"
)
DATABASE_NAME = os.getenv("DATABASE_NAME", "roadtask_db")
COLLECTION_NAME = "projects"

# Vercel serverless environment has read-only filesystem except /tmp
if os.getenv("VERCEL"):
    DATA_DIR = os.getenv("DATA_DIR", "/tmp/data")
else:
    DATA_DIR = os.getenv("DATA_DIR", os.path.join(os.path.dirname(__file__), "data"))

FILE_STORE_PATH = os.path.join(DATA_DIR, "projects.json")

# Ensure local data directory exists for fallback
try:
    os.makedirs(DATA_DIR, exist_ok=True)
except Exception:
    pass

class DatabaseAdapter:
    def __init__(self):
        self.use_mongo = False
        self.mongo_client = None
        self.collection = None
        self._init_connection()

    def _init_connection(self):
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            self.mongo_client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
            db = self.mongo_client[DATABASE_NAME]
            self.collection = db[COLLECTION_NAME]
            self.use_mongo = True
        except Exception:
            self.use_mongo = False

    def _read_file_store(self) -> dict:
        if not os.path.exists(FILE_STORE_PATH):
            return {}
        try:
            with open(FILE_STORE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def _write_file_store(self, data: dict):
        with open(FILE_STORE_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    async def ping(self) -> dict:
        if self.use_mongo and self.mongo_client:
            try:
                await self.mongo_client.admin.command('ping')
                return {"status": "online", "engine": "MongoDB", "uri": MONGODB_URI}
            except Exception as e:
                return {"status": "degraded", "engine": "JSON File Store (Mongo unreachable)", "detail": str(e)}
        return {"status": "online", "engine": "JSON File Store", "path": FILE_STORE_PATH}

    async def list_projects(self) -> List[dict]:
        if self.use_mongo and self.collection is not None:
            try:
                cursor = self.collection.find({}, {"tasks": 0})
                projects = []
                async for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    projects.append(doc)
                return projects
            except Exception:
                pass

        # File store fallback
        data = self._read_file_store()
        summaries = []
        for p in data.values():
            summaries.append({
                "id": p.get("id"),
                "name": p.get("name"),
                "clientName": p.get("clientName"),
                "description": p.get("description"),
                "targetDate": p.get("targetDate"),
                "updatedAt": p.get("updatedAt", ""),
                "taskCount": len(p.get("tasks", [])),
            })
        return summaries

    async def get_project(self, project_id: str) -> Optional[dict]:
        if self.use_mongo and self.collection is not None:
            try:
                doc = await self.collection.find_one({"id": project_id})
                if doc:
                    doc.pop("_id", None)
                    return doc
            except Exception:
                pass

        # File store fallback
        data = self._read_file_store()
        return data.get(project_id)

    async def save_project(self, project_dict: dict) -> dict:
        project_dict["updatedAt"] = datetime.utcnow().strftime("%Y-%m-%d")
        project_id = project_dict["id"]

        if self.use_mongo and self.collection is not None:
            try:
                await self.collection.replace_one(
                    {"id": project_id},
                    project_dict,
                    upsert=True
                )
                return project_dict
            except Exception:
                pass

        # File store fallback
        data = self._read_file_store()
        data[project_id] = project_dict
        self._write_file_store(data)
        return project_dict

    async def delete_project(self, project_id: str) -> bool:
        if self.use_mongo and self.collection is not None:
            try:
                result = await self.collection.delete_one({"id": project_id})
                return result.deleted_count > 0
            except Exception:
                pass

        # File store fallback
        data = self._read_file_store()
        if project_id in data:
            del data[project_id]
            self._write_file_store(data)
            return True
        return False

db_adapter = DatabaseAdapter()
