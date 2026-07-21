
/* ---------- storage ---------- */
const STORE_KEY = 'pid-fms-data-v1';
let DATA = {
  orgName:'', msEmail:'', waNumber:'', myName:'', currentRole:'admin',
  centres:[], users:[],
  assets:[], workOrders:[], pmTasks:[], projects:[], incidents:[], inspections:[],
  seq:{asset:0,wo:0,pm:0,proj:0,inc:0,insp:0,user:0}
};

async function loadData(){
  try{
    const res = await window.storage.get(STORE_KEY, false);
    if(res && res.value){ DATA = JSON.parse(res.value); }
    else { seedDemoData(); await persist(); }
  }catch(e){
    seedDemoData();
  }
  renderAll();
}
async function persist(){
  try{ await window.storage.set(STORE_KEY, JSON.stringify(DATA), false); }
  catch(e){ showToast('Could not save â€” data will not persist'); }
}
function nextId(prefix, key){
  DATA.seq[key] = (DATA.seq[key]||0) + 1;
  return prefix + '-' + String(DATA.seq[key]).padStart(4,'0');
}

/* ---------- demo seed (first run only) ---------- */
function seedDemoData(){
  DATA.orgName = '';
  DATA.myName = 'T. Nkosi';
  const today = new Date();
  const d = (n)=>{ const t = new Date(today); t.setDate(t.getDate()+n); return t.toISOString().slice(0,10); };
  DATA.centres = ['Head Office â€“ Pretoria', 'Cape Town Depot', 'Durban Site'];
  DATA.users = [
    {id:nextId('USR','user'), name:'T. Nkosi', role:'intern', centre:'Head Office â€“ Pretoria', contact:'t.nkosi@company.com'},
    {id:nextId('USR','user'), name:'S. Botha', role:'technician', centre:'Head Office â€“ Pretoria', contact:'s.botha@company.com'},
    {id:nextId('USR','user'), name:'L. Marais', role:'hq', centre:'Cape Town Depot', contact:'l.marais@company.com'},
  ];
  DATA.assets = [
    {id:nextId('AST','asset'), name:'Rooftop AHU 1', category:'HVAC', location:'Building A â€“ Roof', centre:'Head Office â€“ Pretoria', gps:{lat:-25.7479,lng:28.2293}, status:'operational', purchaseDate:'2021-03-10', value:185000},
    {id:nextId('AST','asset'), name:'Backup Generator', category:'Electrical', location:'Building A â€“ Basement', centre:'Head Office â€“ Pretoria', gps:{lat:-25.7482,lng:28.2288}, status:'maintenance', purchaseDate:'2019-11-02', value:420000},
    {id:nextId('AST','asset'), name:'Fire Pump Set', category:'Fire Safety', location:'Building B â€“ Plant Room', centre:'Cape Town Depot', gps:{lat:-33.9249,lng:18.4241}, status:'operational', purchaseDate:'2020-06-18', value:96000},
    {id:nextId('AST','asset'), name:'Lift 2', category:'Vertical Transport', location:'Building A â€“ Core', centre:'Durban Site', gps:{lat:-29.8587,lng:31.0218}, status:'down', purchaseDate:'2018-01-25', value:610000},
  ];
  DATA.workOrders = [
    {id:nextId('WO','wo'), title:'Lift 2 â€“ motor fault', assetId:DATA.assets[3].id, type:'corrective', priority:'critical', status:'in_progress', assignedTo:'T. Nkosi', createdDate:d(-2), dueDate:d(1), description:'Lift stopped between floors 3-4, motor overheating.'},
    {id:nextId('WO','wo'), title:'Generator load test', assetId:DATA.assets[1].id, type:'preventive', priority:'medium', status:'open', assignedTo:'S. Botha', createdDate:d(-1), dueDate:d(4), description:'Quarterly load bank test.'},
    {id:nextId('WO','wo'), title:'AHU filter replacement', assetId:DATA.assets[0].id, type:'preventive', priority:'low', status:'completed', assignedTo:'T. Nkosi', createdDate:d(-10), dueDate:d(-6), description:'Routine filter swap.'},
  ];
  DATA.pmTasks = [
    {id:nextId('PM','pm'), assetId:DATA.assets[2].id, task:'Fire pump weekly run test', frequency:'Weekly', lastDone:d(-4), nextDue:d(3), assignedTo:'S. Botha'},
    {id:nextId('PM','pm'), assetId:DATA.assets[0].id, task:'AHU belt inspection', frequency:'Monthly', lastDone:d(-20), nextDue:d(-1), assignedTo:'T. Nkosi'},
  ];
  DATA.projects = [
    {id:nextId('PRJ','proj'), name:'Lift modernization â€“ Building A', status:'in_progress', startDate:d(-30), endDate:d(60), budget:1200000,
      tasks:[{id:'t1',name:'Vendor selection',done:true},{id:'t2',name:'Site survey',done:true},{id:'t3',name:'Parts procurement',done:false},{id:'t4',name:'Installation',done:false}]}
  ];
  DATA.incidents = [
    {id:nextId('INC','inc'), date:d(-5), type:'Near miss', location:'Building B â€“ Loading bay', severity:'low', description:'Forklift near miss with pedestrian, no contact.', status:'closed', reportedBy:'S. Botha'}
  ];
  DATA.inspections = [
    {id:nextId('INSP','insp'), area:'Building A â€“ Fire escapes', date:d(-7), inspector:'T. Nkosi', result:'pass', notes:'All clear, signage intact.'}
  ];
}

