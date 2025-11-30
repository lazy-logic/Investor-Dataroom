# Backend Fix: Public Access Request Endpoint

This document describes the **FastAPI** changes required to wire the public _Request Access_ form end‑to‑end so that new requests appear on the admin **Access Requests** page.

---

## 1. Pydantic models (schemas)

Create or extend a schemas module, e.g. `app/schemas/access_requests.py`:

```python
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr


class AccessRequestStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    denied = "denied"


class AccessRequestCreate(BaseModel):
    """Payload used by the public Request Access form."""

    email: EmailStr
    full_name: str
    company: str
    role_title: Optional[str] = None
    investor_type: Optional[str] = None  # e.g. "angel", "vc", etc.
    message: Optional[str] = None


class AccessRequestPublic(BaseModel):
    """Shape returned to the frontend & used by the admin UI."""

    id: str
    email: EmailStr
    full_name: str
    company: str
    role_title: Optional[str] = None
    investor_type: Optional[str] = None

    status: AccessRequestStatus = AccessRequestStatus.pending
    admin_notes: Optional[str] = None

    requested_at: datetime
    reviewed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

    class Config:
        orm_mode = True
```

Notes:

- `AccessRequestCreate` matches what the Next.js Request Access form sends.
- `AccessRequestPublic` matches the fields the admin UI expects (`email`, `full_name`, `company`, `status`, `requested_at`, `expires_at`, etc.).

---

## 2. SQLAlchemy model (example)

If you dont already have a DB model for access requests, you can use this as a starting point.
Adjust table/column types to your existing patterns.

```python
from datetime import datetime
from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class AccessRequest(Base):
    __tablename__ = "access_requests"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    company = Column(String, nullable=False)
    role_title = Column(String, nullable=True)
    investor_type = Column(String, nullable=True)
    message = Column(Text, nullable=True)

    status = Column(String, nullable=False, default="pending")
    admin_notes = Column(Text, nullable=True)

    requested_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
```

- You can switch `id` to a UUID type if that is your standard.
- If an `AccessRequest` model already exists, just align the schemas in section 1 to that instead of creating a new table.

---

## 3. DB session dependency (if needed)

If you already have a `get_db` dependency, you can skip this.
Otherwise, this is a typical pattern:

```python
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = "postgresql+psycopg2://user:pass@localhost/dbname"

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

Make sure this matches the actual database and session setup in your backend.

---

## 4. FastAPI router: `POST /api/access-requests`

This is the new **public** endpoint that the Next.js Request Access page should call.
It creates an access request with `status = "pending"` and timestamps `requested_at`.

```python
from datetime import datetime
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.access_request import AccessRequest
from app.schemas.access_requests import (
    AccessRequestCreate,
    AccessRequestPublic,
    AccessRequestStatus,
)

router = APIRouter(
    prefix="/api/access-requests",
    tags=["Access Requests"],
)


@router.post(
    "",
    response_model=AccessRequestPublic,
    status_code=status.HTTP_200_OK,  # use 201 if you prefer
)
def create_access_request(
    payload: AccessRequestCreate,
    db: Session = Depends(get_db),
) -> AccessRequestPublic:
    """Public endpoint used by the investor Request Access form.

    - Creates a new access request with status 'pending'
    - Does NOT require authentication
    """

    now = datetime.utcnow()

    # Generate a new ID (UUID). Adjust to your preferred scheme if needed.
    request_id = str(uuid.uuid4())

    db_obj = AccessRequest(
        id=request_id,
        email=payload.email,
        full_name=payload.full_name,
        company=payload.company,
        role_title=payload.role_title,
        investor_type=payload.investor_type,
        message=payload.message,
        status=AccessRequestStatus.pending.value,
        requested_at=now,
        reviewed_at=None,
        expires_at=None,
        admin_notes=None,
    )

    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    return db_obj
```

**Key points:**

- No authentication: this is intended for public access from the investor Request Access page.
- Ensures `status` is initially `"pending"` so the admin UI can filter by status.
- Timestamps `requested_at` with the current UTC time.

---

## 5. Wire the router into the main FastAPI app

In your `main.py` (or equivalent) where the FastAPI app is created:

```python
from fastapi import FastAPI

from app.api.routes import access_requests  # adjust import path as needed

app = FastAPI(
    title="SAYeTECH Investor Dataroom",
    version="2.0.0",
)

app.include_router(access_requests.router)
```

Once this is in place and deployed:

1. Update the frontend `submitAccessRequest` helper (`web/src/lib/api.ts`) to call the real backend:

   ```ts
   const res = await fetch(`${API_BASE_URL}/api/access-requests`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify(payload),
   });
   ```

2. Optionally remove or thin out the mock Next.js route at `web/src/app/api/access-requests/route.ts`.

3. The admin Access Requests page (`/admin/access-requests`) already uses
   `GET /api/admin/access-requests`, so newly created records will show up there
   automatically.
