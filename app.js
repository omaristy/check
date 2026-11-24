// OMARIS CHECK - app bersama (ROLE = 'user' | 'admin')
const $=s=>document.querySelector(s),AD=ROLE==='admin',KEY='oc_'+ROLE,ST=AD?sessionStorage:localStorage;
const E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CAT={Motor:['🏍️',60,2000],Mobil:['🚗',90,5000],Rumah:['🏠',180,0],Elektronik:['🔌',90,0],Lainnya:['🛠️',90,0]};
const VEH=k=>k=='Motor'||k=='Mobil',today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
let S=JSON.parse(ST.getItem(KEY)||'null'),D={items:[],catatan:[],akun:[]},flt='all',fk='',tab='item',ip=null;
const toast=t=>{const e=$('#ts');e.textContent=t;e.style.display='block';setTimeout(()=>e.style.display='none',2600)};
const ld=v=>$('#ld').style.display=v?'flex':'none',cm=()=>$('#md').style.display='none',om=h=>{$('#mi').innerHTML=h;$('#md').style.display='flex'};
async function api(a,p={}){
  const au=AD?{au:S.u,ap:S.p}:{u:S.u,p:S.p};ld(1);
  try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:a,...au,...p})});
  const j=await r.json();if(!j.ok)throw new Error(j.msg);D=j;D.akun=D.akun||[];return j}finally{ld(0)}}
function login(){
  $('#hr').innerHTML='';
  $('#app').innerHTML=`<div class="hero"><img src="icons/icon-192.png" alt=""><h2 class="o" style="margin-top:8px;color:var(--c)">OMARIS <b style="color:var(--o)">CHECK</b></h2><div class="m">${AD?'Panel Admin':'Pantau perawatan motor, mobil, rumah & alat'}</div></div><div id="ib"></div>
  <div class="card"><label>Nama Akun</label><input id="u" autocapitalize="none" autocomplete="username"><label>Password</label><input id="p" type="password" autocomplete="current-password" onkeydown="if(event.key=='Enter')doLogin()">
  <button class="btn" style="width:100%" onclick="doLogin()">MASUK</button></div>`;ibar()}
async function doLogin(){S={u:$('#u').value.trim(),p:$('#p').value};try{await api('login');ST.setItem(KEY,JSON.stringify(S));home()}catch(e){toast(e.message)}}
function out(){ST.removeItem(KEY);S=null;login()}
// ---- status ----
const dd=s=>Math.floor((new Date()-new Date(s+'T00:00:00'))/864e5);
function st(m){
  const rs=D.catatan.filter(r=>r.item_id==m.id).sort((a,b)=>b.tanggal.localeCompare(a.tanggal));
  const rw=rs.find(r=>r.jenis=='Perawatan'),ih=+m.interval_hari||60,ik=+m.interval_km||0,maxKm=Math.max(0,...rs.map(r=>+r.km||0));
  if(!rw)return{lv:2,hari:null,txt:'BELUM PERNAH DIRAWAT',pct:1,rw,rs};
  const hari=dd(rw.tanggal),dk=ik&&rw.km?maxKm-(+rw.km):0;let lv=0;
  if(hari>ih||(ik&&dk>ik))lv=2;else if(ih-hari<=7||(ik&&ik-dk<=200))lv=1;
  return{lv,hari,dk,rw,rs,pct:Math.max(hari/ih,ik?dk/ik:0),txt:lv==2?(hari>ih?`TERLAMBAT ${hari-ih} HARI`:'TERLAMBAT (KM)'):lv==1?'SEGERA DIRAWAT':'KONDISI TERPANTAU'}}
function gauge(s){
  const p=Math.min(s.pct,1),col=['#39ff88','#ffd000','#ff3b5c'][s.lv],C=2*Math.PI*34;
  return `<svg class="gauge" viewBox="0 0 84 84"><circle cx="42" cy="42" r="34" fill="none" stroke="#1c2b44" stroke-width="8"/><circle cx="42" cy="42" r="34" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C*p} ${C}" transform="rotate(-90 42 42)" style="filter:drop-shadow(0 0 5px ${col})"/><text x="42" y="40" text-anchor="middle" fill="${col}" font-family="Orbitron" font-size="15" font-weight="800">${s.hari??'!'}</text><text x="42" y="54" text-anchor="middle" fill="#7f93b2" font-size="10">HARI</text></svg>`}
