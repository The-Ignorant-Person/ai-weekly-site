#!/usr/bin/env python3
"""
Generate a fully static version of the AI Weekly site without requiring Node.js.
This script reads MDX files from the content directory, converts them to HTML
with pandoc, and renders simple HTML pages with navigation and styling.

Usage:
  python3 generate_static.py

It outputs files into website/out.
"""
import os
import re
import subprocess
import html
from datetime import datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
CONTENT_DIR = os.path.join(ROOT, 'content')
OUT_DIR = os.path.join(ROOT, 'website', 'out')
STYLE_SRC = os.path.join(ROOT, 'website', 'styles', 'globals.css')


def read_mdx(path):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    # Split front matter and content
    if text.startswith('---'):
        parts = text.split('---', 2)
        if len(parts) >= 3:
            fm_raw = parts[1]
            body = parts[2]
        else:
            fm_raw = ''
            body = text
    else:
        fm_raw = ''
        body = text
    front = {}
    for line in fm_raw.splitlines():
        if not line.strip() or line.strip().startswith('#'):
            continue
        if ':' in line:
            key, val = line.split(':', 1)
            key = key.strip()
            val = val.strip()
            # parse lists
            if val.startswith('[') or val.startswith('-'):
                # naive list parser for YAML like `- tag1` lines
                items = []
                for item_line in fm_raw.splitlines()[fm_raw.splitlines().index(line)+1:]:
                    if item_line.strip().startswith('-'):
                        items.append(item_line.strip('- ').strip())
                    else:
                        break
                front[key] = items
            else:
                # remove quotes
                front[key] = val.strip('"')
    return front, body


def pandoc_markdown_to_html(md_text):
    """Convert markdown to HTML using pandoc."""
    try:
        result = subprocess.run(
            ['pandoc', '--from', 'markdown', '--to', 'html', '--mathjax'],
            input=md_text.encode('utf-8'),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
        return result.stdout.decode('utf-8')
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Pandoc conversion failed: {e.stderr.decode('utf-8')}")


def load_styles():
    with open(STYLE_SRC, 'r', encoding='utf-8') as f:
        return f.read()


def html_template(title, body_html, nav=''):
    styles = load_styles()
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(title)}</title>
  <style>{styles}</style>
</head>
<body>
  <header class="header">
    <nav>
      <a href="/index.html"><strong>AI 周报站点</strong></a>
      <a href="/weeks/index.html">周报归档</a>
      <a href="/tags/index.html">标签</a>
      <a href="/search.html">搜索</a>
    </nav>
  </header>
  <main class="container">
  {body_html}
  </main>
