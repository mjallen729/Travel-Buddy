#!/bin/sh

if [ "$1" = "start" ]; then
  cd backend && npm start
elif [ "$1" = "dev" ]; then
  cd backend && npm run dev
fi