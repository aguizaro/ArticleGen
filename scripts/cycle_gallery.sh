#!/bin/bash

LOG_FILE="/home/bitnami/ArticleGen/logs/gallery/cycle_articles_$(date +%Y-%m-%d).log"

/usr/bin/docker exec backend node /app/cycleGallery.js >> "$LOG_FILE" 2>&1
