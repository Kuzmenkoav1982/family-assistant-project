import json, urllib.request, urllib.error

CC = "https://functions.poehali.dev/bc0c3710-e24a-4171-aa84-0311d97d14d9"
CD = "https://functions.poehali.dev/d6f787e2-2e12-4c83-959c-8220442c6203"
TOKEN = "qa_smoke_permanent_token_2026"

OWN_CHILD   = "00000000-0000-0000-0000-000000000013"  # Даша, своя семья, есть guardianship
OTHER_CHILD = "f0b4b417-9228-4d98-a0e1-65ba92a4ea2f"  # Илья, ЧУЖАЯ семья
OTHER_FAM   = "ca92a40b-8e92-4709-9dca-54f52f86d364"

def call(url, method, body=None, headers=None, q=""):
    req = urllib.request.Request(url + q, method=method,
        data=json.dumps(body).encode() if body else None,
        headers={"Content-Type": "application/json", **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read()[:200].decode(errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read()[:200].decode(errors="replace")

AUTH = {"X-Auth-Token": TOKEN}
cases = [
 ("POSITIVE own child calendar read", 200, CC,"POST",{"action":"get_child_events","childId":OWN_CHILD},AUTH,""),
 ("POSITIVE list without childId",    200, CC,"POST",{"action":"get_child_events"},AUTH,""),
 ("NEG cross-family child read",      403, CC,"POST",{"action":"get_child_events","childId":OTHER_CHILD},AUTH,""),
 ("NEG spoofed familyId in body",     404, CC,"POST",{"action":"get_child_events","childId":OWN_CHILD,"familyId":OTHER_FAM},AUTH,""),
 ("NEG no session",                   401, CC,"POST",{"action":"get_child_events","childId":OWN_CHILD},None,""),
 ("NEG X-User-Id spoof only",         401, CC,"POST",{"action":"get_child_events","childId":OWN_CHILD},{"X-User-Id":OWN_CHILD},""),
 ("NEG delete foreign event",         404, CC,"POST",{"action":"delete_child_event","eventId":"00000000-0000-0000-0000-0000000000ff"},AUTH,""),
 ("POSITIVE children-data own",       200, CD,"GET",None,AUTH,"?child_id="+OWN_CHILD+"&type=health"),
 ("NEG children-data cross-family",   404, CD,"GET",None,AUTH,"?child_id="+OTHER_CHILD+"&type=health"),
 ("NEG children-data fake token",     401, CD,"GET",None,{"X-Auth-Token":"test-token"},"?child_id="+OWN_CHILD+"&type=health"),
]
ok=0
for name, exp, url, m, body, h, q in cases:
    st, txt = call(url, m, body, h, q)
    good = (st == exp)
    ok += good
    print(("PASS " if good else "FAIL ")+f"[{st} exp {exp}] {name}")
    if not good: print("        ", txt[:160].replace("\n"," "))
print(f"\n{ok}/{len(cases)} passed")