const ic=k=>(CAT[k]||CAT.Lainnya)[0],nm=u=>(D.akun.find(a=>a.username==u)||{}).nama||u;
const tabsH=()=>AD?`<div class="tabs"><button class="btn ${tab=='item'?'':'x'}" onclick="tab='item';home()">ITEM</button><button class="btn ${tab=='akun'?'':'x'}" onclick="tab='akun';home()">AKUN</button></div>`:'';
// ---- beranda ----
function home(){
  $('#hr').innerHTML=(AD?'':`<button class="btn x sm" onclick="fPass()">🔑</button> `)+`<button class="btn x sm" onclick="out()">KELUAR</button>`;
  if(AD&&tab=='akun')return akunView();
  let ms=D.items.map(m=>({m,s:st(m)})).sort((a,b)=>b.s.lv-a.s.lv);
  const tl=ms.filter(x=>x.s.lv==2).length,pr=ms.filter(x=>x.s.lv>0).length,ks=[...new Set(D.items.map(m=>m.kategori))];
  if(flt=='due')ms=ms.filter(x=>x.s.lv>0);if(fk)ms=ms.filter(x=>x.m.kategori==fk);
  $('#app').innerHTML=`<div id="ib"></div>${tabsH()}
  <div class="row sp"><h3 style="font-size:15px">${AD?'PANEL ADMIN':'ASET SAYA'}</h3><button class="btn o sm" onclick="fItem()">+ ITEM</button></div>
  ${pr?`<div class="alert">⚠ ${pr} item belum diservis / perlu perawatan (${tl} terlambat atau belum pernah dirawat)</div>`:''}
  <div class="row" style="margin:8px 0"><button class="btn sm ${flt=='all'?'':'x'}" onclick="flt='all';home()">SEMUA</button><button class="btn sm ${flt=='due'?'o':'x'}" onclick="flt='due';home()">PERLU DIRAWAT (${pr})</button>
  ${ks.length>1?`<select style="width:auto;margin:0" onchange="fk=this.value;home()"><option value="">Semua kategori</option>${ks.map(k=>`<option ${k==fk?'selected':''}>${E(k)}</option>`).join('')}</select>`:''}
  <button class="btn sm" onclick="fLap()">📄 LAPORAN PDF</button></div>
  ${ms.map(({m,s})=>`<div class="card l${s.lv}" onclick="detail('${m.id}')"><div class="row sp" style="flex-wrap:nowrap"><div class="row" style="flex-wrap:nowrap;align-items:flex-start;gap:10px">${m.foto?`<img class="thumb" loading="lazy" src="${th(m.foto,200)}" alt="">`:''}<div>
  <div class="o" style="font-size:16px">${ic(m.kategori)} ${E(m.nama)}</div><div class="m">${E(m.kategori)}${m.detail?' · '+E(m.detail):''}</div>
  ${AD?`<div class="m">Pemilik: ${E(nm(m.akun))}</div>`:''}
  <div class="pill p${s.lv}" style="margin-top:6px;display:inline-block">${s.txt}</div>
  <div class="m" style="font-size:14px;margin-top:4px">Terakhir dirawat: ${s.rw?E(s.rw.tanggal):'-'}</div>
  ${AD&&s.lv>0?`<button class="btn g sm" style="margin-top:8px" onclick="event.stopPropagation();wa('${m.id}')">📲 KIRIM WA PENGINGAT</button>`:''}</div></div>${gauge(s)}</div></div>`).join('')||'<div class="card m">Belum ada item. Tekan "+ ITEM".</div>'}`;ibar()}
