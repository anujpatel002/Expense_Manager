#!/bin/bash
echo "Deploying ExpenseFlow Frontend to Vercel..."
cd frontend
vercel --prod
echo "Frontend deployed! Share this URL for public access."