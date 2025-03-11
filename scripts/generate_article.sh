#!/bin/bash

API_URL="https://api.letsgeneratearticles.com/article/?category="

CATEGORIES=("business" "entertainment" "general" "health" "science" "sports" "technology")

RANDOM_CATEGORY=${CATEGORIES[$RANDOM % ${#CATEGORIES[@]}]}

LOG_FILE="$HOME/ArticleGen/logs/generated/generated_article_$(date +%Y-%m-%d_%H-%M-%S).log"

curl -s "$API_URL$RANDOM_CATEGORY" >> "$LOG_FILE" 2>&1