/* ---------- helpers ---------- */
function assetById(id){ return DATA.assets.find(a=>a.id===id); }
function fmtDate(s){ if(!s) return 'â€”'; const dt=new Date(s+'T00:00:00'); return dt.toLocaleDateString('en-ZA',{day:'2-digit',month:'short',year:'numeric'}); }
function fmtMoney(n){ return 'R ' + Number(n||0).toLocaleString('en-ZA'); }
function daysUntil(s){ const t=new Date(s+'T00:00:00'); const now=new Date(); now.setHours(0,0,0,0); return Math.round((t-now)/86400000); }
function showToast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(window._toastTimer); window._toastTimer=setTimeout(()=>t.classList.remove('show'),2200); }

const STATUS_PILL = {
  operational:['good','Operational'], maintenance:['warn','In maintenance'], down:['crit','Down'],
  open:['info','Open'], in_progress:['warn','In progress'], completed:['good','Completed'], on_hold:['neutral','On hold'],
  low:['neutral','Low'], medium:['info','Medium'], high:['warn','High'], critical:['crit','Critical'],
  pass:['good','Pass'], fail:['crit','Fail'], closed:['neutral','Closed'], planned:['neutral','Planned']
};
function pill(key){ const [cls,label] = STATUS_PILL[key] || ['neutral', key]; return `<span class="pill ${cls}">${label}</span>`; }