function detail(id){
  const m=D.items.find(x=>x.id==id),s=st(m);
  $('#hr').innerHTML=`<button class="btn x sm" onclick="home()">← KEMBALI</button>`;
  $('#app').innerHTML=`<div class="card l${s.lv}">${m.foto?`<img class="hero-img" src="${th(m.foto,800)}" alt="" onclick="big('${th(m.foto,1200)}')">`:''}<div class="row sp" style="flex-wrap:nowrap"><div><div class="o">${ic(m.kategori)} ${E(m.nama)}</div><div class="m">${E(m.kategori)}${m.detail?' · '+E(m.detail):''}</div>
  ${AD?`<div class="m">Pemilik: ${E(nm(m.akun))}</div>`:''}<div class="m" style="font-size:14px">Interval: ${E(m.interval_hari||60)} hari${+m.interval_km?' / '+E(m.interval_km)+' km':''}</div>
  <div class="pill p${s.lv}" style="margin-top:6px;display:inline-block">${s.txt}</div></div>${gauge(s)}</div>
  <div class="row" style="margin-top:12px"><button class="btn o sm" onclick="fCatat('${m.id}')">+ CATAT</button><button class="btn sm" onclick="fLap('${m.id}')">📄 PDF</button><button class="btn x sm" onclick="fItem('${m.id}')">EDIT</button>
  ${AD?`<button class="btn g sm" onclick="wa('${m.id}')">KIRIM WA</button><button class="btn x sm" onclick="delM('${m.id}')">HAPUS</button>`:''}</div></div>
  <h3 style="font-size:14px;margin:16px 0 10px">RIWAYAT</h3><div class="tl">${s.rs.map(r=>`<div class="it ${r.jenis=='Perbaikan'?'rp':''}">
  <div class="row sp"><b class="o" style="font-size:13px">${E(r.jenis).toUpperCase()}</b><span class="m">${E(r.tanggal)}</span></div>
  <div>${E(r.keterangan)}</div><div class="m" style="font-size:14px">${r.km?E(r.km)+' km':''} ${r.biaya?'· Rp '+(+r.biaya).toLocaleString('id-ID'):''}</div>
  ${r.foto_link?`<div class="ph">${r.foto_link.split(' | ').map(l=>`<img loading="lazy" src="${th(l,400)}" onclick="big('${th(l,1200)}')">`).join('')}</div>`:''}
  ${AD?`<div class="row" style="margin-top:6px"><button class="btn g sm" onclick="wa('${m.id}','${r.id}')">WA dari riwayat ini</button><button class="btn x sm" onclick="delR('${r.id}','${m.id}')">Hapus</button></div>`:''}</div>`).join('')||'<div class="m">Belum ada riwayat.</div>'}</div>`}
const th=(l,w)=>'https://drive.google.com/thumbnail?id='+(l.match(/id=([^&]+)/)||[])[1]+'&sz=w'+w;
const big=u=>om(`<img src="${u}" style="width:100%;border-radius:10px"><button class="btn x" style="width:100%;margin-top:10px" onclick="cm()">TUTUP</button>`);
function wa(id,rid){
  const m=D.items.find(x=>x.id==id),s=st(m),a=D.akun.find(x=>x.username==m.akun)||{};let n=String(a.wa||'').replace(/\D/g,'');if(n[0]=='0')n='62'+n.slice(1);
  if(!n)return toast('Nomor WA pemilik belum diisi (menu AKUN)');
  const r=rid&&D.catatan.find(x=>x.id==rid);
  open('https://wa.me/'+n+'?text='+encodeURIComponent(`Halo ${a.nama||''}, ini pengingat dari Omaris Check.\n${m.kategori} ${m.nama}${m.detail?' ('+m.detail+')':''} ${s.rw?`terakhir dirawat ${s.rw.tanggal} (${s.hari} hari lalu)`:'belum tercatat pernah dirawat'}${r?`\nCatatan: ${r.jenis} ${r.tanggal} - ${r.keterangan}`:''}.\nMohon segera lakukan perawatan dan catat di aplikasi. Terima kasih 🙏`),'_blank')}
// ---- item ----
function fItem(id){
  const m=D.items.find(x=>x.id==id)||{kategori:'Motor'};
  om(`<h3 class="o" style="margin-bottom:10px">${id?'EDIT':'TAMBAH'} ITEM</h3>
  ${AD?`<label>Pemilik (akun)</label><select id="i_akun">${D.akun.map(a=>`<option value="${a.username}" ${a.username==m.akun?'selected':''}>${E(a.nama)} (@${a.username})</option>`).join('')}</select>`:''}
  <label>Kategori</label><select id="i_kat" onchange="katCh()">${Object.keys(CAT).map(k=>`<option ${k==m.kategori?'selected':''}>${k}</option>`).join('')}</select>
  <label>Nama</label><input id="i_nama" value="${E(m.nama)}" placeholder="Vario 160 / Brio / Rumah Utama / AC Kamar">
  <label>Detail (plat / alamat / merk / no. seri)</label><input id="i_det" value="${E(m.detail)}">
  <label>Interval perawatan (hari)</label><input id="i_ih" type="number" inputmode="numeric" value="${E(m.interval_hari??CAT[m.kategori][1])}">
  <div id="i_kmw"><label>Interval perawatan (km)</label><input id="i_ik" type="number" inputmode="numeric" value="${E(m.interval_km??CAT[m.kategori][2])}"></div>
  <label>Foto item (opsional, otomatis dikompres)</label>${m.foto?`<img class="thumb" style="width:80px;height:80px;display:block;margin-bottom:6px" src="${th(m.foto,200)}" alt="">`:''}<input id="i_ft" type="file" accept="image/*">
  <div class="row"><button class="btn" onclick="sItem('${id||''}')">SIMPAN</button><button class="btn x" onclick="cm()">BATAL</button></div>`);katCh(1)}
