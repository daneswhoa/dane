@echo off
echo ====================================================
echo Starting Deployment of Trenor Landlord.nl Updates
echo ====================================================

echo.
echo [1/4] Pushing Frontend changes to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Failed to push to GitHub. Make sure you are authenticated.
    pause
    exit /b %errorlevel%
)
echo Frontend changes pushed successfully! Firebase App Hosting should start building.

echo.
echo [2/4] Building and tagging NestJS API Docker container (clean build)...
docker build --no-cache -f apps/api/Dockerfile --tag europe-west4-docker.pkg.dev/landlordhungary/landlord-repo/api:latest .
if %errorlevel% neq 0 (
    echo ERROR: Docker build failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Authenticating with Google Cloud and pushing API container...
gcloud auth configure-docker europe-west4-docker.pkg.dev --quiet
docker push europe-west4-docker.pkg.dev/landlordhungary/landlord-repo/api:latest
if %errorlevel% neq 0 (
    echo ERROR: Failed to push image to Artifact Registry. Try running 'gcloud auth login' and retry.
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Deploying to Google Cloud Run...
gcloud run deploy landlord-api --image=europe-west4-docker.pkg.dev/landlordhungary/landlord-repo/api:latest --region=europe-west4
if %errorlevel% neq 0 (
    echo ERROR: Cloud Run deployment failed.
    pause
    exit /b %errorlevel%
)

echo ====================================================
echo All updates deployed successfully!
echo ====================================================
pause
