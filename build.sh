#!/usr/bin/env bash
set -e

pip install -r backend/requirements.txt

mkdir -p /opt/render/project/src/.venv/nltk_data
python -c "import nltk; nltk.download('punkt', download_dir='/opt/render/project/src/.venv/nltk_data')"
python -c "import nltk; nltk.download('punkt_tab', download_dir='/opt/render/project/src/.venv/nltk_data')"
