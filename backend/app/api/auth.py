from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse
from app.db.database import UserRepository
from app.core.security import verify_password, create_access_token, decode_access_token

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegisterRequest):
    """Register a new user in SQLite database and return JWT token."""
    existing = UserRepository.get_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar. Silakan login.")
        
    user_dict = UserRepository.create(
        email=req.email,
        full_name=req.full_name,
        password=req.password,
        role="analyst"
    )
    
    token = create_access_token({"sub": str(user_dict["id"]), "email": user_dict["email"]})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_dict["id"],
            email=user_dict["email"],
            full_name=user_dict["full_name"],
            role=user_dict["role"],
            created_at=str(user_dict.get("created_at", ""))
        )
    )

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest):
    """Authenticate user against SQLite database and return JWT token."""
    user_dict = UserRepository.get_by_email(req.email)
    if not user_dict or not verify_password(req.password, user_dict["hashed_password"]):
        raise HTTPException(status_code=401, detail="Email atau password tidak sesuai.")
        
    token = create_access_token({"sub": str(user_dict["id"]), "email": user_dict["email"]})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user_dict["id"],
            email=user_dict["email"],
            full_name=user_dict["full_name"],
            role=user_dict["role"],
            created_at=str(user_dict.get("created_at", ""))
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_me(authorization: Optional[str] = Header(None)):
    """Retrieve current authenticated user profile via Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid.")
        
    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token kedaluwarsa atau tidak valid.")
        
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID tidak ditemukan dalam token.")
        
    user_dict = UserRepository.get_by_id(int(user_id))
    if not user_dict:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")
        
    return UserResponse(
        id=user_dict["id"],
        email=user_dict["email"],
        full_name=user_dict["full_name"],
        role=user_dict["role"],
        created_at=str(user_dict.get("created_at", ""))
    )
