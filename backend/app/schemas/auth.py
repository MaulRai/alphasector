from pydantic import BaseModel, Field
from typing import Optional

class UserRegisterRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Password min 6 characters")
    full_name: str = Field(..., min_length=2, description="Full name or institutional role")

class UserLoginRequest(BaseModel):
    email: str
    password: str

class CustomApiKeyRequest(BaseModel):
    api_key: Optional[str] = Field(None, description="Personal Sectors API Key or empty to reset")

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    demo_credits: int = 50
    has_custom_sectors_key: bool = False
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