</body>
</html>"""


def build_items(items_dir, out_base):
    items = []
    for filename in os.listdir(items_dir):
        if not filename.endswith('.mdx'):
            continue
        path = os.path.join(items_dir, filename)
        front, body = read_mdx(path)
        slug = front.get('slug') or filename[:-4]
        html_body = pandoc_markdown_to_html(body)
        tags = front.get('tags', [])
        # Build item page
        tags_html = ''.join(
            f'<a href="/tags/{html.escape(tag)}/index.html" class="tag-chip">{html.escape(tag)}</a>' for tag in tags
        )
        evidence = front.get('evidence')
        evidence_html = f'<span class="badge {evidence}">{evidence}</span>' if evidence else ''
        meta_html = f'<p>创建时间：{front.get("createdAt", "")}；更新时间：{front.get("updatedAt", "")}</p>'
        content_html = f'<h1>{html.escape(front.get("title", slug))}</h1>' + meta_html + '<div>' + tags_html + evidence_html + '</div>' + html_body
        page_html = html_template(front.get('title', slug), content_html)
        out_path = os.path.join(out_base, 'items', slug, 'index.html')
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(page_html)
        items.append({**front, 'slug': slug})
    return items


def build_weeks(weeks_dir, out_base):
    weeks = []
    for filename in os.listdir(weeks_dir):
        if not filename.endswith('.mdx'):
            continue
        path = os.path.join(weeks_dir, filename)
        front, body = read_mdx(path)
        slug = front.get('slug') or filename[:-4]
        html_body = pandoc_markdown_to_html(body)
        content_html = f'<h1>{html.escape(front.get("title", slug))}</h1>' + html_body
        page_html = html_template(front.get('title', slug), content_html)
        out_path = os.path.join(out_base, 'weeks', slug, 'index.html')
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(page_html)
        weeks.append({**front, 'slug': slug})
    # Generate week archive page
    weeks_sorted = sorted(weeks, key=lambda w: w.get('weekEnd', ''), reverse=True)
    list_items = '\n'.join(
        f'<li><a href="/weeks/{w["slug"]}/index.html">{html.escape(w.get("title", w["slug"]))}</a>（{w.get("weekStart", "")} – {w.get("weekEnd", "")})</li>'
        for w in weeks_sorted
    )
    body_html = '<h1>周报归档</h1><ul>' + list_items + '</ul>'
    index_html = html_template('周报归档', body_html)
    out_path = os.path.join(out_base, 'weeks', 'index.html')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(index_html)
    return weeks_sorted


def build_tags(items, out_base):
    tag_map = {}
    for item in items:
        for tag in item.get('tags', []):
            tag_map.setdefault(tag, []).append(item)
    # Tag index page
    tags_sorted = sorted(tag_map.keys())
    list_items = '\n'.join(
        f'<li><a href="/tags/{html.escape(tag)}/index.html">{html.escape(tag)}</a>（{len(tag_map[tag])}）</li>'
        for tag in tags_sorted
    )
    body_html = '<h1>标签</h1><ul>' + list_items + '</ul>'
    tags_index = html_template('标签', body_html)
    os.makedirs(os.path.join(out_base, 'tags'), exist_ok=True)
    with open(os.path.join(out_base, 'tags', 'index.html'), 'w', encoding='utf-8') as f:
        f.write(tags_index)
    # Individual tag pages
    for tag, items_list in tag_map.items():
        card_html = ''
        for item in items_list:
            tags_html = ''.join(
                f'<a href="/tags/{html.escape(t)}/index.html" class="tag-chip">{html.escape(t)}</a>' for t in item.get('tags', [])
            )
            evidence_html = f'<span class="badge {item.get("evidence", "")}">{item.get("evidence", "")}</span>' if item.get('evidence') else ''
            card_html += f'<div class="card"><h3><a href="/items/{item["slug"]}/index.html">{html.escape(item.get("title", item["slug"]))}</a>{evidence_html}</h3><p>得分：{item.get("score", "")}</p><div>{tags_html}</div></div>'
        body_html = f'<h1>标签：{html.escape(tag)}</h1>' + card_html
        page_html = html_template(f'标签：{tag}', body_html)
        tag_dir = os.path.join(out_base, 'tags', tag)
        os.makedirs(tag_dir, exist_ok=True)
        with open(os.path.join(tag_dir, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(page_html)


def build_search_page(items, out_base):
    # Build simple search page using client-side JS
    items_js = [
        {
            'slug': item['slug'],
            'title': item['title'],
            'tags': item.get('tags', []),
            'score': item.get('score'),
            'evidence': item.get('evidence'),
        }
        for item in items
    ]
    import json
    js_data = json.dumps(items_js, ensure_ascii=False)
    # Build the client-side search script. We avoid using Python f-strings here to prevent
    # conflicts with JavaScript template literals. Concatenate the JSON data and a static
    # script so that braces remain literal in the JS code.
    script = (
        "<script>\n"
        "const items = " + js_data + ";\n"
        "const input = document.getElementById('search-input');\n"
        "const resultsDiv = document.getElementById('search-results');\n"
        "function renderResults(list) {\n"
        "  resultsDiv.innerHTML = '';\n"
        "  list.forEach(item => {\n"
        "    const div = document.createElement('div');\n"
        "    div.className = 'card';\n"
        "    const tags = item.tags.map(tag => `<a href=\"/tags/${tag}/index.html\" class=\"tag-chip\">${tag}</a>`).join('');\n"
        "    const evidence = item.evidence ? `<span class=\"badge ${item.evidence}\">${item.evidence}</span>` : '';\n"
        "    div.innerHTML = `<h3><a href=\"/items/${item.slug}/index.html\">${item.title}</a>${evidence}</h3><p>得分：${item.score}</p><div>${tags}</div>`;\n"
        "    resultsDiv.appendChild(div);\n"
        "  });\n"
        "}\n"
        "input.addEventListener('input', () => {\n"
        "  const q = input.value.trim().toLowerCase();\n"
        "  if (!q) { resultsDiv.innerHTML = ''; return; }\n"
        "  const filtered = items.filter(item => item.title.toLowerCase().includes(q) || item.tags.join(' ').toLowerCase().includes(q));\n"
        "  renderResults(filtered);\n"
        "});\n"
        "</script>"
    )
    body_html = """
<h1>搜索</h1>
<input id="search-input" type="text" placeholder="搜索标题或标签..." style="padding:0.5rem;width:100%;border:1px solid var(--border);border-radius:0.25rem;margin-bottom:1rem" />
<div id="search-results"></div>
""" + script
    page_html = html_template('搜索', body_html)
    with open(os.path.join(out_base, 'search.html'), 'w', encoding='utf-8') as f:
        f.write(page_html)


def build_home(latest_week, items, out_base):
    # Extract sections from latest week content
    # We will simply link to the weekly report instead of duplicating sections
    cards_html = ''
    for item in items:
        tags_html = ''.join(
            f'<a href="/tags/{html.escape(tag)}/index.html" class="tag-chip">{html.escape(tag)}</a>' for tag in item.get('tags', [])
        )
        evidence_html = f'<span class="badge {item.get("evidence", "")}">{item.get("evidence", "")}</span>' if item.get('evidence') else ''
        cards_html += f'<div class="card"><h3><a href="/items/{item["slug"]}/index.html">{html.escape(item.get("title", item["slug"]))}</a>{evidence_html}</h3><p>得分：{item.get("score", "")}</p><div>{tags_html}</div></div>'
    body_html = f'<h1>{html.escape(latest_week["title"])} </h1>'
    body_html += '<p>请点击条目查看详细解读。完整周报见 <a href="/weeks/{0}/index.html">本周周报</a>。</p>'.format(latest_week['slug'])
    body_html += cards_html
    index_html = html_template('首页', body_html)
    with open(os.path.join(out_base, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(index_html)


def main():
    # Clean output directory
    if os.path.exists(OUT_DIR):
        import shutil
        shutil.rmtree(OUT_DIR)
    os.makedirs(OUT_DIR, exist_ok=True)
    # Build items and weeks
    items_dir = os.path.join(CONTENT_DIR, 'items')
    weeks_dir = os.path.join(CONTENT_DIR, 'weeks')
    items = build_items(items_dir, OUT_DIR)
    weeks = build_weeks(weeks_dir, OUT_DIR)
    # Build tags and search
    build_tags(items, OUT_DIR)
    build_search_page(items, OUT_DIR)
    # Build home page using latest week
    latest_week = weeks[0] if weeks else None
    if latest_week:
        build_home(latest_week, items, OUT_DIR)
    print(f"Static site generated at {OUT_DIR}")


if __name__ == '__main__':
    main()