@echo off
echo Committing Little Potato Robotics website changes...

cd /d "C:\Users\intrivo\Documents\Projects\little-potato-robotics-website"

echo Adding all changes...
git add .

echo Committing changes...
git commit -m "update sponsors"

echo Pushing to GitHub...
git push origin main

echo Done! Website updated successfully.
pause
