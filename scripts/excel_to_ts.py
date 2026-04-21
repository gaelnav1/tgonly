import openpyxl
import unicodedata
import re
import json
import os

SKIP_SHEETS = ['resumen']

def slugify(text):
    text = text.lower().strip()
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def parse_bool(val):
    if isinstance(val, bool): return val
    if val is None: return False
    s = str(val).lower()
    return any(x in s for x in ['si', 'yes', 'true', '✅', '🔥'])

def parse_int(val):
    if val is None: return 0
    return int(re.sub(r'[^0-9]', '', str(val)) or '0')

wb = openpyxl.load_workbook('data/tgonly-grupos.xlsx')

categories = []
groups = []

for sheet_name in wb.sheetnames:
    if sheet_name.lower() in SKIP_SHEETS:
        continue

    ws = wb[sheet_name]
    rows = list(ws.iter_rows(values_only=True))

    header_row = -1
    for i, row in enumerate(rows[:5]):
        if row and any(str(c or '').lower() in ['nombre', 'nombre del grupo'] for c in row):
            header_row = i
            break

    if header_row == -1:
        continue

    category_slug = slugify(sheet_name)
    data_rows = [r for r in rows[header_row+1:] if r and r[2]]

    if not data_rows:
        continue

    # Contar grupos validos
    valid = [r for r in data_rows if str(r[2] or '').strip()]
    
    # Emoji de categoria: usar el primero del sheet o default
    cat_emoji = str(data_rows[0][1] or '📁').strip() if data_rows else '📁'

    categories.append({
        'emoji': cat_emoji,
        'name': sheet_name,
        'count': str(len(valid)),
        'slug': category_slug,
    })

    for row in data_rows:
        name = str(row[2] or '').strip()
        if not name:
            continue
        tags = [t.strip() for t in str(row[6] or '').split('|') if t.strip()]
        members_raw = str(row[3] or '0')
        members_num = parse_int(row[3])
        members_str = f"{members_num:,}" if members_raw.replace(',','').isdigit() else members_raw

        groups.append({
            'emoji':    str(row[1] or '').strip(),
            'color':    'blue',
            'name':     name,
            'members':  members_str,
            'verified': parse_bool(row[4]),
            'desc':     str(row[5] or '').strip(),
            'tags':     tags,
            'trending': parse_bool(row[7]),
            'category': category_slug,
            'link':     str(row[9] or '#').strip() or '#',
            'score':    parse_int(row[8]),
        })

    print(f"  {sheet_name} -> /{category_slug} ({len(valid)} grupos)")

# Generar TypeScript
lines = []
lines.append('// AUTO-GENERADO — no editar manualmente')
lines.append('// Generado desde data/tgonly-grupos.xlsx')
lines.append('')
lines.append('export type Category = {')
lines.append('  emoji: string')
lines.append('  name: string')
lines.append('  count: string')
lines.append('  slug: string')
lines.append('}')
lines.append('')
lines.append('export type Group = {')
lines.append('  emoji: string')
lines.append('  color: string')
lines.append('  name: string')
lines.append('  members: string')
lines.append('  verified: boolean')
lines.append('  desc: string')
lines.append('  tags: string[]')
lines.append('  trending: boolean')
lines.append('  category: string')
lines.append('  link: string')
lines.append('  score?: number')
lines.append('}')
lines.append('')

# Categories
lines.append('export const categories: Category[] = [')
for cat in categories:
    lines.append(f"  {{ emoji: {json.dumps(cat['emoji'])}, name: {json.dumps(cat['name'])}, count: {json.dumps(cat['count'])}, slug: {json.dumps(cat['slug'])} }},")
lines.append(']')
lines.append('')

# Groups
lines.append('export const groups: Group[] = [')
for g in groups:
    lines.append(f"  {{")
    lines.append(f"    emoji: {json.dumps(g['emoji'])}, color: 'blue',")
    lines.append(f"    name: {json.dumps(g['name'])},")
    lines.append(f"    members: {json.dumps(g['members'])}, verified: {'true' if g['verified'] else 'false'},")
    lines.append(f"    desc: {json.dumps(g['desc'])},")
    lines.append(f"    tags: {json.dumps(g['tags'])},")
    lines.append(f"    trending: {'true' if g['trending'] else 'false'}, category: {json.dumps(g['category'])},")
    lines.append(f"    link: {json.dumps(g['link'])}, score: {g['score']},")
    lines.append(f"  }},")
lines.append(']')

output = '\n'.join(lines)
os.makedirs('data', exist_ok=True)
with open('data/groups.ts', 'w', encoding='utf-8') as f:
    f.write(output)

print(f"\nGenerado: {len(categories)} categorias, {len(groups)} grupos -> data/groups.ts")
