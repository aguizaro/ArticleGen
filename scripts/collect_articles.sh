#!/bin/bash

LOG_FILE="/home/bitnami/ArticleGen/logs/collection/collect_articles_$(date +%Y-%m-%d).log"

/usr/bin/docker exec backend node /app/collectArticles.js >> "$LOG_FILE" 2>&1