function katCh(init){const k=$('#i_kat').value;$('#i_kmw').style.display=VEH(k)?'':'none';if(!init){$('#i_ih').value=CAT[k][1];$('#i_ik').value=CAT[k][2]}}
async function sItem(id){
  const item={id,akun:AD?$('#i_akun')?.value:'',kategori:$('#i_kat').value,nama:$('#i_nama').value.trim(),detail:$('#i_det').value.trim(),interval_hari:$('#i_ih').value,interval_km:VEH($('#i_kat').value)?$('#i_ik').value:''};
  if(!item.nama)return toast('Nama wajib diisi');if(AD&&!item.akun)return toast('Buat akun pemilik dulu (menu AKUN)');
  try{const fl=$('#i_ft').files[0];ld(1);const foto=fl?await kompres(fl):'';await api('saveItem',{item,foto});cm();toast('Tersimpan ✓');id?detail(id):home()}catch(e){ld(0);toast(e.message)}}
async function delM(id){if(confirm('Hapus item ini? (catatan tetap ada di sheet)'))try{await api('delItem',{id});home()}catch(e){toast(e.message)}}
async function delR(id,m){if(confirm('Hapus riwayat ini?'))try{await api('delCatatan',{id});detail(m)}catch(e){toast(e.message)}}
// ---- catat ----
function fCatat(id){
  if(!D.items.length)return toast('Tambah item dulu');
  om(`<h3 class="o" style="margin-bottom:10px">CATAT PERAWATAN / PERBAIKAN</h3>
  ${id?'':`<label>Item</label><select id="fm">${D.items.map(m=>`<option value="${m.id}">${ic(m.kategori)} ${E(m.nama)}</option>`).join('')}</select>`}
  <label>Tanggal</label><input id="ft" type="date" value="${today()}"><label>Jenis</label><select id="fj"><option>Perawatan</option><option>Perbaikan</option></select>
  <label>Keterangan</label><textarea id="fk" rows="3" placeholder="ganti oli, servis AC, cat dinding..."></textarea>
  <label>KM saat ini (kendaraan, opsional)</label><input id="fkm" type="number" inputmode="numeric"><label>Biaya (Rp)</label><input id="fb" type="number" inputmode="numeric">
  <label>Foto (maks 3, otomatis dikompres)</label><input id="ff" type="file" accept="image/*" multiple>
  <div class="row"><button class="btn" onclick="simpan('${id||''}')">SIMPAN</button><button class="btn x" onclick="cm()">BATAL</button></div>`)}
function kompres(f){return new Promise(res=>{const i=new Image();i.onload=()=>{const k=Math.min(1,1024/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.65).split(',')[1])};i.src=URL.createObjectURL(f)})}
async function simpan(id){
  const r={item_id:id||$('#fm').value,tanggal:$('#ft').value,jenis:$('#fj').value,keterangan:$('#fk').value,km:$('#fkm').value,biaya:$('#fb').value};
  if(!r.tanggal||!r.keterangan)return toast('Tanggal & keterangan wajib');
  try{ld(1);const fotos=[];for(const f of [...$('#ff').files].slice(0,3))fotos.push(await kompres(f));
  await api('addCatatan',{r,fotos});cm();toast('Tersimpan ✓');detail(r.item_id)}catch(e){ld(0);toast(e.message)}}