/* ---------- nav ---------- */
document.querySelectorAll('.navitem[data-view]').forEach(item=>{
  item.addEventListener('click', ()=>{
    document.querySelectorAll('.navitem').forEach(i=>i.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('view-'+item.dataset.view).classList.add('active');
  });
});

/* ---------- role switching ---------- */
const ROLE_LABELS = {
  admin: 'Full control: all centres, assets, work, people and settings.',
  hq: 'Cross-centre oversight and reporting. No settings access.',
  intern: 'Scoped to your own assigned work orders and maintenance tasks.'
};
document.querySelectorAll('.role-btn').forEach(btn=>{
  btn.addEventListener('click', ()=> setRole(btn.dataset.role));
});
function setRole(role){
  DATA.currentRole = role;
  persist();
  document.querySelectorAll('.role-btn').forEach(b=>b.classList.toggle('active', b.dataset.role===role));
  document.getElementById('role-note').textContent = ROLE_LABELS[role];
  document.querySelectorAll('[data-roles]').forEach(el=>{
    const roles = el.dataset.roles.split(',');
    el.style.display = roles.includes(role) ? '' : 'none';
  });
  // if current active view isn't allowed for this role, jump to overview
  const activeView = document.querySelector('.view.active');
  const activeNav = document.querySelector('.navitem.active');
  if(activeNav && activeNav.dataset.roles && !activeNav.dataset.roles.split(',').includes(role)){
    document.querySelectorAll('.navitem').forEach(i=>i.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.querySelector('.navitem[data-view="overview"]').classList.add('active');
    document.getElementById('view-overview').classList.add('active');
  }
  renderOverview();
}

/* ---------- modal engine ---------- */
function openModal(html){
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('overlay').classList.add('active');
}
function closeModal(){ document.getElementById('overlay').classList.remove('active'); }
document.getElementById('overlay').addEventListener('click', (e)=>{ if(e.target.id==='overlay') closeModal(); });

/* ---------- ASSETS ---------- */
function openAssetModal(){
  openModal(`
    <h3>Register asset</h3><div class="modal-sub">Add a new tracked facility asset</div>
    <div class="field"><label>Name</label><input id="f-name" placeholder="e.g. Rooftop AHU 2"></div>
    <div class="row2">
      <div class="field"><label>Category</label><input id="f-cat" placeholder="e.g. HVAC"></div>
      <div class="field"><label>Location</label><input id="f-loc" placeholder="e.g. Building A â€“ Roof"></div>
    </div>
    <div class="row2">
      <div class="field"><label>Status</label><select id="f-status"><option value="operational">Operational</option><option value="maintenance">In maintenance</option><option value="down">Down</option></select></div>
      <div class="field"><label>Value (R)</label><input id="f-value" type="number" placeholder="0"></div>
    </div>
    <div class="row2">
      <div class="field"><label>Centre</label><select id="f-centre">${centreOptions()}</select></div>
      <div class="field"><label>Purchase date</label><input id="f-date" type="date"></div>
    </div>
    <div class="row2">
      <div class="field"><label>GPS latitude</label><input id="f-lat" type="number" step="0.0001" placeholder="e.g. -25.7479"></div>
      <div class="field"><label>GPS longitude</label><input id="f-lng" type="number" step="0.0001" placeholder="e.g. 28.2293"></div>
    </div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-accent" onclick="saveAsset()">Register asset</button></div>
  `);
}
function saveAsset(){
  const name = document.getElementById('f-name').value.trim();
  if(!name){ showToast('Asset name is required'); return; }
  const lat = parseFloat(document.getElementById('f-lat').value);
  const lng = parseFloat(document.getElementById('f-lng').value);
  DATA.assets.push({
    id: nextId('AST','asset'), name,
    category: document.getElementById('f-cat').value.trim() || 'Uncategorized',
    location: document.getElementById('f-loc').value.trim() || 'â€”',
    centre: document.getElementById('f-centre').value || (DATA.centres[0]||''),
    status: document.getElementById('f-status').value,
    value: Number(document.getElementById('f-value').value) || 0,
    purchaseDate: document.getElementById('f-date').value || '',
    gps: (!isNaN(lat) && !isNaN(lng)) ? {lat,lng} : null
  });
  persist(); closeModal(); renderAll(); showToast('Asset registered');
}
function deleteAsset(id){
  DATA.assets = DATA.assets.filter(a=>a.id!==id);
  persist(); renderAll(); showToast('Asset removed');
}
function renderAssets(){
  const body = document.getElementById('assets-body');
  document.getElementById('nav-assets-count').textContent = DATA.assets.length;
  if(DATA.assets.length===0){ body.innerHTML=''; document.getElementById('assets-empty').style.display='block'; return; }
  document.getElementById('assets-empty').style.display='none';
  body.innerHTML = DATA.assets.map(a=>`
    <tr>
      <td><span class="tag">${a.id}</span></td>
      <td>${a.name}</td>
      <td>${a.category}</td>
      <td>${a.centre? '<span class="centre-chip">'+a.centre+'</span>' : 'â€”'}</td>
      <td>${a.location}</td>
      <td>${pill(a.status)}</td>
      <td style="font-family:var(--font-mono);">${fmtMoney(a.value)}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteAsset('${a.id}')">Remove</button></td>
    </tr>`).join('');
}

/* ---------- WORK ORDERS ---------- */
function assetOptions(selectedId){
  return DATA.assets.map(a=>`<option value="${a.id}" ${a.id===selectedId?'selected':''}>${a.name} (${a.id})</option>`).join('') || '<option value="">No assets registered</option>';
}
function openWOModal(){
  openModal(`
    <h3>New work order</h3><div class="modal-sub">Allocate work to a team member</div>
    <div class="field"><label>Title</label><input id="f-title" placeholder="e.g. Replace AHU belt"></div>
    <div class="row2">
      <div class="field"><label>Asset</label><select id="f-asset">${assetOptions()}</select></div>
      <div class="field"><label>Type</label><select id="f-type"><option value="corrective">Corrective</option><option value="preventive">Preventive</option><option value="project">Project-linked</option></select></div>
    </div>
    <div class="row2">
      <div class="field"><label>Priority</label><select id="f-priority"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
      <div class="field"><label>Assigned to</label><input id="f-assignee" placeholder="Name"></div>
    </div>
    <div class="field"><label>Due date</label><input id="f-due" type="date"></div>
    <div class="field"><label>Description</label><textarea id="f-desc" placeholder="What needs to be done"></textarea></div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-accent" onclick="saveWO()">Create work order</button></div>
  `);
}
function saveWO(){
  const title = document.getElementById('f-title').value.trim();
  if(!title){ showToast('Title is required'); return; }
  DATA.workOrders.push({
    id: nextId('WO','wo'), title,
    assetId: document.getElementById('f-asset').value,
    type: document.getElementById('f-type').value,
    priority: document.getElementById('f-priority').value,
    status: 'open',
    assignedTo: document.getElementById('f-assignee').value.trim() || 'Unassigned',
    createdDate: new Date().toISOString().slice(0,10),
    dueDate: document.getElementById('f-due').value || '',
    description: document.getElementById('f-desc').value.trim()
  });
  persist(); closeModal(); renderAll(); showToast('Work order created');
}
function cycleWOStatus(id){
  const order = ['open','in_progress','completed','on_hold'];
  const wo = DATA.workOrders.find(w=>w.id===id);
  wo.status = order[(order.indexOf(wo.status)+1)%order.length];
  persist(); renderAll();
}
function deleteWO(id){ DATA.workOrders = DATA.workOrders.filter(w=>w.id!==id); persist(); renderAll(); showToast('Work order removed'); }

function renderWorkOrders(){
  const body = document.getElementById('wo-body');
  document.getElementById('nav-wo-count').textContent = DATA.workOrders.filter(w=>w.status!=='completed').length;
  if(DATA.workOrders.length===0){ body.innerHTML=''; document.getElementById('wo-empty').style.display='block'; return; }
  document.getElementById('wo-empty').style.display='none';
  body.innerHTML = DATA.workOrders.slice().sort((a,b)=> (a.dueDate||'9999').localeCompare(b.dueDate||'9999')).map(w=>{
    const asset = assetById(w.assetId);
    return `<tr>
      <td><span class="tag">${w.id}</span></td>
      <td>${w.title}</td>
      <td>${asset? asset.name : 'â€”'}</td>
      <td style="text-transform:capitalize;">${w.type}</td>
      <td>${pill(w.priority)}</td>
      <td>${w.assignedTo}</td>
      <td>${fmtDate(w.dueDate)}</td>
      <td><span style="cursor:pointer;" onclick="cycleWOStatus('${w.id}')" title="Click to advance status">${pill(w.status)}</span></td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteWO('${w.id}')">Remove</button></td>
    </tr>`;
  }).join('');
}

/* ---------- PM / MAINTENANCE ---------- */
function openPMModal(){
  openModal(`
    <h3>Schedule maintenance task</h3><div class="modal-sub">Recurring preventive maintenance</div>
    <div class="field"><label>Asset</label><select id="f-asset">${assetOptions()}</select></div>
    <div class="field"><label>Task</label><input id="f-task" placeholder="e.g. Belt inspection"></div>
    <div class="row2">
      <div class="field"><label>Frequency</label><select id="f-freq"><option>Weekly</option><option>Monthly</option><option>Quarterly</option><option>Annually</option></select></div>
      <div class="field"><label>Assigned to</label><input id="f-assignee" placeholder="Name"></div>
    </div>
    <div class="row2">
      <div class="field"><label>Last done</label><input id="f-last" type="date"></div>
      <div class="field"><label>Next due</label><input id="f-next" type="date"></div>
    </div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-accent" onclick="savePM()">Schedule task</button></div>
  `);
}
function savePM(){
  const task = document.getElementById('f-task').value.trim();
  if(!task){ showToast('Task name is required'); return; }
  DATA.pmTasks.push({
    id: nextId('PM','pm'), assetId: document.getElementById('f-asset').value, task,
    frequency: document.getElementById('f-freq').value,
    assignedTo: document.getElementById('f-assignee').value.trim() || 'Unassigned',
    lastDone: document.getElementById('f-last').value || '',
    nextDue: document.getElementById('f-next').value || ''
  });
  persist(); closeModal(); renderAll(); showToast('Maintenance task scheduled');
}
function deletePM(id){ DATA.pmTasks = DATA.pmTasks.filter(p=>p.id!==id); persist(); renderAll(); showToast('Task removed'); }
function renderPM(){
  const body = document.getElementById('pm-body');
  const overdue = DATA.pmTasks.filter(p=>p.nextDue && daysUntil(p.nextDue)<0).length;
  document.getElementById('nav-pm-count').textContent = overdue || DATA.pmTasks.length;
  document.querySelector('[data-view="maintenance"]').classList.toggle('critical', overdue>0);
  if(DATA.pmTasks.length===0){ body.innerHTML=''; document.getElementById('pm-empty').style.display='block'; return; }
  document.getElementById('pm-empty').style.display='none';
  body.innerHTML = DATA.pmTasks.map(p=>{
    const asset = assetById(p.assetId);
    const overdueFlag = p.nextDue && daysUntil(p.nextDue)<0;
    return `<tr>
      <td>${asset? asset.name : 'â€”'}</td>
      <td>${p.task}</td>
      <td>${p.frequency}</td>
      <td>${fmtDate(p.lastDone)}</td>
      <td>${overdueFlag? '<span class="pill crit">'+fmtDate(p.nextDue)+' overdue</span>' : fmtDate(p.nextDue)}</td>
      <td>${p.assignedTo}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deletePM('${p.id}')">Remove</button></td>
    </tr>`;
  }).join('');
}

/* ---------- PROJECTS ---------- */
function openProjectModal(){
  openModal(`
    <h3>New project</h3><div class="modal-sub">Track a capital works or multi-step initiative</div>
    <div class="field"><label>Project name</label><input id="f-name" placeholder="e.g. Lift modernization"></div>
    <div class="row2">
      <div class="field"><label>Start date</label><input id="f-start" type="date"></div>
      <div class="field"><label>End date</label><input id="f-end" type="date"></div>
    </div>
    <div class="field"><label>Budget (R)</label><input id="f-budget" type="number" placeholder="0"></div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-accent" onclick="saveProject()">Create project</button></div>
  `);
}
function saveProject(){
  const name = document.getElementById('f-name').value.trim();
  if(!name){ showToast('Project name is required'); return; }
  DATA.projects.push({
    id: nextId('PRJ','proj'), name, status:'in_progress',
    startDate: document.getElementById('f-start').value || '',
    endDate: document.getElementById('f-end').value || '',
    budget: Number(document.getElementById('f-budget').value)||0,
    tasks: []
  });
  persist(); closeModal(); renderAll(); showToast('Project created');
}
function addProjectTask(projId){
  const name = prompt('Task name');
  if(!name) return;
  const proj = DATA.projects.find(p=>p.id===projId);
  proj.tasks.push({id:'t'+Date.now(), name, done:false});
  persist(); renderAll();
}
function toggleTask(projId, taskId){
  const proj = DATA.projects.find(p=>p.id===projId);
  const t = proj.tasks.find(t=>t.id===taskId);
  t.done = !t.done;
  persist(); renderAll();
}
function deleteProject(id){ DATA.projects = DATA.projects.filter(p=>p.id!==id); persist(); renderAll(); showToast('Project removed'); }
function renderProjects(){
  const list = document.getElementById('projects-list');
  document.getElementById('nav-proj-count').textContent = DATA.projects.filter(p=>p.status!=='completed').length;
  document.getElementById('projects-empty').style.display = DATA.projects.length===0 ? 'block' : 'none';
  list.innerHTML = DATA.projects.map(p=>{
    const done = p.tasks.filter(t=>t.done).length;
    const pct = p.tasks.length ? Math.round(done/p.tasks.length*100) : 0;
    return `<div class="panel">
      <div class="panel-head">
        <div><h2><span class="tag">${p.id}</span> &nbsp;${p.name}</h2><div class="sub">${fmtDate(p.startDate)} â†’ ${fmtDate(p.endDate)} Â· Budget ${fmtMoney(p.budget)}</div></div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-ghost btn-sm" onclick="addProjectTask('${p.id}')">+ Task</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProject('${p.id}')">Remove</button>
        </div>
      </div>
      <div class="bar-row" style="grid-template-columns:110px 1fr 40px;margin-bottom:12px;">
        <span>Progress</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%;"></div></div><span>${pct}%</span>
      </div>
      <div class="checklist">
        ${p.tasks.length? p.tasks.map(t=>`<div class="item ${t.done?'done':''}"><input type="checkbox" ${t.done?'checked':''} onchange="toggleTask('${p.id}','${t.id}')"><span class="t">${t.name}</span></div>`).join('') : '<div style="color:var(--ink-soft);font-size:12.5px;padding:4px 2px;">No tasks yet â€” add milestones to track progress.</div>'}
      </div>
    </div>`;
  }).join('');
}

/* ---------- OHSA: incidents & inspections ---------- */
function openIncidentModal(){
  openModal(`
    <h3>Report incident</h3><div class="modal-sub">Occupational health &amp; safety incident record</div>
    <div class="row2">
      <div class="field"><label>Date</label><input id="f-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
      <div class="field"><label>Type</label><input id="f-type" placeholder="e.g. Near miss, Injury, Spill"></div>
    </div>
    <div class="row2">
      <div class="field"><label>Location</label><input id="f-loc" placeholder="e.g. Building B â€“ Loading bay"></div>
      <div class="field"><label>Severity</label><select id="f-sev"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
    </div>
    <div class="field"><label>Reported by</label><input id="f-reporter" placeholder="Name"></div>
    <div class="field"><label>Description</label><textarea id="f-desc" placeholder="What happened"></textarea></div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-accent" onclick="saveIncident()">Report incident</button></div>
  `);
}
function saveIncident(){
  const type = document.getElementById('f-type').value.trim();
  if(!type){ showToast('Incident type is required'); return; }
  DATA.incidents.push({
    id: nextId('INC','inc'), date: document.getElementById('f-date').value, type,
    location: document.getElementById('f-loc').value.trim() || 'â€”',
    severity: document.getElementById('f-sev').value, status:'open',
    reportedBy: document.getElementById('f-reporter').value.trim() || 'â€”',
    description: document.getElementById('f-desc').value.trim()
  });
  persist(); closeModal(); renderAll(); showToast('Incident reported');
}
function closeIncident(id){ const inc = DATA.incidents.find(i=>i.id===id); inc.status = inc.status==='open'?'closed':'open'; persist(); renderAll(); }
function deleteIncident(id){ DATA.incidents = DATA.incidents.filter(i=>i.id!==id); persist(); renderAll(); showToast('Incident removed'); }

function openInspectionModal(){
  openModal(`
    <h3>Log inspection</h3><div class="modal-sub">Safety walkthrough record</div>
    <div class="row2">
      <div class="field"><label>Area</label><input id="f-area" placeholder="e.g. Building A â€“ Fire escapes"></div>
      <div class="field"><label>Date</label><input id="f-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
    </div>
    <div class="row2">
      <div class="field"><label>Inspector</label><input id="f-inspector" placeholder="Name"></div>
      <div class="field"><label>Result</label><select id="f-result"><option value="pass">Pass</option><option value="fail">Fail</option></select></div>
    </div>
    <div class="field"><label>Notes</label><textarea id="f-notes" placeholder="Findings"></textarea></div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button><button class="btn btn-accent" onclick="saveInspection()">Log inspection</button></div>
  `);
}
function saveInspection(){
  const area = document.getElementById('f-area').value.trim();
  if(!area){ showToast('Area is required'); return; }
  DATA.inspections.push({
    id: nextId('INSP','insp'), area, date: document.getElementById('f-date').value,
    inspector: document.getElementById('f-inspector').value.trim() || 'â€”',
    result: document.getElementById('f-result').value,
    notes: document.getElementById('f-notes').value.trim()
  });
  persist(); closeModal(); renderAll(); showToast('Inspection logged');
}
function deleteInspection(id){ DATA.inspections = DATA.inspections.filter(i=>i.id!==id); persist(); renderAll(); showToast('Inspection removed'); }

function renderOHSA(){
  document.getElementById('nav-ohsa-count').textContent = DATA.incidents.filter(i=>i.status==='open').length;
  document.querySelector('[data-view="ohsa"]').classList.toggle('critical', DATA.incidents.some(i=>i.status==='open' && (i.severity==='high'||i.severity==='critical')));

  const incBody = document.getElementById('incidents-body');
  document.getElementById('incidents-empty').style.display = DATA.incidents.length===0 ? 'block' : 'none';
  incBody.innerHTML = DATA.incidents.slice().reverse().map(i=>`
    <tr>
      <td><span class="tag">${i.id}</span></td>
      <td>${fmtDate(i.date)}</td>
      <td>${i.type}</td>
      <td>${i.location}</td>
      <td>${pill(i.severity)}</td>
      <td><span style="cursor:pointer;" onclick="closeIncident('${i.id}')" title="Click to toggle">${pill(i.status)}</span></td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteIncident('${i.id}')">Remove</button></td>
    </tr>`).join('');

  const inspBody = document.getElementById('inspections-body');
  document.getElementById('inspections-empty').style.display = DATA.inspections.length===0 ? 'block' : 'none';
  inspBody.innerHTML = DATA.inspections.slice().reverse().map(i=>`
    <tr>
      <td><span class="tag">${i.id}</span></td>
      <td>${i.area}</td>
      <td>${fmtDate(i.date)}</td>
      <td>${i.inspector}</td>
      <td>${pill(i.result)}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteInspection('${i.id}')">Remove</button></td>
    </tr>`).join('');
}

/* ---------- OVERVIEW ---------- */
function gaugeStyle(pct, color){
  return `background:conic-gradient(${color} ${pct*3.6}deg, #E7EAE5 0deg);`;
}
function renderOverview(){
  document.getElementById('overview-date').textContent = new Date().toLocaleDateString('en-ZA',{weekday:'long', day:'numeric', month:'long', year:'numeric'});

  const openWO = DATA.workOrders.filter(w=>w.status!=='completed').length;
  const overdueWO = DATA.workOrders.filter(w=>w.status!=='completed' && w.dueDate && daysUntil(w.dueDate)<0).length;
  const downAssets = DATA.assets.filter(a=>a.status==='down').length;
  const openIncidents = DATA.incidents.filter(i=>i.status==='open').length;

  const kpis = [
    {label:'Open work orders', value:openWO, pct: DATA.workOrders.length? Math.round(openWO/DATA.workOrders.length*100):0, color:'var(--info)'},
    {label:'Overdue work', value:overdueWO, pct: openWO? Math.round(overdueWO/Math.max(openWO,1)*100):0, color:'var(--crit)'},
    {label:'Assets down', value:downAssets, pct: DATA.assets.length? Math.round(downAssets/DATA.assets.length*100):0, color:'var(--warn)'},
    {label:'Open safety items', value:openIncidents, pct: DATA.incidents.length? Math.round(openIncidents/DATA.incidents.length*100):0, color:'var(--crit)'},
  ];
  document.getElementById('kpi-row').innerHTML = kpis.map(k=>`
    <div class="kpi">
      <div class="gauge" style="${gaugeStyle(k.pct,k.color)}"><span>${k.value}</span></div>
      <div><div class="kpi-label">${k.label}</div><div class="kpi-value">${k.value}</div></div>
    </div>`).join('');

  const upcoming = DATA.workOrders.filter(w=>w.status!=='completed').slice().sort((a,b)=>(a.dueDate||'9999').localeCompare(b.dueDate||'9999')).slice(0,6);
  document.getElementById('overview-wo-body').innerHTML = upcoming.length ? upcoming.map(w=>{
    const asset = assetById(w.assetId);
    return `<tr><td><span class="tag">${w.id}</span></td><td>${w.title}</td><td>${asset?asset.name:'â€”'}</td><td>${pill(w.priority)}</td><td>${fmtDate(w.dueDate)}</td><td>${pill(w.status)}</td></tr>`;
  }).join('') : `<tr><td colspan="6" style="color:var(--ink-soft);text-align:center;padding:20px;">No open work orders</td></tr>`;

  const statusCounts = {operational:0, maintenance:0, down:0};
  DATA.assets.forEach(a=>{ statusCounts[a.status] = (statusCounts[a.status]||0)+1; });
  const total = DATA.assets.length || 1;
  document.getElementById('asset-status-bars').innerHTML = Object.entries(statusCounts).map(([k,v])=>`
    <div class="bar-row"><span style="text-transform:capitalize;">${k}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(v/total*100)}%;background:${k==='operational'?'var(--good)':k==='down'?'var(--crit)':'var(--warn)'};"></div></div><span>${v}</span></div>
  `).join('');

  const safetyList = DATA.incidents.filter(i=>i.status==='open').slice(0,5);
  document.getElementById('overview-safety-list').innerHTML = safetyList.length ? safetyList.map(i=>`
    <div class="row"><div><div class="t">${i.type}</div><div class="s">${i.location} Â· ${fmtDate(i.date)}</div></div>${pill(i.severity)}</div>
  `).join('') : `<div style="color:var(--ink-soft);font-size:12.5px;padding:8px 2px;">No open safety items</div>`;

  renderRoleSpecificPanel();
}

function renderRoleSpecificPanel(){
  const el = document.getElementById('role-specific-panel');
  if(!el) return;
  const role = DATA.currentRole || 'admin';

  if(role === 'hq'){
    const byCentre = {};
    DATA.centres.forEach(c=>byCentre[c]={assets:0, open:0, down:0, incidents:0});
    DATA.assets.forEach(a=>{ if(!byCentre[a.centre]) byCentre[a.centre]={assets:0,open:0,down:0,incidents:0}; byCentre[a.centre].assets++; if(a.status==='down') byCentre[a.centre].down++; });
    DATA.workOrders.forEach(w=>{ const a=assetById(w.assetId); const c=a?a.centre:null; if(c && byCentre[c] && w.status!=='completed') byCentre[c].open++; });
    DATA.incidents.forEach(i=>{ /* incidents don't carry centre directly; best-effort by location text */ });
    el.innerHTML = `<div class="panel-head"><div><h2>HQ â€” cross-centre summary</h2><div class="sub">Roll-up across every registered centre</div></div></div>
      <table><thead><tr><th>Centre</th><th>Assets</th><th>Assets down</th><th>Open work orders</th></tr></thead><tbody>
      ${Object.keys(byCentre).length ? Object.entries(byCentre).map(([c,v])=>`<tr><td><span class="centre-chip">${c}</span></td><td>${v.assets}</td><td>${v.down? '<span class="pill crit">'+v.down+'</span>' : v.down}</td><td>${v.open}</td></tr>`).join('') : `<tr><td colspan="4" style="color:var(--ink-soft);text-align:center;padding:16px;">No centres set up yet â€” add them in Settings</td></tr>`}
      </tbody></table>`;
  } else if(role === 'intern'){
    const mine = DATA.workOrders.filter(w=>w.assignedTo===DATA.myName && w.status!=='completed');
    const myPM = DATA.pmTasks.filter(p=>p.assignedTo===DATA.myName && p.nextDue && daysUntil(p.nextDue)<=2);
    el.innerHTML = `<div class="panel-head"><div><h2>Welcome${DATA.myName? ', '+DATA.myName:''}</h2><div class="sub">Your open items across work orders and maintenance</div></div>
        <button class="btn btn-accent btn-sm" onclick="document.querySelector('[data-view=my-tasks]').click()">Open my work orders</button></div>
      <div class="list-simple">
        <div class="row"><span class="t">Open work orders assigned to you</span><span style="font-family:var(--font-mono);">${mine.length}</span></div>
        <div class="row"><span class="t">Maintenance tasks due within 2 days</span><span style="font-family:var(--font-mono);">${myPM.length}</span></div>
      </div>
      ${!DATA.myName ? '<div style="margin-top:10px;color:var(--ink-soft);font-size:12.5px;">Set your name under Settings â†’ Your session so tasks assigned to you show up here.</div>' : ''}`;
  } else {
    el.innerHTML = `<div class="panel-head"><div><h2>Admin â€” system health</h2><div class="sub">Centres, people and connections at a glance</div></div></div>
      <div class="list-simple">
        <div class="row"><span class="t">Centres configured</span><span style="font-family:var(--font-mono);">${DATA.centres.length}</span></div>
        <div class="row"><span class="t">Team members &amp; interns</span><span style="font-family:var(--font-mono);">${DATA.users.length}</span></div>
        <div class="row"><span class="t">Assets with GPS location</span><span style="font-family:var(--font-mono);">${DATA.assets.filter(a=>a.gps).length} / ${DATA.assets.length}</span></div>
        <div class="row"><span class="t">Microsoft 365 / WhatsApp</span><span class="pill neutral">Not connected</span></div>
      </div>`;
  }
}

/* ---------- REPORTS ---------- */
function renderReports(){
  const statuses = ['open','in_progress','completed','on_hold'];
  const counts = {}; statuses.forEach(s=>counts[s]=0);
  DATA.workOrders.forEach(w=>counts[w.status]=(counts[w.status]||0)+1);
  const max = Math.max(1, ...Object.values(counts));
  document.getElementById('report-wo-bars').innerHTML = statuses.map(s=>`
    <div class="bar-row"><span style="text-transform:capitalize;">${s.replace('_',' ')}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(counts[s]/max*100)}%;"></div></div><span>${counts[s]}</span></div>
  `).join('');

  const totalValue = DATA.assets.reduce((s,a)=>s+(a.value||0),0);
  const figures = [
    ['Total assets', DATA.assets.length],
    ['Total asset value', fmtMoney(totalValue)],
    ['Active projects', DATA.projects.filter(p=>p.status!=='completed').length],
    ['PM tasks scheduled', DATA.pmTasks.length],
    ['Incidents (all time)', DATA.incidents.length],
    ['Inspections logged', DATA.inspections.length],
  ];
  document.getElementById('report-figures').innerHTML = figures.map(([l,v])=>`<div class="row"><span class="t">${l}</span><span style="font-family:var(--font-mono);">${v}</span></div>`).join('');

  const overdueRows = [];
  DATA.workOrders.forEach(w=>{ if(w.status!=='completed' && w.dueDate && daysUntil(w.dueDate)<0){ const a=assetById(w.assetId); overdueRows.push(`<tr><td>Work order</td><td><span class="tag">${w.id}</span></td><td>${w.title}</td><td>${a?a.name:'â€”'}</td><td>${fmtDate(w.dueDate)}</td></tr>`);} });
  DATA.pmTasks.forEach(p=>{ if(p.nextDue && daysUntil(p.nextDue)<0){ const a=assetById(p.assetId); overdueRows.push(`<tr><td>Maintenance</td><td><span class="tag">${p.id}</span></td><td>${p.task}</td><td>${a?a.name:'â€”'}</td><td>${fmtDate(p.nextDue)}</td></tr>`);} });
  document.getElementById('report-overdue-body').innerHTML = overdueRows.join('');
  document.getElementById('report-overdue-empty').style.display = overdueRows.length===0 ? 'block' : 'none';
}

/* ---------- SETTINGS / EMAIL ---------- */
function saveEmail(){
  DATA.msEmail = document.getElementById('ms-email-input').value.trim();
  persist(); showToast('Saved');
}
function saveOrgName(){
  DATA.orgName = document.getElementById('org-name-input').value.trim();
  persist(); showToast('Saved');
  renderTopbar();
}
async function resetData(){
  if(!confirm('This will permanently delete all assets, work orders, maintenance, projects and safety records. Continue?')) return;
  DATA = {orgName:DATA.orgName, msEmail:DATA.msEmail, assets:[], workOrders:[], pmTasks:[], projects:[], incidents:[], inspections:[], seq:{asset:0,wo:0,pm:0,proj:0,inc:0,insp:0}};
  await persist(); renderAll(); showToast('All data cleared');
}
function renderTopbar(){
  document.getElementById('ms-email-input').value = DATA.msEmail || '';
  document.getElementById('org-name-input').value = DATA.orgName || '';
  const waInput = document.getElementById('wa-number-input'); if(waInput) waInput.value = DATA.waNumber || '';
  const nameInput = document.getElementById('my-name-input'); if(nameInput) nameInput.value = DATA.myName || '';
}

/* ---------- CENTRES ---------- */
function centreOptions(selected){
  return DATA.centres.map(c=>`<option value="${c}" ${c===selected?'selected':''}>${c}</option>`).join('') || '<option value="">No centres yet â€” add one in Settings</option>';
}
function addCentre(){
  const input = document.getElementById('f-centre-name');
  const name = input.value.trim();
  if(!name){ showToast('Centre name is required'); return; }
  if(DATA.centres.includes(name)){ showToast('That centre already exists'); return; }
  DATA.centres.push(name);
  input.value = '';
  persist(); renderCentres(); showToast('Centre added');
}
function removeCentre(name){
  DATA.centres = DATA.centres.filter(c=>c!==name);
  persist(); renderCentres(); showToast('Centre removed');
}
function renderCentres(){
  const el = document.getElementById('centres-list');
  if(!el) return;
  el.innerHTML = DATA.centres.length ? DATA.centres.map(c=>`
    <div class="user-row"><span class="centre-chip">${c}</span><button class="btn btn-danger btn-sm" onclick="removeCentre('${c}')">Remove</button></div>
  `).join('') : `<div style="color:var(--ink-soft);font-size:12.5px;">No centres yet. Add your first site or branch below.</div>`;
  const centreSelect = document.getElementById('f-user-centre');
  if(centreSelect) centreSelect.innerHTML = centreOptions();
}

/* ---------- USERS / INTERNS ---------- */
function addUser(){
  const name = document.getElementById('f-user-name').value.trim();
  if(!name){ showToast('Name is required'); return; }
  DATA.users.push({
    id: nextId('USR','user'), name,
    role: document.getElementById('f-user-role').value,
    centre: document.getElementById('f-user-centre').value || '',
    contact: document.getElementById('f-user-contact').value.trim()
  });
  document.getElementById('f-user-name').value = '';
  document.getElementById('f-user-contact').value = '';
  persist(); renderUsers(); showToast('Person added');
}
function removeUser(id){ DATA.users = DATA.users.filter(u=>u.id!==id); persist(); renderUsers(); showToast('Person removed'); }
const ROLE_TAG = {admin:['crit','Admin'], hq:['info','HQ'], intern:['warn','Centre intern'], technician:['neutral','Technician']};
function renderUsers(){
  const el = document.getElementById('users-list');
  if(!el) return;
  el.innerHTML = DATA.users.length ? DATA.users.map(u=>{
    const [cls,label] = ROLE_TAG[u.role] || ['neutral',u.role];
    const initials = u.name.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
    return `<div class="user-row">
      <div class="who"><div class="avatar">${initials}</div>
        <div><div style="font-weight:600;">${u.name}</div><div style="font-size:11.5px;color:var(--ink-soft);">${u.centre||'No centre'} ${u.contact? 'Â· '+u.contact:''}</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;"><span class="pill ${cls}">${label}</span><button class="btn btn-danger btn-sm" onclick="removeUser('${u.id}')">Remove</button></div>
    </div>`;
  }).join('') : `<div style="color:var(--ink-soft);font-size:12.5px;">No one added yet.</div>`;
}

/* ---------- WHATSAPP ---------- */
function saveWaNumber(){ DATA.waNumber = document.getElementById('wa-number-input').value.trim(); persist(); showToast('Saved'); }
function saveMyName(){ DATA.myName = document.getElementById('my-name-input').value.trim(); persist(); showToast('Saved'); }

/* ---------- SITE MAP (GPS) ---------- */
function renderSiteMap(){
  const svg = document.getElementById('sitemap-svg');
  if(!svg) return;
  const pts = DATA.assets.filter(a=>a.gps && typeof a.gps.lat==='number');
  if(pts.length===0){
    svg.innerHTML = `<foreignObject x="0" y="0" width="600" height="260"><div xmlns="http://www.w3.org/1999/xhtml" class="sitemap-empty">No assets have GPS coordinates yet.<br>Add latitude/longitude when registering an asset.</div></foreignObject>`;
    return;
  }
  const lats = pts.map(p=>p.gps.lat), lngs = pts.map(p=>p.gps.lng);
  const minLat=Math.min(...lats), maxLat=Math.max(...lats), minLng=Math.min(...lngs), maxLng=Math.max(...lngs);
  const padLat = (maxLat-minLat)||1, padLng=(maxLng-minLng)||1;
  const colorFor = {operational:'#2F8F7A', maintenance:'#D98C2B', down:'#C1443C'};
  let inner = `<rect x="0" y="0" width="600" height="260" fill="transparent"/>`;
  pts.forEach(a=>{
    const x = 40 + ((a.gps.lng-minLng)/padLng)*520;
    const y = 220 - ((a.gps.lat-minLat)/padLat)*180;
    inner += `<g class="sitemap-pin" onclick="showToast('${a.name.replace(/'/g,"")} â€” ${a.centre||'No centre'}')">
      <circle cx="${x}" cy="${y}" r="9" fill="${colorFor[a.status]||'#8C97A5'}"/>
      <text x="${x}" y="${y+22}" text-anchor="middle">${a.id}</text>
    </g>`;
  });
  svg.innerHTML = inner;
}

/* ---------- INTERN / MY TASKS ---------- */
function toggleMyWO(id){ cycleWOStatus(id); renderMyTasks(); }
function renderMyTasks(){
  const woEl = document.getElementById('my-wo-list');
  const pmEl = document.getElementById('my-pm-list');
  if(!woEl) return;
  const mine = DATA.workOrders.filter(w=>w.assignedTo===DATA.myName);
  woEl.innerHTML = mine.length ? mine.map(w=>{
    const asset = assetById(w.assetId);
    return `<div class="intern-card ${w.status==='completed'?'done':''}">
      <div><div class="t">${w.title}</div><div class="s">${asset?asset.name:'â€”'} Â· <span class="tag">${w.id}</span> Â· Due ${fmtDate(w.dueDate)}</div></div>
      <div style="display:flex;gap:8px;align-items:center;">${pill(w.priority)}<span style="cursor:pointer;" onclick="toggleMyWO('${w.id}')">${pill(w.status)}</span></div>
    </div>`;
  }).join('') : `<div style="color:var(--ink-soft);font-size:12.5px;">No work orders assigned to "${DATA.myName||'you'}" yet. Set your name in Settings.</div>`;

  const myPM = DATA.pmTasks.filter(p=>p.assignedTo===DATA.myName);
  pmEl.innerHTML = myPM.length ? myPM.map(p=>{
    const asset = assetById(p.assetId);
    const overdueFlag = p.nextDue && daysUntil(p.nextDue)<0;
    return `<div class="intern-card">
      <div><div class="t">${p.task}</div><div class="s">${asset?asset.name:'â€”'} Â· ${p.frequency}</div></div>
      ${overdueFlag? '<span class="pill crit">Overdue '+fmtDate(p.nextDue)+'</span>' : '<span class="pill neutral">Due '+fmtDate(p.nextDue)+'</span>'}
    </div>`;
  }).join('') : `<div style="color:var(--ink-soft);font-size:12.5px;">No maintenance tasks assigned to you yet.</div>`;
}

/* ---------- global search ---------- */
document.getElementById('global-search').addEventListener('keydown', (e)=>{
  if(e.key==='Enter'){
    const q = e.target.value.trim().toLowerCase();
    if(!q) return;
    const asset = DATA.assets.find(a=>a.id.toLowerCase()===q || a.name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q));
    const wo = DATA.workOrders.find(w=>w.id.toLowerCase()===q);
    if(wo){ document.querySelector('[data-view="workorders"]').click(); showToast('Found ' + wo.id); }
    else if(asset){ document.querySelector('[data-view="assets"]').click(); showToast('Found ' + asset.id); }
    else { showToast('No match found'); }
  }
});

/* ---------- render all ---------- */
function renderAll(){
  renderOverview();
  renderAssets();
  renderWorkOrders();
  renderPM();
  renderProjects();
  renderOHSA();
  renderReports();
  renderTopbar();
  renderCentres();
  renderUsers();
  renderSiteMap();
  renderMyTasks();
}

loadData().then(()=> setRole(DATA.currentRole || 'admin'));

