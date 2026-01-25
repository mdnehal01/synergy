#!/bin/bash

# ----------------------
# KUDU Deployment Script
# Version: 2.0.0
# ----------------------

# Helpers
# -------

exitWithMessageOnError () {
  if [ ! $? -eq 0 ]; then
    echo "An error has occurred during web site deployment."
    echo $1
    exit 1
  fi
}

# Setup
# -----

echo "Handling node.js deployment."

# Set deployment target
if [[ ! -n "$DEPLOYMENT_TARGET" ]]; then
  DEPLOYMENT_TARGET=/home/site/wwwroot
fi

echo "Deployment target: $DEPLOYMENT_TARGET"

# 1. Show Node.js version
echo "Using Node.js version: $(node --version)"
echo "Using npm version: $(npm --version)"

# 2. Navigate to deployment target
cd "$DEPLOYMENT_TARGET"
echo "Current directory: $(pwd)"
echo "Files in deployment target:"
ls -la

# 3. Install npm packages
echo "Running npm install..."
npm ci --omit=dev
exitWithMessageOnError "npm install failed"

# 4. Build Next.js application
echo "Running npm run build..."
npm run build
exitWithMessageOnError "npm build failed"

##################################################################################################################################
echo "Finished successfully."
