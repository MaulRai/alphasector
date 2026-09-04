import os
import asyncio
import logging
from typing import Optional
import cloudinary
import cloudinary.uploader
from app.core.config import settings

logger = logging.getLogger("cloudinary_service")

class CloudinaryService:
    def __init__(self):
        self._configured = False
        self._init_cloudinary()

    def _init_cloudinary(self):
        """Initializes Cloudinary credentials from settings or environment."""
        cloud_name = settings.CLOUDINARY_CLOUD_NAME or os.getenv("CLOUDINARY_CLOUD_NAME")
        api_key = settings.CLOUDINARY_API_KEY or os.getenv("CLOUDINARY_API_KEY")
        api_secret = settings.CLOUDINARY_API_SECRET or os.getenv("CLOUDINARY_API_SECRET")
        cloudinary_url = settings.CLOUDINARY_URL or os.getenv("CLOUDINARY_URL")

        if cloudinary_url:
            cloudinary.config(cloudinary_url=cloudinary_url, secure=True)
            self._configured = True
            logger.info("Cloudinary configured via CLOUDINARY_URL.")
        elif cloud_name and api_key and api_secret:
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret,
                secure=True
            )
            self._configured = True
            logger.info(f"Cloudinary configured for cloud '{cloud_name}'.")
        else:
            self._configured = False

    @property
    def is_configured(self) -> bool:
        if not self._configured:
            self._init_cloudinary()
        return self._configured

    async def upload_base64_image(
        self,
        base64_data: str,
        mime_type: str = "image/png",
        folder: Optional[str] = None
    ) -> Optional[str]:
        """
        Uploads a base64 image string to Cloudinary.
        Returns the secure HTTPS CDN URL on success, or None if not configured / failed.
        """
        if not self.is_configured:
            logger.debug("Cloudinary credentials not configured; skipping remote upload.")
            return None

        # Build data URI format acceptable by Cloudinary uploader
        if not base64_data.startswith("data:"):
            data_uri = f"data:{mime_type};base64,{base64_data}"
        else:
            data_uri = base64_data

        target_folder = folder or settings.CLOUDINARY_FOLDER or os.getenv("CLOUDINARY_FOLDER", "alphasector/chat_uploads")

        def _do_upload():
            return cloudinary.uploader.upload(
                data_uri,
                folder=target_folder,
                resource_type="image",
                transformation=[
                    {"quality": "auto", "fetch_format": "auto"}
                ]
            )

        try:
            # Run blocking cloudinary SDK network call in threadpool
            result = await asyncio.to_thread(_do_upload)
            secure_url = result.get("secure_url") or result.get("url")
            logger.info(f"Image uploaded to Cloudinary successfully: {secure_url}")
            return secure_url
        except Exception as e:
            logger.warning(f"Failed to upload image to Cloudinary: {e}")
            return None

cloudinary_service = CloudinaryService()
