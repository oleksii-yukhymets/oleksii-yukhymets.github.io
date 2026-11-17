#!/bin/sh
# Render resume.html -> ../Oleksii-Yukhymets-CV.pdf with headless Chrome.
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=10000 \
  --print-to-pdf="../Oleksii-Yukhymets-CV.pdf" \
  "file://$PWD/resume.html"
echo "Built ../Oleksii-Yukhymets-CV.pdf"
