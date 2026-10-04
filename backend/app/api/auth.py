from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from app.schemas.auth import (
    UserRegisterRequest, 
    UserLoginRequest, 
    UserResponse, 
    TokenResponse,
    CustomApiKeyRequest,
    ChangePasswordRequest,
    ChangePasswordResponse
)
from app.db.database import UserRepository
from app.core.security import verify_password, create_access_token, decode_access_token

router = APIRouter()

def get_current_user_id(authorization: Optional[str]) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Sesi login diperlukan.")
    token = authorization.replace("Bearer ", "").strip()
    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Sesi kedaluwarsa atau tidak valid.")
    return int(payload["sub"])

def format_user_response(user_dict: dict) -> UserResponse:
    has_key = bool(user_dict.get("custom_sectors_key"))
    credits = user_dict.get("demo_credits", 50)
    return UserResponse(
        id=user_dict["id"],
        email=user_dict["email"],
        full_name=user_dict["full_name"],
        role=user_dict.get("role", "analyst"),
        demo_credits=credits if credits is not None else 50,
        has_custom_sectors_key=has_key,
        created_at=str(user_dict.get("created_at", ""))
    )

@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegisterRequest):
    """Register a new user in database with 50 free demo credits."""
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
        user=format_user_response(user_dict)
    )

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest):
    """Authenticate user against database."""
    user_dict = UserRepository.get_by_email(req.email)
    if not user_dict or not verify_password(req.password, user_dict["hashed_password"]):
        raise HTTPException(status_code=401, detail="Email atau password tidak sesuai.")
        
    token = create_access_token({"sub": str(user_dict["id"]), "email": user_dict["email"]})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=format_user_response(user_dict)
    )

@router.get("/me", response_model=UserResponse)
async def get_me(authorization: Optional[str] = Header(None)):
    """Retrieve current authenticated user profile via Bearer token."""
    user_id = get_current_user_id(authorization)
    user_dict = UserRepository.get_by_id(user_id)
    if not user_dict:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")
    return format_user_response(user_dict)

@router.get("/settings/api-key")
async def get_custom_api_key(authorization: Optional[str] = Header(None)):
    """Retrieve saved personal Sectors API Key for the authenticated user from PostgreSQL DB."""
    user_id = get_current_user_id(authorization)
    user_dict = UserRepository.get_by_id(user_id)
    if not user_dict:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")
    return {
        "api_key": user_dict.get("custom_sectors_key") or ""
    }

@router.post("/settings/api-key", response_model=UserResponse)
async def update_custom_api_key(
    req: CustomApiKeyRequest,
    authorization: Optional[str] = Header(None)
):
    """Save or remove personal Sectors API Key (BYOK) for the user in PostgreSQL DB."""
    user_id = get_current_user_id(authorization)
    UserRepository.update_custom_api_key(user_id, req.api_key)
    user_dict = UserRepository.get_by_id(user_id)
    return format_user_response(user_dict)

@router.get("/credits")
async def get_user_credits(authorization: Optional[str] = Header(None)):
    """Get remaining demo server credits for the current user."""
    user_id = get_current_user_id(authorization)
    user_dict = UserRepository.get_by_id(user_id)
    if not user_dict:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")
    
    credits = user_dict.get("demo_credits", 50)
    has_key = bool(user_dict.get("custom_sectors_key"))
    return {
        "demo_credits": credits if credits is not None else 50,
        "max_credits": 50,
        "has_custom_sectors_key": has_key
    }

@router.post("/change-password", response_model=ChangePasswordResponse)
async def change_password(
    req: ChangePasswordRequest,
    authorization: Optional[str] = Header(None)
):
    """Change authenticated user's password securely."""
    user_id = get_current_user_id(authorization)
    user_dict = UserRepository.get_by_id(user_id)
    if not user_dict:
        raise HTTPException(status_code=404, detail="Akun analis tidak ditemukan.")

    # 1. Verify old password
    if not verify_password(req.old_password, user_dict["hashed_password"]):
        raise HTTPException(status_code=400, detail="Password lama (saat ini) salah. Silakan periksa kembali.")

    # 2. Check confirm password match
    if req.confirm_password is not None and req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Konfirmasi password baru tidak cocok.")

    # 3. Ensure new password is not identical to old password
    if req.old_password == req.new_password:
        raise HTTPException(status_code=400, detail="Password baru tidak boleh sama persis dengan password lama.")

    # 4. Update in database
    UserRepository.update_password(user_id, req.new_password)

    return ChangePasswordResponse(
        success=True,
        message="Password berhasil diperbarui dengan aman."
    )

