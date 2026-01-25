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

# 1. Navigate to deployment target
cd "$DEPLOYMENT_TARGET"
echo "Deployment target: $DEPLOYMENT_TARGET"

# 2. Show Node.js version
echo "Using Node.js version: $(node --version)"
echo "Using npm version: $(npm --version)"

# 3. Install npm packages
if [ -e "$DEPLOYMENT_TARGET/package.json" ]; then
  echo "Running npm install"
  npm ci --omit=dev
  exitWithMessageOnError "npm install failed"
fi

# 4. Build Next.js application
if [ -e "$DEPLOYMENT_TARGET/package.json" ]; then
  echo "Running npm run build"
  npm run build
  exitWithMessageOnError "npm build failed"
fi

##################################################################################################################################
echo "Finished successfully."
