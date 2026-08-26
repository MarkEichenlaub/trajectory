# The node -e regex check for backslash-h was shell-mangled again; do it here
# properly by fetching the row and printing exact spans around every 'h' that
# follows a backslash, plus around 'rotation)'.
import io, json, re, urllib.request

key = None
for line in io.open('.env', encoding='utf-8'):
    if line.startswith('VITE_SUPABASE_SERVICE_KEY='):
        key = line.split('=', 1)[1].strip()
req = urllib.request.Request(
    'https://nxvtaxbntqhcfqtazbnt.supabase.co/rest/v1/fma_questions?id=eq.fma-pwoot2-p1-q11&select=statement,solution',
    headers={'apikey': key, 'Authorization': 'Bearer ' + key})
row = json.load(urllib.request.urlopen(req))[0]
blob = row['statement'] + '\n---SOL---\n' + row['solution']
for m in re.finditer(r'\\+h\b', blob):
    print('BACKSLASH-H at', m.start(), repr(blob[max(0, m.start()-40):m.start()+15]))
print('ell tokens:', re.findall(r'\\+ell\b', blob))
i = blob.find('rotation)')
print('context:', repr(blob[i:i+20]))
