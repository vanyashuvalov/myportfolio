"""
## ANCHOR POINTS
- ENTRY: Vercel serverless function for projects API
- MAIN: HTTP handler for /api/projects endpoint
- EXPORTS: handler function
- DEPS: json, pathlib
- TODOs: None

UPDATED COMMENTS: Vercel serverless function for projects endpoint
CRITICAL: Separate file per endpoint for Vercel routing
SCALED FOR: Stateless serverless architecture
"""

import json
import re
from http.server import BaseHTTPRequestHandler
from typing import Dict, List, Optional
from pathlib import Path
from urllib.parse import parse_qs, urlparse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # CRITICAL: Parse query parameters
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        category = query_params.get('category', ['all'])[0]
        
        # UPDATED COMMENTS: Load projects from markdown files
        base_dir = Path(__file__).parent
        projects_dir = base_dir / 'data' / 'projects'
        
        projects = []
        categories = ['work', 'fun'] if category == 'all' else [category] if category in ['work', 'fun'] else []
        
        for cat in categories:
            cat_dir = projects_dir / cat
            if not cat_dir.exists():
                continue
            
            for md_file in cat_dir.glob('*.md'):
                try:
                    with open(md_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # CRITICAL: Parse frontmatter
                    if content.startswith('---'):
                        parts = content.split('---', 2)
                        if len(parts) >= 3:
                            frontmatter = parts[1].strip()
                            metadata = {}
                            for line in frontmatter.split('\n'):
                                if ':' in line:
                                    key, value = line.split(':', 1)
                                    key = key.strip()
                                    value = parse_frontmatter_value(value.strip())
                                    metadata[key] = value

                            body = parts[2].strip()
                            preview_images = extract_project_preview_images(metadata, body)
                            
                            projects.append({
                                "id": md_file.stem,
                                "category": cat,
                                "title": metadata.get('title', md_file.stem),
                                "thumbnail": metadata.get('thumbnail', '/assets/images/bg-mountains.jpg'),
                                "images": preview_images,
                                "description": metadata.get('description', ''),
                                "tags": metadata.get('tags', []),
                                "year": metadata.get('year'),
                                "client": metadata.get('client'),
                                "role": metadata.get('role'),
                                "order": metadata.get('order')
                            })
                except Exception:
                    continue
        
        # CRITICAL: Send JSON response
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # UPDATED COMMENTS: Sort projects by order field, then by year
        def sort_key(p):
            order = p.get('order')
            if order is not None:
                try:
                    return (0, int(order))
                except (ValueError, TypeError):
                    pass
            return (1, -int(p.get('year', 0)))
        
        projects.sort(key=sort_key)
        
        response = {
            "projects": projects,
            "total": len(projects),
            "category": category
        }

        self.wfile.write(json.dumps(response).encode())


def parse_frontmatter_value(raw_value: str):
    """
    Parse a single YAML-like frontmatter value.
    PURPOSE: Keep Vercel project metadata parsing aligned with the local backend parser.
    CONNECTIONS: Used by /api/projects so folder previews receive the same image payload as the local server.
    """
    value = raw_value.strip().strip('"\'')

    if value.startswith('[') and value.endswith(']'):
        return [v.strip().strip('"\'') for v in value[1:-1].split(',') if v.strip()]

    if value.lower() in ['true', 'false']:
        return value.lower() == 'true'

    return value


def extract_project_preview_images(metadata: Dict, body: str) -> List[str]:
    """
    Build up to three preview image URLs for a project folder.
    PURPOSE: Let the desktop canvas render different thumbnails per folder instead of repeating one fallback image.
    CONNECTIONS: Mirrors the backend/api_server.py logic so Vercel and local development behave the same.
    """
    preview_images: List[str] = []

    def add_image(raw_value: Optional[str]):
        if not raw_value:
            return

        normalized = str(raw_value).strip().replace('\\', '/')
        if not normalized:
            return
        if not normalized.startswith(('http://', 'https://', '/')):
            normalized = f"/{normalized}"
        if normalized not in preview_images:
            preview_images.append(normalized)

    for key in ('hero_image', 'thumbnail', 'og_image'):
        add_image(metadata.get(key))

    for match in re.findall(r'!\[[^\]]*\]\(([^)]+)\)', body):
        add_image(match)
        if len(preview_images) >= 3:
            break

    return preview_images[:3]
