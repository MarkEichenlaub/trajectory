import io
import re

p = 'scripts/fma_exams/fma-pwoot2-p1.mjs'
s = io.open(p, encoding='utf-8').read()
i = s.find('n: 11')
j = s.find('n: 12')
q = s[i:j]
# In the template-literal source, LaTeX backslashes are doubled. The earlier
# botched edit left "\\h" (renders \h -> KaTeX error) and possibly intact
# "\\ell". Both should be plain "h".
q = re.sub(r'\\+h\b', 'h', q)
q = re.sub(r'\\+ell\b', 'h', q)
s = s[:i] + q + s[j:]
io.open(p, 'w', encoding='utf-8').write(s)
print('q11 cleaned. leftovers:', 'ell' in q, '| backslash-h:', bool(re.search(r'\\+h\b', q)))
print(q[:160].replace('\n', ' '))
