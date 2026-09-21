import os
import json
from typing import List, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = (
    os.getenv("SUPABASE_KEY")
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
)
TABLE_NAME = os.getenv("SUPABASE_TABLE", "projects")

# Vercel serverless environment has read-only filesystem except /tmp
if os.getenv("VERCEL"):
    DATA_DIR = os.getenv("DATA_DIR", "/tmp/data")
else:
    DATA_DIR = os.getenv("DATA_DIR", os.path.join(os.path.dirname(__file__), "data"))

FILE_STORE_PATH = os.path.join(DATA_DIR, "projects.json")

try:
    os.makedirs(DATA_DIR, exist_ok=True)
except Exception:
    pass


class DatabaseAdapter:
    def __init__(self):
        self.use_supabase = False
        self.client = None
        self._init_connection()

    def _init_connection(self):
        if SUPABASE_URL and SUPABASE_KEY:
            try:
                from supabase import create_client
                self.client = create_client(SUPABASE_URL, SUPABASE_KEY)
                self.use_supabase = True
            except Exception:
                self.use_supabase = False
        else:
            self.use_supabase = False

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
        if self.use_supabase and self.client:
            try:
                # Test query against Supabase
                self.client.table(TABLE_NAME).select("id").limit(1).execute()
                return {
                    "status": "online",
                    "engine": "Supabase (PostgreSQL JSONB)",
                    "url": SUPABASE_URL,
                }
            except Exception as e:
                return {
                    "status": "degraded",
                    "engine": "JSON File Store (Supabase inacessível ou tabela não criada)",
                    "detail": str(e),
                }
        return {
            "status": "online",
            "engine": "JSON File Store (Local / Standalone)",
            "path": FILE_STORE_PATH,
        }

    async def list_projects(self) -> List[dict]:
        if self.use_supabase and self.client:
            try:
                res = (
                    self.client.table(TABLE_NAME)
                    .select("id, name, client_name, description, target_date, updated_at, data")
                    .execute()
                )
                summaries = []
                for row in res.data:
                    project_data = row.get("data") or {}
                    tasks = project_data.get("tasks", [])
                    summaries.append({
                        "id": row.get("id"),
                        "name": row.get("name") or project_data.get("name", ""),
                        "clientName": row.get("client_name") or project_data.get("clientName"),
                        "description": row.get("description") or project_data.get("description"),
                        "targetDate": row.get("target_date") or project_data.get("targetDate"),
                        "updatedAt": row.get("updated_at") or project_data.get("updatedAt", ""),
                        "taskCount": len(tasks),
                    })
                return summaries
            except Exception:
                pass

        # Fallback to local file store
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
        if self.use_supabase and self.client:
            try:
                res = self.client.table(TABLE_NAME).select("data").eq("id", project_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0].get("data")
            except Exception:
                pass

        # Fallback to local file store
        data = self._read_file_store()
        return data.get(project_id)

    async def save_project(self, project_dict: dict) -> dict:
        project_dict["updatedAt"] = datetime.utcnow().strftime("%Y-%m-%d")
        project_id = project_dict["id"]

        if self.use_supabase and self.client:
            try:
                payload = {
                    "id": project_id,
                    "name": project_dict.get("name", "Sem Título"),
                    "client_name": project_dict.get("clientName", ""),
                    "description": project_dict.get("description", ""),
                    "target_date": project_dict.get("targetDate", ""),
                    "updated_at": project_dict["updatedAt"],
                    "data": project_dict,
                }
                self.client.table(TABLE_NAME).upsert(payload).execute()
                return project_dict
            except Exception:
                pass

        # Fallback to local file store
        data = self._read_file_store()
        data[project_id] = project_dict
        self._write_file_store(data)
        return project_dict

    async def delete_project(self, project_id: str) -> bool:
        if self.use_supabase and self.client:
            try:
                self.client.table(TABLE_NAME).delete().eq("id", project_id).execute()
                return True
            except Exception:
                pass

        # Fallback to local file store
        data = self._read_file_store()
        if project_id in data:
            del data[project_id]
            self._write_file_store(data)
            return True
        return False


db_adapter = DatabaseAdapter()
