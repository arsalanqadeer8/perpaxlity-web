import re

html_path = 'H:/web/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

realtime_logic = """
    let realtimeSub = null;
    let _lastPushTime = 0;
    function setupRealtime() {
      if (!_sb || realtimeSub || curRole === 'student' || curRole === 'parent') return;
      realtimeSub = _sb.channel('public:db_snapshot')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'db_snapshot' }, payload => {
          if (!payload.new || !payload.new.data) return;
          const diff = Math.abs(new Date(payload.new.updated_at) - new Date(_lastPushTime));
          if (diff < 5000) return; // Ignore echoes of our own pushes

          DB = payload.new.data;
          saveLocalDB();
          
          if (document.querySelector('.modal')) {
             showToast('Data updated by another user! (Changes will appear after you close this modal)', 'tw2', 5000);
          } else {
             buildShell();
             showToast('Live update synced', 'ts');
          }
        })
        .subscribe();
    }
"""

content = content.replace("function setCurrentUser(u) {", realtime_logic + "\n    function setCurrentUser(u) {\n      setupRealtime();")

# Update pushCloudDB to set _lastPushTime
push_logic_old = "await _sb.from('db_snapshot').upsert({ id: 1, data: DB, updated_at: new Date().toISOString() });"
push_logic_new = "_lastPushTime = new Date().toISOString();\n        await _sb.from('db_snapshot').upsert({ id: 1, data: DB, updated_at: _lastPushTime });"
content = content.replace(push_logic_old, push_logic_new)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Realtime updates applied successfully.")