// ---- akun ----
function akunView(){
  $('#app').innerHTML=`${tabsH()}<div class="row sp"><h3 style="font-size:15px">AKUN PEMILIK</h3><button class="btn o sm" onclick="fAkun()">+ AKUN</button></div>
  ${D.akun.map(a=>`<div class="card"><div class="o" style="font-size:15px">${E(a.nama)}</div><div class="m">@${E(a.username)} · WA ${E(a.wa||'-')} · ${D.items.filter(i=>i.akun==a.username).length} item</div>
  <div class="row" style="margin-top:8px"><button class="btn x sm" onclick="fAkun('${a.username}')">EDIT / RESET PASSWORD</button><button class="btn x sm" onclick="delA('${a.username}')">HAPUS</button></div></div>`).join('')||'<div class="card m">Belum ada akun. Tekan "+ AKUN".</div>'}`}
function fAkun(u){
  const a=D.akun.find(x=>x.username==u)||{};
  om(`<h3 class="o" style="margin-bottom:10px">${u?'EDIT':'TAMBAH'} AKUN</h3>
  <label>Nama akun (huruf/angka . _ -)</label><input id="a_u" value="${E(a.username)}" ${u?'disabled':''} autocapitalize="none">
  <label>Password ${u?'(kosongkan jika tidak diganti)':'(min. 4 karakter)'}</label><input id="a_p" type="text" autocomplete="off">
  <label>Nama lengkap</label><input id="a_n" value="${E(a.nama)}"><label>No WhatsApp (08xxx)</label><input id="a_w" value="${E(a.wa)}" inputmode="tel">
  <div class="row"><button class="btn" onclick="sAkun('${u||''}')">SIMPAN</button><button class="btn x" onclick="cm()">BATAL</button></div>`)}
async function sAkun(u){
  const akun={username:u||$('#a_u').value.trim(),password:$('#a_p').value,nama:$('#a_n').value.trim(),wa:$('#a_w').value.trim()};
  try{await api('saveAkun',{akun,baru:!u});cm();toast('Tersimpan ✓');home()}catch(e){toast(e.message)}}
async function delA(u){if(confirm('Hapus akun @'+u+' beserta semua item miliknya?'))try{await api('delAkun',{username:u});home()}catch(e){toast(e.message)}}
function fPass(){om(`<h3 class="o" style="margin-bottom:10px">GANTI PASSWORD</h3><label>Password baru (min. 4 karakter)</label><input id="np" type="password"><div class="row"><button class="btn" onclick="sPass()">SIMPAN</button><button class="btn x" onclick="cm()">BATAL</button></div>`)}
async function sPass(){const np=$('#np').value;try{await api('gantiPass',{newp:np});S.p=np;ST.setItem(KEY,JSON.stringify(S));cm();toast('Password diganti ✓');home()}catch(e){toast(e.message)}}
// ---- PWA ----
addEventListener('beforeinstallprompt',e=>{e.preventDefault();ip=e;ibar()});
addEventListener('appinstalled',()=>{ip=null;ibar()});
function ibar(){const b=$('#ib');if(!b)return;
  if(matchMedia('(display-mode: standalone)').matches||navigator.standalone){b.innerHTML='';return}
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  b.innerHTML=ip?`<button class="btn o" style="width:100%;margin:8px 0" onclick="inst()">⬇ INSTAL APLIKASI DI HP</button>`:ios?`<div class="alert" style="color:var(--t);border-color:var(--c);background:#00e5ff12">Instal: ketuk <b>Bagikan</b> lalu <b>Tambah ke Layar Utama</b></div>`:''}
async function inst(){if(!ip)return;ip.prompt();await ip.userChoice;ip=null;ibar()}
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
// ---- laporan PDF ----
function fLap(id){
  om(`<h3 class="o" style="margin-bottom:10px">LAPORAN PDF</h3>
  ${id?'':`<label>Item</label><select id="lm"><option value="">Semua item</option>${D.items.map(m=>`<option value="${m.id}">${ic(m.kategori)} ${E(m.nama)}</option>`).join('')}</select>`}
  <label>Dari tanggal</label><input id="l1" type="date"><label>Sampai tanggal</label><input id="l2" type="date" value="${today()}">
  <label style="display:flex;gap:8px;align-items:center"><input id="lf" type="checkbox" checked style="width:auto;margin:0"> Sertakan foto</label>
  <p class="m" style="font-size:14px;margin:8px 0">Pada jendela cetak yang muncul, pilih "Simpan sebagai PDF".</p>
  <div class="row"><button class="btn" onclick="buatLap('${id||''}')">BUAT PDF</button><button class="btn x" onclick="cm()">BATAL</button></div>`)}
