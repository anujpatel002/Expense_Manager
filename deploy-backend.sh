#!/bin/bash
echo "Deploying ExpenseFlow Backend to Vercel..."
cd backend
vercel --prod
echo "Backend deployed! Copy the URL for frontend configuration."