function buatLap(id){
  const mid=id||$('#lm').value,a=$('#l1').value,b=$('#l2').value,f=$('#lf').checked;
  const rp=r=>(!a||r.tanggal>=a)&&(!b||r.tanggal<=b),rn=n=>'Rp '+(+n||0).toLocaleString('id-ID'),lab=['Terpantau','Segera dirawat','Terlambat'];
  const info=D.items.filter(m=>!mid||m.id==mid).map(m=>{const s=st(m),rs=s.rs.filter(rp);return{m,s,rs,pr:rs.filter(r=>r.jenis=='Perawatan').length,pb:rs.filter(r=>r.jenis=='Perbaikan').length,tot:rs.reduce((x,r)=>x+(+r.biaya||0),0)}});
  const w=open('','_blank');if(!w)return toast('Izinkan pop-up untuk membuat PDF');
  w.document.write(`<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Laporan Omaris Check</title><style>
  body{font:13px Arial,sans-serif;color:#111;margin:22px}h1{font-size:20px;margin:0;color:#087}h2{font-size:15px;margin:18px 0 6px;border-bottom:2px solid #0aa;padding-bottom:3px}
  table{width:100%;border-collapse:collapse;margin:6px 0}th,td{border:1px solid #bbb;padding:5px 6px;text-align:left;vertical-align:top}th{background:#e8f4f8}tr{page-break-inside:avoid}
  .s0{color:#0a7a3d}.s1{color:#b58900}.s2{color:#d00;font-weight:bold}img{width:70px;height:70px;object-fit:cover;margin:2px;border:1px solid #ccc}
  .ft{margin-top:22px;text-align:center;color:#666;font-size:11px;border-top:1px solid #ccc;padding-top:8px}</style></head><body>
  <h1>OMARIS CHECK</h1><div>Laporan Perawatan &amp; Perbaikan</div><div>Periode: ${a||'awal'} s/d ${b||'sekarang'} · Dicetak: ${new Date().toLocaleDateString('id-ID')}</div>
  <h2>Ringkasan</h2><table><tr><th>Item</th><th>Kategori</th>${AD?'<th>Pemilik</th>':''}<th>Rawat terakhir</th><th>Status</th><th>Rawat</th><th>Perbaikan</th><th>Biaya</th></tr>
  ${info.map(x=>`<tr><td>${E(x.m.nama)}${x.m.detail?' ('+E(x.m.detail)+')':''}</td><td>${E(x.m.kategori)}</td>${AD?`<td>${E(nm(x.m.akun))}</td>`:''}<td>${x.s.rw?E(x.s.rw.tanggal):'-'}</td><td class="s${x.s.lv}">${lab[x.s.lv]}</td><td>${x.pr}</td><td>${x.pb}</td><td>${rn(x.tot)}</td></tr>`).join('')}
  <tr><th colspan="${AD?7:6}" style="text-align:right">Total biaya</th><th>${rn(info.reduce((t,x)=>t+x.tot,0))}</th></tr></table>
  ${info.map(x=>`<h2>${E(x.m.kategori)}: ${E(x.m.nama)}${x.m.detail?' ('+E(x.m.detail)+')':''}</h2>${f&&x.m.foto?`<img src="${th(x.m.foto,300)}" style="width:90px;height:90px;display:block;margin:4px 0">`:''}<table><tr><th>Tanggal</th><th>Jenis</th><th>Keterangan</th><th>KM</th><th>Biaya</th></tr>
  ${x.rs.map(r=>`<tr><td>${E(r.tanggal)}</td><td>${E(r.jenis)}</td><td>${E(r.keterangan)}${f&&r.foto_link?'<br>'+r.foto_link.split(' | ').map(l=>`<img src="${th(l,300)}">`).join(''):''}</td><td>${E(r.km)}</td><td>${r.biaya?rn(r.biaya):'-'}</td></tr>`).join('')||'<tr><td colspan="5">Tidak ada riwayat pada periode ini.</td></tr>'}</table>`).join('')}
  <div class="ft">© 2026 Omaris All rights Reserved</div><script>onload=()=>setTimeout(()=>print(),800)<\/script></body></html>`);
  w.document.close();cm()}
(async()=>{if(S){try{await api('login');home();return}catch(e){}}login()})();
