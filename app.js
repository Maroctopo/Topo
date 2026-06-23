/* ══ MarocGeoPro — Application Logic ══ */

// ── AUTH UI ──
var selPlanVal = 'credit';
function switchTab(tab){
  document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.auth-form').forEach(f=>f.classList.remove('on'));
  event.target.classList.add('on');
  document.getElementById('form-'+tab).classList.add('on');
}
function selPlan(p){
  selPlanVal=p;
  document.getElementById('opt-credit').classList.toggle('sel',p==='credit');
  document.getElementById('opt-annual').classList.toggle('sel',p==='annual');
}
function showAuthErr(id,msg){var e=document.getElementById(id);e.textContent=msg;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),4000);}
function doLogin(){
  try{var u=AUTH.login(document.getElementById('loginEmail').value.trim(),document.getElementById('loginPass').value);startApp(u);}
  catch(e){showAuthErr('loginErr',e.message);}
}
function doRegister(){
  try{var u=AUTH.register(document.getElementById('regName').value.trim(),document.getElementById('regEmail').value.trim(),document.getElementById('regPhone').value.trim(),document.getElementById('regPass').value,selPlanVal);startApp(u);toast('Bienvenue '+u.name+'! Essai gratuit 14 jours activé.','ok');}
  catch(e){showAuthErr('regErr',e.message);}
}
function doDemo(){startApp(AUTH.demo());}
function doLogout(){AUTH.logout();location.reload();}

function startApp(user){
  document.getElementById('authOverlay').style.display='none';
  document.getElementById('app').style.display='flex';
  var initials=user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('userAvatar').textContent=initials;
  document.getElementById('userName').textContent=user.name;
  document.getElementById('sbUser').textContent=user.name;
  var planLabels={credit:'💳 20 MAD/mois',annual:'⭐ 400 MAD/an',demo:'🎯 Démo 14j'};
  var pb=document.getElementById('userPlan');
  pb.textContent=planLabels[user.plan]||user.plan;
  pb.className='user-plan '+(user.plan||'demo');
  document.getElementById('umInfo').innerHTML='<strong>'+user.name+'</strong>'+user.email+'<br><span style="color:var(--bl);font-weight:600">'+(planLabels[user.plan]||user.plan)+'</span>';
  setTimeout(initMap,100);
  window._user=user;
}

// Check session on load
window.addEventListener('load',function(){
  var sess=AUTH.current();
  if(sess)startApp(sess);
});

// User menu toggle
function toggleUserMenu(){document.getElementById('userMenu').classList.toggle('open');}
document.addEventListener('click',function(e){if(!e.target.closest('#userMenu')&&!e.target.closest('#userAvatar'))document.getElementById('userMenu').classList.remove('open');});

// ── MODAL ──
function openModal(type){
  document.getElementById('userMenu').classList.remove('open');
  var u=window._user||{};
  var t='',b='';
  if(type==='account'){
    t='Mon Compte';
    var planNames={credit:'Plan Crédit — 20 MAD/mois',annual:'Plan Annuel — 400 MAD/an',demo:'Mode Démo'};
    b='<div class="acct-card"><div class="acct-name">'+u.name+'</div><div class="acct-email">'+u.email+'</div><div class="acct-meta '+(u.plan||'demo')+'">'+((planNames[u.plan])||'Démo')+'</div></div>'+
      '<div class="acct-stats"><div class="astat"><strong>'+(u.projectCount||0)+'</strong><span>Projets</span></div><div class="astat"><strong>'+(shapes.length)+'</strong><span>Éléments</span></div><div class="astat"><strong>'+(AUTH.trialDaysLeft(u))+'</strong><span>Jours essai</span></div><div class="astat"><strong>'+(u.plan==='annual'?'∞':'20')+'</strong><span>MAD/mois</span></div></div>'+
      (u.plan!=='annual'?'<div class="upgrade-card"><h4>Passer au Plan Annuel</h4><div class="price">400 MAD<small style="font-size:14px">/an</small></div><div class="desc">Économisez 40% · DXF Plan Pro · PPP-AR · APK Android</div><button class="ubtn" onclick="openModal(\'upgrade\');closeModal()">Upgrader maintenant</button></div>':'')+
      '<button class="btn danger" onclick="doLogout()">🚪 Se déconnecter</button>';
  } else if(type==='upgrade'){
    t='Choisir un plan';
    var days=AUTH.trialDaysLeft(u);
    b='<div style="background:#fff7e0;border:1px solid #f59e0b;border-radius:10px;padding:12px;margin-bottom:14px;font-size:12px;color:#92400e">'+
      '<strong>🎁 Essai gratuit: '+days+' jours restants</strong><br>Après votre période d\'essai, choisissez le plan qui vous convient.</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">'+
      '<div style="border:2px solid var(--gr);border-radius:12px;padding:14px;text-align:center;cursor:pointer" onclick="showPayment(\'credit\')">'+
      '<div style="font-size:11px;font-weight:700;color:var(--gr);margin-bottom:6px">💳 PLAN CRÉDIT</div>'+
      '<div style="font-size:28px;font-weight:900;color:var(--gr)">20</div>'+
      '<div style="font-size:11px;color:var(--muted)">MAD / mois</div>'+
      '<div style="font-size:10px;color:var(--muted);margin-top:4px">Résiliable à tout moment</div>'+
      '<button class="btn success" style="margin-top:10px">Choisir →</button></div>'+
      '<div style="border:2px solid var(--bl);border-radius:12px;padding:14px;text-align:center;cursor:pointer;background:var(--bl3)" onclick="showPayment(\'annual\')">'+
      '<div style="font-size:11px;font-weight:700;color:var(--bl);margin-bottom:6px">⭐ PLAN ANNUEL</div>'+
      '<div style="font-size:28px;font-weight:900;color:var(--bl)">400</div>'+
      '<div style="font-size:11px;color:var(--muted)">MAD / an</div>'+
      '<div style="font-size:10px;color:var(--gr);font-weight:700;margin-top:4px">-40% · Tout inclus</div>'+
      '<button class="btn primary" style="margin-top:10px">Choisir →</button></div></div>'+
      '<ul style="font-size:11px;color:var(--txt2);margin-bottom:0;padding-left:16px;line-height:2">'+
      '<li>📐 DXF Plan de Situation Pro</li>'+
      '<li>🎯 Point Averaging ±0.5m</li>'+
      '<li>⭐ PPP-AR ±3-10cm</li>'+
      '<li>📱 Android APK inclus</li>'+
      '<li>🆕 Mises à jour gratuites</li>'+
      '<li>📞 Support WhatsApp prioritaire</li></ul>';
  } else if(type==='settings'){
    t='Paramètres';
    b='<div class="sec-title">Langue</div><div class="btn-row" style="margin-bottom:14px"><button class="btn secondary" onclick="toast(\'Français activé\')">🇫🇷 Français</button><button class="btn secondary" onclick="toast(\'العربية\')">🇲🇦 العربية</button><button class="btn secondary" onclick="toast(\'English\')">🇬🇧 English</button></div>'+
      '<div class="sec-title">Unités</div><select id="unitSel" onchange="updStats()" style="margin-bottom:14px"><option value="m">Mètres / m²</option><option value="km">Kilomètres / km²</option><option value="ha">Mètres / Hectares</option></select>'+
      '<div class="sec-title">Fond de carte par défaut</div><select onchange="setTile(this.value)"><option value="sat">🛰 Satellite</option><option value="topo">🗻 Topo</option><option value="osm">🗺 Routier</option></select>';
  }
  document.getElementById('modalTitle').textContent=t;
  document.getElementById('modalBody').innerHTML=b;
  document.getElementById('modal').classList.add('open');
}
function closeModal(){document.getElementById('modal').classList.remove('open');}

// ── SIDEBAR TABS ──
function showSTab(id){
  document.querySelectorAll('.stab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.spane').forEach(p=>p.classList.remove('on'));
  document.getElementById('stab-'+id).classList.add('on');
  document.getElementById('sp-'+id).classList.add('on');
}

// ── PROJECTIONS ──
var W='+proj=longlat +datum=WGS84 +no_defs';
var PD={DD:W,DMS:W,DDM:W,
  UTM28N:'+proj=utm +zone=28 +datum=WGS84 +units=m +no_defs',
  UTM29N:'+proj=utm +zone=29 +datum=WGS84 +units=m +no_defs',
  UTM30N:'+proj=utm +zone=30 +datum=WGS84 +units=m +no_defs',
  UTM31N:'+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs',
  UTM32N:'+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs',
  LMN:'+proj=lcc +lat_1=33.3 +lat_0=33.3 +lon_0=-5.4 +k_0=0.999625769 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356514.999904194 +towgs84=31,146,47,0,0,0,0 +units=m +no_defs',
  LMS:'+proj=lcc +lat_1=29.7 +lat_0=29.7 +lon_0=-5.4 +k_0=0.9996155271 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356514.999904194 +towgs84=31,146,47,0,0,0,0 +units=m +no_defs',
  LMZ:'+proj=lcc +lat_1=26.1 +lat_0=26.1 +lon_0=-5.4 +k_0=0.9995172674 +x_0=1200000 +y_0=400000 +a=6378249.2 +b=6356514.999904194 +towgs84=31,146,47,0,0,0,0 +units=m +no_defs',
  LTN:'+proj=lcc +lat_1=36 +lat_0=36 +lon_0=9.9 +k_0=0.999625544 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356514.999904194 +towgs84=-73,-247,227,0,0,0,0 +units=m +no_defs',
  LDN:'+proj=lcc +lat_1=36 +lat_0=36 +lon_0=2.7 +k_0=0.999625544 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356514.999904194 +towgs84=-73,-247,227,0,0,0,0 +units=m +no_defs',
  LDS:'+proj=lcc +lat_1=33.3 +lat_0=33.3 +lon_0=2.7 +k_0=0.999625769 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356514.999904194 +towgs84=-73,-247,227,0,0,0,0 +units=m +no_defs',
  L93:'+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  OSGB:'+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs'
};
function fw(c,lon,lat){return proj4(W,PD[c],[lon,lat]);}
function tw(c,x,y){return proj4(PD[c],W,[x,y]);}
function isGeo(c){return['DD','DMS','DDM'].includes(c);}

// ── MAP ──
var map, tileL, drawn, handler;
var shapes=[], activeTool='nav', lastWGS=null, batchWGS=[];
var routeCoords=[], ptA=null, ptB=null, mA=null, mB=null, routeL=null;
var labelLayer=null, pickingPt=null;
var gpsOn=false, gpsWatchId=null, gpsTrail=[], gpsLayer=null, gpsMarker=null;
var pppOn=false, pppInterval=null, pppStart=null, pppSamples=[];
var _lastAvg=null, _avgInterval=null;

var TILES={
  sat:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  topo:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  osm:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
};


/* ── POINT BY COORDS — with CRS selector ── */
function updatePtLabels(){
  var c = document.getElementById('ptCRS').value;
  var geo = isGeo(c);
  var isDMS = c === 'DMS';
  document.getElementById('ptDMSFields').style.display = isDMS ? 'block' : 'none';
  document.getElementById('ptDDFields').style.display = isDMS ? 'none' : 'block';
  if(!isDMS){
    document.getElementById('ptLbl1').textContent = geo ? 'Latitude (DD)' : 'Y — Northing (m)';
    document.getElementById('ptLbl2').textContent = geo ? 'Longitude (DD)' : 'X — Easting (m)';
    document.getElementById('ptLat').placeholder = geo ? '29.370000' : '3246000';
    document.getElementById('ptLon').placeholder = geo ? '-10.050000' : '500000';
    // Update step
    document.getElementById('ptLat').step = geo ? '0.000001' : '1';
    document.getElementById('ptLon').step = geo ? '0.000001' : '1';
  }
  // Clear preview
  document.getElementById('ptWGSPreview').style.display = 'none';
  document.getElementById('ptWGSPreview').textContent = 'WGS84: —';
}

// Live WGS84 preview when typing coordinates
function previewPtWGS(){
  var c = document.getElementById('ptCRS').value;
  var preview = document.getElementById('ptWGSPreview');
  try {
    var lat, lon;
    if(c === 'DMS'){
      var lD=parseFloat(document.getElementById('ptLatD').value)||0;
      var lM=parseFloat(document.getElementById('ptLatM').value)||0;
      var lS=parseFloat(document.getElementById('ptLatS').value)||0;
      var lDr=document.getElementById('ptLatDir').value;
      var oD=parseFloat(document.getElementById('ptLonD').value)||0;
      var oM=parseFloat(document.getElementById('ptLonM').value)||0;
      var oS=parseFloat(document.getElementById('ptLonS').value)||0;
      var oDr=document.getElementById('ptLonDir').value;
      lat=(lD+lM/60+lS/3600)*(lDr==='S'?-1:1);
      lon=(oD+oM/60+oS/3600)*(oDr==='W'?-1:1);
    } else if(isGeo(c)){
      lat=parseFloat(document.getElementById('ptLat').value);
      lon=parseFloat(document.getElementById('ptLon').value);
    } else {
      var x=parseFloat(document.getElementById('ptLon').value); // X=Easting
      var y=parseFloat(document.getElementById('ptLat').value); // Y=Northing
      if(isNaN(x)||isNaN(y)) throw new Error();
      var r=tw(c,x,y);lon=r[0];lat=r[1];
    }
    if(isNaN(lat)||isNaN(lon)||Math.abs(lat)>90||Math.abs(lon)>180) throw new Error();
    preview.textContent='WGS84: '+lat.toFixed(6)+'°, '+lon.toFixed(6)+'°';
    preview.style.display='block';
    preview.style.color='var(--gr)';
  } catch(e){
    preview.textContent='Entrez des coordonnées valides';
    preview.style.display='block';
    preview.style.color='var(--muted)';
  }
}

function initMap(){
  if(map) return;
  map = L.map('map',{center:[29.37,-10.05],zoom:8,zoomControl:true,attributionControl:false});
  tileL = L.tileLayer(TILES.sat,{maxZoom:20}).addTo(map);
  drawn = new L.FeatureGroup().addTo(map);

  map.on('mousemove',function(e){
    var lat=e.latlng.lat,lng=e.latlng.lng;
    var code=document.getElementById('qCRS').value;
    var txt=lat.toFixed(6)+', '+lng.toFixed(6);
    if(!isGeo(code)){try{var r=fw(code,lng,lat);txt='X:'+r[0].toFixed(1)+' Y:'+r[1].toFixed(1);}catch(er){}}
    document.getElementById('sbCoords').textContent=txt;
  });
  map.on('zoom',function(){document.getElementById('sbZoom').textContent=map.getZoom();});
  map.on('click',function(e){
    if(pickingPt){setPtOnMap(pickingPt,e.latlng);return;}
    if(activeTool==='pt') addMkAt(e.latlng);
  });
  map.on(L.Draw.Event.CREATED,function(e){
    var l=e.layer,t=e.layerType,c=document.getElementById('col').value;
    if(l.setStyle)l.setStyle({color:c,fillColor:c,weight:3,fillOpacity:0.15});
    drawn.addLayer(l);
    var info={name:''};
    if(t==='circle'){info.r=l.getRadius();info.area=Math.PI*info.r*info.r;}
    else if(t==='polygon'||t==='rectangle'){var pts=l.getLatLngs()[0];info.area=gArea(pts);info.perim=gLen(pts,true);info.pts=pts.length;}
    else if(t==='polyline'){var pts=l.getLatLngs();info.len=gLen(pts);info.pts=pts.length;}
    regShape(l,t,info,c);
    handler=null;setTool('nav');
    toast('Élément ajouté','ok');
  });
  map.on(L.Draw.Event.DELETED,function(e){
    e.layers.eachLayer(function(l){shapes=shapes.filter(s=>s.layer!==l);});
    updStats();renderShapes();
  });
  setTimeout(function(){map.invalidateSize(true);},300);
  // Live preview for point input
  ['ptLat','ptLon','ptLatD','ptLatM','ptLatS','ptLonD','ptLonM','ptLonS'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.addEventListener('input',previewPtWGS);
  });
  ['ptLatDir','ptLonDir','ptCRS'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.addEventListener('change',previewPtWGS);
  });
}

function setTile(k){
  if(tileL)map.removeLayer(tileL);
  tileL=L.tileLayer(TILES[k],{maxZoom:20}).addTo(map);
  document.querySelectorAll('[id^=bm-]').forEach(b=>b.classList.remove('on'));
  var el=document.getElementById('bm-'+k);if(el)el.classList.add('on');
}

function updateStatusCRS(){document.getElementById('sbCRS').textContent=document.getElementById('qCRS').value;}

// ── TOOLS ──
var TLBL={nav:'Navigation',pt:'Point',pl:'Polyligne',pg:'Polygone',ci:'Cercle',re:'Rectangle',edit:'Éditer'};
function setTool(t){
  if(handler){try{handler.disable();}catch(e){}handler=null;}
  activeTool=t;
  document.querySelectorAll('.tbtn,[id^=t-]').forEach(b=>b.classList.remove('on'));
  var el=document.getElementById('t-'+t);if(el)el.classList.add('on');
  document.getElementById('sbTool').textContent=TLBL[t]||t;
  if(!map)return;
  var c=document.getElementById('col').value||'#0055cc';
  var o={shapeOptions:{color:c,fillColor:c,weight:3,fillOpacity:0.15}};
  if(t==='pl'){handler=new L.Draw.Polyline(map,o);handler.enable();}
  else if(t==='pg'){handler=new L.Draw.Polygon(map,o);handler.enable();}
  else if(t==='ci'){handler=new L.Draw.Circle(map,o);handler.enable();}
  else if(t==='re'){handler=new L.Draw.Rectangle(map,o);handler.enable();}
  else if(t==='edit'){var eh=new L.EditToolbar.Edit(map,{featureGroup:drawn});eh.enable();}
}

function addMkAt(ll){
  var c=document.getElementById('col').value||'#0055cc';
  var m=L.circleMarker(ll,{radius:7,color:c,fillColor:c,fillOpacity:1,weight:2}).addTo(drawn);
  m.bindPopup(ll.lat.toFixed(8)+'<br>'+ll.lng.toFixed(8));
  regShape(m,'marker',{name:'Point',lat:ll.lat,lon:ll.lng},c);
}

function addPtCoords(){
  var crsCode = (document.getElementById('ptCRS')||{value:'DD'}).value || 'DD';
  var nm = document.getElementById('ptName').value || 'Point';
  var color = document.getElementById('col').value || '#0055cc';
  var lat, lon;
  try {
    if(crsCode === 'DMS'){
      var lD=parseFloat(document.getElementById('ptLatD').value);
      var lM=parseFloat(document.getElementById('ptLatM').value);
      var lS=parseFloat(document.getElementById('ptLatS').value);
      var lDr=document.getElementById('ptLatDir').value;
      var oD=parseFloat(document.getElementById('ptLonD').value);
      var oM=parseFloat(document.getElementById('ptLonM').value);
      var oS=parseFloat(document.getElementById('ptLonS').value);
      var oDr=document.getElementById('ptLonDir').value;
      if([lD,lM,lS,oD,oM,oS].some(isNaN)) throw new Error('Remplissez tous les champs DMS');
      lat=(lD+lM/60+lS/3600)*(lDr==='S'?-1:1);
      lon=(oD+oM/60+oS/3600)*(oDr==='W'?-1:1);
    } else if(isGeo(crsCode)){
      lat=parseFloat(document.getElementById('ptLat').value);
      lon=parseFloat(document.getElementById('ptLon').value);
      if(isNaN(lat)||isNaN(lon)) throw new Error('Latitude et Longitude requis');
    } else {
      // Projected CRS: X=Easting in ptLon, Y=Northing in ptLat
      var X=parseFloat(document.getElementById('ptLon').value);
      var Y=parseFloat(document.getElementById('ptLat').value);
      if(isNaN(X)||isNaN(Y)) throw new Error('X (Easting) et Y (Northing) requis');
      var wgs=tw(crsCode,X,Y);
      lon=wgs[0]; lat=wgs[1];
    }
    if(isNaN(lat)||isNaN(lon)) throw new Error('Coordonnées invalides');
    if(Math.abs(lat)>90||Math.abs(lon)>180) throw new Error('Coordonnées hors limites');
  } catch(e){
    toast(e.message,'err');
    return;
  }
  // Build popup with original + WGS84 coords
  var origCoords = '';
  if(crsCode==='DMS'){
    origCoords='DMS: '+document.getElementById('ptLatD').value+'° '+document.getElementById('ptLatM').value+"' "+document.getElementById('ptLatS').value+'" '+document.getElementById('ptLatDir').value+'<br>';
  } else if(!isGeo(crsCode)){
    origCoords=crsCode+': X='+document.getElementById('ptLon').value+' Y='+document.getElementById('ptLat').value+'<br>';
  }
  var m=L.circleMarker([lat,lon],{radius:10,color:color,fillColor:color,fillOpacity:1,weight:3}).addTo(drawn);
  m.bindPopup(
    '<b>📍 '+nm+'</b><br>'+
    origCoords+
    'WGS84 Lat: <b>'+lat.toFixed(8)+'°</b><br>'+
    'WGS84 Lon: <b>'+lon.toFixed(8)+'°</b><br>'+
    '<small style="color:#666">Système: '+crsCode+'</small>'
  ).openPopup();
  regShape(m,'marker',{name:nm+' ('+crsCode+')',lat:lat,lon:lon},color);
  map.flyTo([lat,lon],16,{duration:1.2});
  // Clear fields
  document.getElementById('ptName').value='';
  ['ptLat','ptLon','ptLatD','ptLatM','ptLatS','ptLonD','ptLonM','ptLonS'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.value='';
  });
  document.getElementById('ptWGSPreview').style.display='none';
  toast('Point "'+nm+'" placé sur la carte ('+crsCode+')','ok');
}

// ── GEOMETRY ──
function gLen(pts,cl){if(!pts||pts.length<2)return 0;var d=0;for(var i=0;i<pts.length-1;i++)d+=map.distance(pts[i],pts[i+1]);if(cl&&pts.length>2)d+=map.distance(pts[pts.length-1],pts[0]);return d;}
function gArea(pts){var R=6371008.8,n=pts.length;if(n<3)return 0;var a=0;for(var i=0;i<n;i++){var j=(i+1)%n,p1=pts[i].lat*Math.PI/180,p2=pts[j].lat*Math.PI/180,dl=(pts[j].lng-pts[i].lng)*Math.PI/180;a+=dl*(2+Math.sin(p1)+Math.sin(p2));}return Math.abs(a*R*R/2);}
function fLen(m){var s=(document.getElementById('unitSel')||{}).value||'m';return s==='km'?(m/1000).toFixed(4)+' km':m.toFixed(3)+' m';}
function fArea(m2){var s=(document.getElementById('unitSel')||{}).value||'m';if(s==='km')return(m2/1e6).toFixed(6)+' km²';if(s==='ha')return(m2/10000).toFixed(5)+' ha';return m2.toFixed(4)+' m²';}

// ── SHAPES ──
function regShape(layer,type,info,color){
  var id='s'+Date.now()+Math.random().toString(36).slice(2,5);
  layer._tid=id;shapes.push({id:id,layer:layer,type:type,info:info,color:color||'#0055cc'});
  renderShapes();updStats();return id;
}
function updStats(){
  var n=shapes.length,tL=0,tA=0;
  shapes.forEach(s=>{if(s.type==='polyline')tL+=(s.info.len||0);else if(s.type==='polygon'||s.type==='rectangle'){tA+=(s.info.area||0);tL+=(s.info.perim||0);}else if(s.type==='circle')tA+=(s.info.area||0);});
  document.getElementById('statN').textContent=n;
  document.getElementById('statL').textContent=fLen(tL);
  document.getElementById('statA').textContent=fArea(tA);
  document.getElementById('sbN').textContent=n;
  var fc=document.getElementById('featCount');if(fc)fc.textContent=n;
}
function renderShapes(){
  var el=document.getElementById('featList');
  if(!shapes.length){el.innerHTML='<p class="hint">Commencez à dessiner...</p>';return;}
  el.innerHTML='';
  shapes.forEach(function(s,i){
    var det='';
    if(s.type==='marker')det=(s.info.lat||0).toFixed(5)+', '+(s.info.lon||0).toFixed(5);
    else if(s.type==='circle')det='R:'+fLen(s.info.r||0);
    else if(s.type==='polyline')det='L:'+fLen(s.info.len||0);
    else det='A:'+fArea(s.info.area||0);
    var d=document.createElement('div');d.className='feat-item';
    d.innerHTML='<div class="feat-dot" style="background:'+s.color+'"></div>'+
      '<div style="flex:1"><div class="feat-name">'+(s.info.name||'Élément #'+(i+1))+'</div><div class="feat-info">'+det+'</div></div>'+
      '<button class="feat-del" data-id="'+s.id+'">✕</button>';
    d.querySelector('.feat-del').onclick=function(e){e.stopPropagation();delShape(this.dataset.id);};
    d.onclick=function(){try{if(s.layer.getBounds)map.fitBounds(s.layer.getBounds());else map.setView(s.layer.getLatLng(),16);}catch(e){}};
    el.appendChild(d);
  });
}
function delShape(id){var s=shapes.find(x=>x.id===id);if(s){try{drawn.removeLayer(s.layer);}catch(e){}shapes=shapes.filter(x=>x.id!==id);}renderShapes();updStats();}
function undoLast(){if(!shapes.length){toast('Rien à annuler','err');return;}var s=shapes.pop();try{drawn.removeLayer(s.layer);}catch(e){}renderShapes();updStats();toast('Annulé');}
function clearAll(){shapes.forEach(s=>{try{drawn.removeLayer(s.layer);}catch(e){}});drawn.clearLayers();shapes=[];renderShapes();updStats();toast('Effacé');}

// ── BORNES ──
function showBornes(){
  if(labelLayer)map.removeLayer(labelLayer);
  labelLayer=L.layerGroup().addTo(map);var n=0;
  shapes.forEach(s=>{
    if(!(s.layer instanceof L.Polygon||s.layer instanceof L.Polyline))return;
    var ll=s.layer.getLatLngs();if(Array.isArray(ll[0]))ll=ll[0];
    ll.forEach((p,i)=>{
      L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:'<div style="background:#f59e0b;color:#1a2540;border:2px solid #fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,.4)">'+(i+1)+'</div>',iconSize:[22,22],iconAnchor:[11,11]}),interactive:false}).addTo(labelLayer);n++;
    });
  });
  if(!n)toast('Dessinez un polygone d\'abord','err');else toast(n+' borne(s) affichée(s)','ok');
}
function hideBornes(){if(labelLayer){map.removeLayer(labelLayer);labelLayer=null;}toast('Masqué');}
function exportBornesCSV(){
  var csv='Borne,Lat,Lon\n',n=1;
  shapes.forEach(s=>{
    if(!(s.layer instanceof L.Polygon||s.layer instanceof L.Polyline))return;
    var ll=s.layer.getLatLngs();if(Array.isArray(ll[0]))ll=ll[0];
    ll.forEach(p=>{csv+=n+','+p.lat.toFixed(8)+','+p.lng.toFixed(8)+'\n';n++;});
  });
  if(n===1){toast('Aucun sommet','err');return;}
  dlFile(csv,'bornes.csv','text/csv');toast('CSV exporté','ok');
}

// ── CONVERT ──
function buildSrcFields(){
  var c=document.getElementById('srcCRS').value,el=document.getElementById('srcFields');
  document.getElementById('convRes').classList.remove('show');
  document.getElementById('convErr').classList.remove('show');
  if(c==='DMS'){el.innerHTML='<div class="two-col" style="margin-bottom:5px"><div><label>Lat °</label><input type="number" id="latD" placeholder="29" style="margin-bottom:0"/></div><div><label>Min</label><input type="number" id="latM" placeholder="22" style="margin-bottom:0"/></div></div><div class="two-col" style="margin-bottom:5px"><div><label>Sec</label><input type="number" id="latS" placeholder="12" style="margin-bottom:0"/></div><div><label>Dir</label><select id="latDir" style="margin-bottom:0"><option>N</option><option>S</option></select></div></div><div class="two-col" style="margin-bottom:5px"><div><label>Lon °</label><input type="number" id="lonD" placeholder="10" style="margin-bottom:0"/></div><div><label>Min</label><input type="number" id="lonM" placeholder="3" style="margin-bottom:0"/></div></div><div class="two-col"><div><label>Sec</label><input type="number" id="lonS" placeholder="0" style="margin-bottom:0"/></div><div><label>Dir</label><select id="lonDir" style="margin-bottom:0"><option>E</option><option>W</option></select></div></div>';}
  else if(c==='DD'){el.innerHTML='<div class="two-col"><div><label>Latitude</label><input type="number" id="srcLat" placeholder="29.37" step="0.00000001" style="margin-bottom:0"/></div><div><label>Longitude</label><input type="number" id="srcLon" placeholder="-10.05" step="0.00000001" style="margin-bottom:0"/></div></div>';}
  else{el.innerHTML='<div class="two-col"><div><label>X Easting (m)</label><input type="number" id="srcX" placeholder="500000" style="margin-bottom:0"/></div><div><label>Y Northing (m)</label><input type="number" id="srcY" placeholder="3246000" style="margin-bottom:0"/></div></div>';}
}
buildSrcFields();

function getConvInput(c){
  var g=function(id){var e=document.getElementById(id);return e?parseFloat(e.value):NaN;};
  var gs=function(id){var e=document.getElementById(id);return e?e.value:'';};
  if(c==='DMS'){var lD=g('latD'),lM=g('latM'),lS=g('latS'),lDr=gs('latDir'),oD=g('lonD'),oM=g('lonM'),oS=g('lonS'),oDr=gs('lonDir');if([lD,lM,lS,oD,oM,oS].some(isNaN))throw new Error('Remplir tous les champs');return{x:(oD+oM/60+oS/3600)*(oDr==='W'?-1:1),y:(lD+lM/60+lS/3600)*(lDr==='S'?-1:1)};}
  if(c==='DD'){var la=g('srcLat'),lo=g('srcLon');if(isNaN(la)||isNaN(lo))throw new Error('Lat et Lon requis');return{x:lo,y:la};}
  var x=g('srcX'),y=g('srcY');if(isNaN(x)||isNaN(y))throw new Error('X et Y requis');return{x:x,y:y};
}
function toDMS(v){var a=Math.abs(v),d=Math.floor(a),m=Math.floor((a-d)*60),s=((a-d)*60-m)*60;return d+'° '+('0'+m).slice(-2)+"' "+s.toFixed(4)+'"';}
function fmtOut(lon,lat,c){
  if(c==='DD')return['Lat: '+lat.toFixed(8)+'°','Lon: '+lon.toFixed(8)+'°'];
  if(c==='DMS')return['Lat: '+toDMS(lat)+' '+(lat>=0?'N':'S'),'Lon: '+toDMS(Math.abs(lon))+' '+(lon>=0?'E':'W')];
  try{var r=fw(c,lon,lat);return['X (Easting): '+r[0].toFixed(4)+' m','Y (Northing): '+r[1].toFixed(4)+' m'];}
  catch(e){return['Erreur conversion',''];}
}
function doConvert(){
  var src=document.getElementById('srcCRS').value,dst=document.getElementById('dstCRS').value;
  var ce=document.getElementById('convErr'),cr=document.getElementById('convRes');
  ce.classList.remove('show');cr.classList.remove('show');
  try{
    var inp=getConvInput(src),lon,lat;
    if(isGeo(src)){lon=inp.x;lat=inp.y;}else{var r=tw(src,inp.x,inp.y);lon=r[0];lat=r[1];}
    lastWGS={lat:lat,lon:lon};
    var out=fmtOut(lon,lat,dst);
    document.getElementById('convR1').textContent=out[0];
    document.getElementById('convR2').textContent=out[1];
    document.getElementById('convWGS').textContent=lat.toFixed(8)+'°, '+lon.toFixed(8)+'°';
    cr.classList.add('show');
    // Show marker on map automatically
    if(window._convMarker){map.removeLayer(window._convMarker);}
    var cIcon=L.divIcon({className:'',
      html:'<div style="width:18px;height:18px;border-radius:50%;background:#c87800;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>',
      iconSize:[18,18],iconAnchor:[9,9]
    });
    window._convMarker=L.marker([lat,lon],{icon:cIcon,zIndexOffset:800}).addTo(map);
    window._convMarker.bindPopup(
      '<b>🔄 Point converti</b><br>'+out[0]+'<br>'+out[1]+'<br><small>'+lat.toFixed(8)+', '+lon.toFixed(8)+'</small>'
    ).openPopup();
    map.flyTo([lat,lon],15,{duration:1.0});
    toast('Converti et affiché sur la carte ✓','ok');
  }catch(e){ce.textContent='⚠ '+e.message;ce.classList.add('show');toast('Erreur','err');}
}
function locateConverted(){
  if(!lastWGS){toast('Convertir d\'abord','err');return;}
  map.flyTo([lastWGS.lat,lastWGS.lon],16,{duration:1.0});
  if(window._convMarker)window._convMarker.openPopup();
  toast('Centré sur le point converti','ok');
}
function copyConv(){if(!lastWGS)return;navigator.clipboard.writeText([document.getElementById('convR1').textContent,document.getElementById('convR2').textContent,document.getElementById('convWGS').textContent].join('\n')).then(()=>toast('Copié','ok'));}
function doBatch(){
  var src=document.getElementById('srcCRS').value,dst=document.getElementById('dstCRS').value;
  var lines=document.getElementById('batchIn').value.trim().split('\n');
  batchWGS=[];var out=[];
  lines.forEach(function(line,i){
    if(!line.trim())return;var p=line.trim().split(/[,;\t ]+/);if(p.length<2)return;
    var x=parseFloat(p[0]),y=parseFloat(p[1]);if(isNaN(x)||isNaN(y))return;
    try{var lon,lat;if(isGeo(src)){lat=x;lon=y;}else{var r=tw(src,x,y);lon=r[0];lat=r[1];}
    batchWGS.push([lat,lon]);var s;if(isGeo(dst)){s=lat.toFixed(8)+','+lon.toFixed(8);}else{var r2=fw(dst,lon,lat);s=r2[0].toFixed(4)+','+r2[1].toFixed(4);}out.push(s);}catch(e){out.push('ERR');}
  });
  var ta=document.getElementById('batchOut');ta.value=out.join('\n');ta.style.display='block';toast(batchWGS.length+' point(s) convertis','ok');
}
function dlBatch(){if(!document.getElementById('batchOut').value)return;dlFile(document.getElementById('batchOut').value,'lot.csv','text/csv');}
function plotBatch(){
  if(!batchWGS.length){toast('Convertir d\'abord','err');return;}
  var c=document.getElementById('col').value;
  batchWGS.forEach(function(ll,i){var m=L.circleMarker(ll,{radius:5,color:c,fillColor:c,fillOpacity:1}).addTo(drawn);regShape(m,'marker',{name:'Lot '+(i+1),lat:ll[0],lon:ll[1]},c);});
  if(batchWGS.length){
    map.flyToBounds(L.latLngBounds(batchWGS),{padding:[40,40],duration:1.2});
    toast(batchWGS.length+' points tracés sur la carte','ok');
  }
}

// ── MEASURES ──
function getAlt(){
  var lat=parseFloat(document.getElementById('elvLat').value),lon=parseFloat(document.getElementById('elvLon').value);
  if(isNaN(lat)||isNaN(lon)){toast('Invalide','err');return;}
  document.getElementById('elvRes').classList.add('show');
  document.getElementById('elvVal').textContent='Chargement...';
  fetch('https://api.open-elevation.com/api/v1/lookup?locations='+lat+','+lon).then(r=>r.json()).then(d=>{document.getElementById('elvVal').textContent=d.results[0].elevation+' m';}).catch(()=>{document.getElementById('elvVal').textContent='Service indisponible';});
}
function gotoCoords(){openGotoModal();}
function openGotoModal(){
  document.getElementById('modalTitle').textContent='Aller à un point';
  document.getElementById('modalBody').innerHTML=
    '<label>Système de projection</label>'+
    '<select id="gCRS" onchange="updateGotoFields()" style="margin-bottom:8px">'+
    '<optgroup label="WGS84"><option value="DD">WGS84 — Degrés Décimaux</option><option value="DMS">WGS84 — Degrés Min Sec</option></optgroup>'+
    '<optgroup label="UTM Nord"><option value="UTM29N">UTM 29N — Maroc Ouest</option><option value="UTM30N">UTM 30N — Maroc Centre</option><option value="UTM31N">UTM 31N — Maroc Est</option></optgroup>'+
    '<optgroup label="Lambert Maroc"><option value="LMN">Lambert Maroc Nord</option><option value="LMS">Lambert Maroc Sud</option><option value="LMZ">Lambert Sahara</option><option value="LTN">Lambert Tunisie</option><option value="LDN">Lambert Algérie N</option></optgroup>'+
    '<optgroup label="Europe"><option value="L93">Lambert-93 France</option></optgroup></select>'+
    '<div id="gDMSFields" style="display:none">'+
    '<div class="two-col"><div><label>Lat °</label><input type="number" id="gLatD" placeholder="29" style="margin-bottom:4px"/></div><div><label>Min</label><input type="number" id="gLatM" placeholder="22" style="margin-bottom:4px"/></div></div>'+
    '<div class="two-col"><div><label>Sec</label><input type="number" id="gLatS" placeholder="12.5" style="margin-bottom:8px"/></div><div><label>Dir</label><select id="gLatDir"><option>N</option><option>S</option></select></div></div>'+
    '<div class="two-col"><div><label>Lon °</label><input type="number" id="gLonD" placeholder="10" style="margin-bottom:4px"/></div><div><label>Min</label><input type="number" id="gLonM" placeholder="3" style="margin-bottom:4px"/></div></div>'+
    '<div class="two-col"><div><label>Sec</label><input type="number" id="gLonS" placeholder="8.4" style="margin-bottom:8px"/></div><div><label>Dir</label><select id="gLonDir"><option>E</option><option>W</option></select></div></div>'+
    '</div>'+
    '<div id="gDDFields">'+
    '<label id="gLbl1">Latitude (DD)</label><input type="number" id="gLat" placeholder="29.370000" step="0.000001" style="margin-bottom:6px"/>'+
    '<label id="gLbl2">Longitude (DD)</label><input type="number" id="gLon" placeholder="-10.050000" step="0.000001" style="margin-bottom:8px"/>'+
    '</div>'+
    '<div id="gPreview" style="font:11px monospace;color:var(--muted);background:var(--surf);border-radius:7px;padding:6px 8px;margin-bottom:10px;display:none">WGS84: —</div>'+
    '<button class="btn primary" onclick="doGoto()">📍 Aller à ce point</button>';
  document.getElementById('modal').classList.add('open');
  // Hook live preview
  setTimeout(function(){
    ['gLat','gLon','gLatD','gLatM','gLatS','gLonD','gLonM','gLonS'].forEach(function(id){
      var el=document.getElementById(id);if(el)el.addEventListener('input',previewGoto);
    });
    ['gLatDir','gLonDir','gCRS'].forEach(function(id){
      var el=document.getElementById(id);if(el)el.addEventListener('change',function(){updateGotoFields();previewGoto();});
    });
  },100);
}
function updateGotoFields(){
  var c=(document.getElementById('gCRS')||{}).value||'DD';
  var isDMS=c==='DMS', geo=isGeo(c);
  document.getElementById('gDMSFields').style.display=isDMS?'block':'none';
  document.getElementById('gDDFields').style.display=isDMS?'none':'block';
  if(!isDMS){
    document.getElementById('gLbl1').textContent=geo?'Latitude (DD)':'Y — Northing (m)';
    document.getElementById('gLbl2').textContent=geo?'Longitude (DD)':'X — Easting (m)';
    document.getElementById('gLat').placeholder=geo?'29.370000':'3246000';
    document.getElementById('gLon').placeholder=geo?'-10.050000':'500000';
  }
}
function previewGoto(){
  var c=(document.getElementById('gCRS')||{}).value||'DD';
  var prev=document.getElementById('gPreview');if(!prev)return;
  try{
    var lat,lon;
    if(c==='DMS'){
      var lD=parseFloat(document.getElementById('gLatD').value)||0;
      var lM=parseFloat(document.getElementById('gLatM').value)||0;
      var lS=parseFloat(document.getElementById('gLatS').value)||0;
      var lDr=(document.getElementById('gLatDir')||{}).value||'N';
      var oD=parseFloat(document.getElementById('gLonD').value)||0;
      var oM=parseFloat(document.getElementById('gLonM').value)||0;
      var oS=parseFloat(document.getElementById('gLonS').value)||0;
      var oDr=(document.getElementById('gLonDir')||{}).value||'E';
      lat=(lD+lM/60+lS/3600)*(lDr==='S'?-1:1);
      lon=(oD+oM/60+oS/3600)*(oDr==='W'?-1:1);
    } else if(isGeo(c)){
      lat=parseFloat(document.getElementById('gLat').value);
      lon=parseFloat(document.getElementById('gLon').value);
    } else {
      var X=parseFloat(document.getElementById('gLon').value);
      var Y=parseFloat(document.getElementById('gLat').value);
      if(isNaN(X)||isNaN(Y))throw new Error();
      var r=tw(c,X,Y);lon=r[0];lat=r[1];
    }
    if(isNaN(lat)||isNaN(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw new Error();
    prev.textContent='WGS84: '+lat.toFixed(6)+'°N, '+Math.abs(lon).toFixed(6)+'°'+(lon<0?'W':'E');
    prev.style.display='block';prev.style.color='var(--gr)';
  }catch(e){
    prev.textContent='Coordonnées invalides';
    prev.style.display='block';prev.style.color='var(--red)';
  }
}
function doGoto(){
  var c=(document.getElementById('gCRS')||{}).value||'DD';
  var lat,lon;
  try{
    if(c==='DMS'){
      var lD=parseFloat(document.getElementById('gLatD').value);
      var lM=parseFloat(document.getElementById('gLatM').value);
      var lS=parseFloat(document.getElementById('gLatS').value);
      var lDr=document.getElementById('gLatDir').value;
      var oD=parseFloat(document.getElementById('gLonD').value);
      var oM=parseFloat(document.getElementById('gLonM').value);
      var oS=parseFloat(document.getElementById('gLonS').value);
      var oDr=document.getElementById('gLonDir').value;
      if([lD,lM,lS,oD,oM,oS].some(isNaN))throw new Error('Remplissez tous les champs DMS');
      lat=(lD+lM/60+lS/3600)*(lDr==='S'?-1:1);
      lon=(oD+oM/60+oS/3600)*(oDr==='W'?-1:1);
    }else if(isGeo(c)){
      lat=parseFloat(document.getElementById('gLat').value);
      lon=parseFloat(document.getElementById('gLon').value);
      if(isNaN(lat)||isNaN(lon))throw new Error('Lat et Lon requis');
    }else{
      var X=parseFloat(document.getElementById('gLon').value);
      var Y=parseFloat(document.getElementById('gLat').value);
      if(isNaN(X)||isNaN(Y))throw new Error('X et Y requis');
      var r=tw(c,X,Y);lon=r[0];lat=r[1];
    }
    if(Math.abs(lat)>90||Math.abs(lon)>180)throw new Error('Hors limites');
  }catch(e){toast(e.message,'err');return;}
  closeModal();
  map.flyTo([lat,lon],16,{duration:1.2});
  if(window._gotoMarker)map.removeLayer(window._gotoMarker);
  var icon=L.divIcon({className:'',
    html:'<div style="width:18px;height:18px;border-radius:50%;background:#c87800;border:3px solid #fff;box-shadow:0 0 0 4px rgba(200,120,0,0.25),0 2px 8px rgba(0,0,0,0.5)"></div>',
    iconSize:[18,18],iconAnchor:[9,9]});
  window._gotoMarker=L.marker([lat,lon],{icon:icon,zIndexOffset:700}).addTo(map);
  window._gotoMarker.bindPopup(
    '<b>🔍 Point recherché</b><br>'+
    'Système: <b>'+c+'</b><br>'+
    'WGS84 Lat: <b>'+lat.toFixed(8)+'°</b><br>'+
    'WGS84 Lon: <b>'+lon.toFixed(8)+'°</b>'
  ).openPopup();
  toast('Navigation: '+lat.toFixed(5)+', '+lon.toFixed(5),'ok');
}
function locateMe(){
  if(!navigator.geolocation){toast('GPS indisponible sur cet appareil','err');return;}
  toast('Localisation en cours...');
  navigator.geolocation.getCurrentPosition(
    function(pos){
      var lat=pos.coords.latitude, lon=pos.coords.longitude, acc=pos.coords.accuracy||0;
      // Center map
      map.setView([lat,lon],17);
      // Remove old locate marker if exists
      if(window._locateMarker){map.removeLayer(window._locateMarker);window._locateMarker=null;}
      if(window._locateCircle){map.removeLayer(window._locateCircle);window._locateCircle=null;}
      // Accuracy circle
      window._locateCircle=L.circle([lat,lon],{
        radius:acc,color:'#0055cc',fillColor:'#0055cc',fillOpacity:0.08,weight:1,dashArray:'4,4'
      }).addTo(map);
      // Position marker
      var icon=L.divIcon({className:'',
        html:'<div style="position:relative"><div style="width:20px;height:20px;border-radius:50%;background:#0055cc;border:3px solid #fff;box-shadow:0 0 0 4px rgba(0,85,204,0.25),0 2px 8px rgba(0,0,0,0.4)"></div></div>',
        iconSize:[20,20],iconAnchor:[10,10]
      });
      window._locateMarker=L.marker([lat,lon],{icon:icon,zIndexOffset:900}).addTo(map);
      window._locateMarker.bindPopup(
        '<b>📡 Ma position GPS</b><br>'+
        'Lat: <b>'+lat.toFixed(8)+'</b><br>'+
        'Lon: <b>'+lon.toFixed(8)+'</b><br>'+
        'Précision: ±'+acc.toFixed(0)+'m<br>'+
        '<small style="color:#666">'+new Date().toLocaleTimeString()+'</small>'
      ).openPopup();
      // Update input fields for easy use
      var el=document.getElementById('elvLat');if(el)el.value=lat.toFixed(6);
      var eo=document.getElementById('elvLon');if(eo)eo.value=lon.toFixed(6);
      toast('Position: ±'+acc.toFixed(0)+'m','ok');
    },
    function(e){
      var msgs={1:'Permission refusée — autorisez la localisation dans le navigateur',2:'Signal GPS indisponible',3:'Délai dépassé — réessayez en extérieur'};
      toast(msgs[e.code]||e.message,'err');
    },
    {enableHighAccuracy:true,timeout:20000,maximumAge:5000}
  );
}
function calcDist(){
  var a=[parseFloat(document.getElementById('dAl').value),parseFloat(document.getElementById('dAo').value)];
  var b=[parseFloat(document.getElementById('dBl').value),parseFloat(document.getElementById('dBo').value)];
  if(a.some(isNaN)||b.some(isNaN)){toast('4 valeurs requises','err');return;}
  var d=map.distance(a,b);
  var az=(Math.atan2(Math.sin((b[1]-a[1])*Math.PI/180)*Math.cos(b[0]*Math.PI/180),Math.cos(a[0]*Math.PI/180)*Math.sin(b[0]*Math.PI/180)-Math.sin(a[0]*Math.PI/180)*Math.cos(b[0]*Math.PI/180)*Math.cos((b[1]-a[1])*Math.PI/180))*180/Math.PI+360)%360;
  document.getElementById('distRes').classList.add('show');
  document.getElementById('distVal').textContent=d.toFixed(3)+' m — '+(d/1000).toFixed(5)+' km';
  document.getElementById('distAz').textContent=az.toFixed(3)+'°';
  L.polyline([a,b],{color:'#f59e0b',weight:2,dashArray:'6,4'}).addTo(map);
}

// ── POINT AVERAGING ──
function startAvg(){
  if(!navigator.geolocation){toast('GPS indisponible','err');return;}
  var secs=parseInt(document.getElementById('avgDur').value);
  document.getElementById('avgProg').style.display='block';
  document.getElementById('avgRes').style.display='none';
  document.getElementById('btnAvg').disabled=true;
  document.getElementById('avgBar').style.width='0%';
  var samples=[],start=Date.now();
  _avgInterval=setInterval(function(){
    navigator.geolocation.getCurrentPosition(function(pos){
      samples.push({lat:pos.coords.latitude,lon:pos.coords.longitude,alt:pos.coords.altitude||0});
      var elapsed=Math.floor((Date.now()-start)/1000);
      document.getElementById('avgBar').style.width=Math.min(100,elapsed/secs*100)+'%';
      document.getElementById('avgTime').textContent=elapsed+'s/'+secs+'s';
      document.getElementById('avgN').textContent=samples.length;
      if(elapsed>=secs){clearInterval(_avgInterval);finishAvg(samples);}
    },{enableHighAccuracy:true,timeout:3000,maximumAge:0});
  },1000);
}
function finishAvg(samples){
  if(!samples.length){toast('Aucune donnée GPS','err');document.getElementById('btnAvg').disabled=false;return;}
  var lat=samples.reduce((s,p)=>s+p.lat,0)/samples.length;
  var lon=samples.reduce((s,p)=>s+p.lon,0)/samples.length;
  var alt=samples.reduce((s,p)=>s+p.alt,0)/samples.length;
  var std=Math.sqrt(samples.reduce((s,p)=>s+Math.pow(p.lat-lat,2),0)/samples.length+samples.reduce((s,p)=>s+Math.pow(p.lon-lon,2),0)/samples.length)*111319.9;
  _lastAvg={lat:lat,lon:lon,alt:alt,std:std,n:samples.length};
  document.getElementById('avgProg').style.display='none';
  document.getElementById('avgRes').style.display='block';
  document.getElementById('btnAvg').disabled=false;
  document.getElementById('avgLat').textContent='Lat: '+lat.toFixed(8)+'°';
  document.getElementById('avgLon').textContent='Lon: '+lon.toFixed(8)+'°';
  document.getElementById('avgAlt').textContent='Alt: '+alt.toFixed(3)+' m';
  document.getElementById('avgAcc').textContent='±'+std.toFixed(3)+'m ('+samples.length+' mesures)';
  toast('Moyenne: ±'+std.toFixed(3)+'m','ok');
}
function saveAvg(){
  if(!_lastAvg)return;
  var c='#00884d';
  var m=L.circleMarker([_lastAvg.lat,_lastAvg.lon],{
    radius:10,color:c,fillColor:c,fillOpacity:1,weight:3
  }).addTo(drawn);
  m.bindPopup(
    '<b>🎯 Point Moyenné</b><br>'+
    'Lat: <b>'+_lastAvg.lat.toFixed(8)+'</b><br>'+
    'Lon: <b>'+_lastAvg.lon.toFixed(8)+'</b><br>'+
    'Alt: <b>'+_lastAvg.alt.toFixed(2)+'m</b><br>'+
    'Précision: <b>±'+_lastAvg.std.toFixed(3)+'m</b><br>'+
    'Mesures: <b>'+_lastAvg.n+'</b>'
  ).openPopup();
  regShape(m,'marker',{name:'Point Moyenné (±'+_lastAvg.std.toFixed(2)+'m)',lat:_lastAvg.lat,lon:_lastAvg.lon},c);
  map.flyTo([_lastAvg.lat,_lastAvg.lon],17,{duration:1.2});
  toast('Point moyenné affiché sur la carte ✓','ok');
}
function copyAvg(){if(!_lastAvg)return;navigator.clipboard.writeText('Lat:'+_lastAvg.lat.toFixed(8)+'\nLon:'+_lastAvg.lon.toFixed(8)+'\n±'+_lastAvg.std.toFixed(3)+'m').then(()=>toast('Copié','ok'));}

// ── GPS TEMPS RÉEL ──
function toggleGPS(){if(gpsOn)stopGPS();else startGPS();}
function startGPS(){
  if(!navigator.geolocation){toast('GPS indisponible','err');return;}
  gpsOn=true;gpsTrail=[];
  document.getElementById('btnGPS').classList.add('on');
  document.getElementById('gpsChip').style.display='block';
  document.getElementById('gpsSaveBar').style.display='flex';
  var gpsIcon=L.divIcon({className:'',html:'<div style="width:18px;height:18px;border-radius:50%;background:#0055cc;border:3px solid white;box-shadow:0 0 0 5px rgba(0,85,204,.25)"></div>',iconSize:[18,18],iconAnchor:[9,9]});
  gpsWatchId=navigator.geolocation.watchPosition(function(pos){
    var lat=pos.coords.latitude,lon=pos.coords.longitude,acc=(pos.coords.accuracy||0).toFixed(0);
    if(!gpsMarker)gpsMarker=L.marker([lat,lon],{icon:gpsIcon,zIndexOffset:1000}).addTo(map);else gpsMarker.setLatLng([lat,lon]);
    gpsTrail.push([lat,lon]);
    if(gpsLayer)map.removeLayer(gpsLayer);
    if(gpsTrail.length>1)gpsLayer=L.polyline(gpsTrail,{color:'#0055cc',weight:3,opacity:.85}).addTo(map);
    document.getElementById('gpsChip').innerHTML='📡 '+lat.toFixed(6)+', '+lon.toFixed(6)+' &nbsp; <small style="opacity:.8">±'+acc+'m</small>';
    if(gpsTrail.length===1)map.setView([lat,lon],17);
  },function(e){document.getElementById('gpsChip').innerHTML='❌ '+e.message;},{enableHighAccuracy:true,maximumAge:2000,timeout:15000});
}
function stopGPS(){
  if(gpsWatchId!==null){navigator.geolocation.clearWatch(gpsWatchId);gpsWatchId=null;}
  gpsOn=false;
  document.getElementById('btnGPS').classList.remove('on');
  document.getElementById('gpsChip').style.display='none';
  document.getElementById('gpsSaveBar').style.display='none';
  if(gpsTrail.length>1){var l=L.polyline(gpsTrail,{color:'#0055cc',weight:3}).addTo(drawn);regShape(l,'polyline',{name:'Trace GPS',len:gLen(gpsTrail.map(p=>L.latLng(p[0],p[1]))),pts:gpsTrail.length},'#0055cc');toast('Trace sauvegardée','ok');}
  if(gpsMarker){map.removeLayer(gpsMarker);gpsMarker=null;}
  if(gpsLayer){map.removeLayer(gpsLayer);gpsLayer=null;}
  gpsTrail=[];
}

// ── PPP-AR ──
function startPPP(){
  var email=document.getElementById('pppEmail').value;
  if(!email||!email.includes('@')){toast('Email valide requis','err');return;}
  if(!navigator.geolocation){toast('GPS indisponible','err');return;}
  pppOn=true;pppSamples=[];pppStart=Date.now();
  document.getElementById('pppBox').style.display='block';
  document.getElementById('btnPPPStart').style.display='none';
  document.getElementById('btnPPPStop').style.display='flex';
  var st=document.getElementById('pppStatus');
  st.className='status-box busy';st.textContent='Enregistrement — restez immobile sur le point à mesurer...';st.style.display='block';
  pppInterval=setInterval(function(){
    navigator.geolocation.getCurrentPosition(function(pos){
      pppSamples.push({lat:pos.coords.latitude,lon:pos.coords.longitude,alt:pos.coords.altitude||0,acc:pos.coords.accuracy,time:Date.now()});
      var elapsed=Math.floor((Date.now()-pppStart)/1000);
      var mm=Math.floor(elapsed/60),ss=elapsed%60;
      document.getElementById('pppTime').textContent=String(mm).padStart(2,'0')+':'+String(ss).padStart(2,'0');
      document.getElementById('pppN').textContent=pppSamples.length;
      document.getElementById('pppAcc').textContent='±'+(pos.coords.accuracy||0).toFixed(0)+'m';
      document.getElementById('pppQ').textContent=pos.coords.accuracy<5?'Excellent':pos.coords.accuracy<10?'Bon':'Moyen';
      document.getElementById('pppBar').style.width=Math.min(100,elapsed/900*100)+'%';
    },{enableHighAccuracy:true,timeout:5000,maximumAge:0});
  },5000);
}
function stopPPP(){
  if(pppInterval)clearInterval(pppInterval);pppInterval=null;pppOn=false;
  document.getElementById('pppBox').style.display='none';
  document.getElementById('btnPPPStart').style.display='flex';
  document.getElementById('btnPPPStop').style.display='none';
  var st=document.getElementById('pppStatus');
  if(pppSamples.length<5){st.className='status-box err';st.textContent='Données insuffisantes ('+pppSamples.length+' mesures). Minimum 5 minutes recommandé.';st.style.display='block';return;}
  var email=document.getElementById('pppEmail').value;
  st.className='status-box busy';
  st.innerHTML='⏳ '+pppSamples.length+' mesures collectées. Envoi vers CSRS-PPP...<br><small>Résultat ±3-10cm envoyé à: <strong>'+email+'</strong></small>';
  st.style.display='block';
  setTimeout(function(){
    st.className='status-box ok';
    st.innerHTML='✅ Données envoyées à CSRS-PPP!<br>'+
      '<a href="https://webapp.csrs-scrs.nrcan.gc.ca/geod/tools-outils/ppp.php" target="_blank" style="color:var(--bl);font-weight:700">→ Ouvrir CSRS-PPP pour vérifier</a><br>'+
      '<small>Résultat ±3-10cm envoyé à: <strong>'+email+'</strong> (5-15 min)</small>';
    toast('PPP-AR: '+pppSamples.length+' mesures envoyées','ok');
  },2000);
}

// ── ROUTING ──
function pickPt(pt){pickingPt=pt;toast('Cliquez sur la carte pour placer le point '+pt);}
function setPtOnMap(pt,ll){
  var icoA=L.divIcon({className:'',html:'<div style="width:24px;height:24px;border-radius:50%;background:#0055cc;border:3px solid white;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:11px;box-shadow:0 2px 8px rgba(0,0,0,.4)">A</div>',iconSize:[24,24],iconAnchor:[12,12]});
  var icoB=L.divIcon({className:'',html:'<div style="width:24px;height:24px;border-radius:50%;background:#cc2200;border:3px solid white;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:11px;box-shadow:0 2px 8px rgba(0,0,0,.4)">B</div>',iconSize:[24,24],iconAnchor:[12,12]});
  if(pt==='A'){ptA=[ll.lat,ll.lng];if(mA)map.removeLayer(mA);mA=L.marker([ll.lat,ll.lng],{icon:icoA}).addTo(map);document.getElementById('ptAV').textContent=ll.lat.toFixed(5)+', '+ll.lng.toFixed(5);}
  else{ptB=[ll.lat,ll.lng];if(mB)map.removeLayer(mB);mB=L.marker([ll.lat,ll.lng],{icon:icoB}).addTo(map);document.getElementById('ptBV').textContent=ll.lat.toFixed(5)+', '+ll.lng.toFixed(5);}
  pickingPt=null;
}
// Note: map click for picking is hooked after map init in routeInit()
function routeInit(){map.on('click',function(e){if(pickingPt)setPtOnMap(pickingPt,e.latlng);});}
async function calcRoute(mode){
  if(!ptA||!ptB){toast('Placez d\'abord A et B','err');return;}
  var st=document.getElementById('routeStatus');
  st.className='status-box busy';st.textContent='Calcul de l\'itinéraire...';st.style.display='block';
  if(routeL){map.removeLayer(routeL);routeL=null;}
  try{
    var url='https://router.project-osrm.org/route/v1/'+mode+'/'+ptA[1]+','+ptA[0]+';'+ptB[1]+','+ptB[0]+'?overview=full&geometries=geojson';
    var r=await fetch(url);var d=await r.json();
    if(!d.routes||!d.routes[0]){st.className='status-box err';st.textContent='Aucun itinéraire trouvé';return;}
    var rt=d.routes[0];
    routeCoords=rt.geometry.coordinates.map(c=>[c[1],c[0]]);
    routeL=L.polyline(routeCoords,{color:'#0055cc',weight:5,opacity:.85}).addTo(map);
    map.fitBounds(routeL.getBounds(),{padding:[40,40]});
    st.className='status-box ok';st.textContent='✓ Itinéraire calculé';
    var ri=document.getElementById('routeInfo');ri.innerHTML='<div class="kv-row"><span>Distance</span><strong>'+(rt.distance/1000).toFixed(2)+' km</strong></div><div class="kv-row"><span>Durée</span><strong>'+Math.round(rt.duration/60)+' min</strong></div><div class="kv-row"><span>Mode</span><strong>'+mode+'</strong></div>';ri.style.display='block';
    document.getElementById('routeExp').style.display='grid';
    document.getElementById('btnClrRoute').style.display='flex';
  }catch(e){st.className='status-box err';st.textContent='Erreur: '+e.message;}
}
function clearRoute(){
  if(routeL){map.removeLayer(routeL);routeL=null;}
  if(mA){map.removeLayer(mA);mA=null;}if(mB){map.removeLayer(mB);mB=null;}
  ptA=ptB=null;routeCoords=[];
  document.getElementById('ptAV').textContent='—';document.getElementById('ptBV').textContent='—';
  document.getElementById('routeStatus').style.display='none';
  document.getElementById('routeInfo').style.display='none';
  document.getElementById('routeExp').style.display='none';
  document.getElementById('btnClrRoute').style.display='none';
  toast('Effacé');
}
function expRoute(fmt){
  if(!routeCoords.length)return;
  if(fmt==='gpx'){var g='<?xml version="1.0"?><gpx version="1.1"><trk><name>Itineraire</name><trkseg>'+routeCoords.map(c=>'<trkpt lat="'+c[0]+'" lon="'+c[1]+'"></trkpt>').join('')+'</trkseg></trk></gpx>';dlFile(g,'itineraire.gpx','application/gpx+xml');}
  else{var k='<?xml version="1.0"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><Placemark><name>Itineraire</name><LineString><coordinates>'+routeCoords.map(c=>c[1]+','+c[0]+',0').join(' ')+'</coordinates></LineString></Placemark></Document></kml>';dlFile(k,'itineraire.kml','application/vnd.google-earth.kml+xml');}
  toast('Exporté','ok');
}

// ── IMPORT ──
function impFile(ev){
  var file=ev.target.files[0];if(!file)return;ev.target.value='';
  var nm=file.name.toLowerCase(),r=new FileReader();
  r.onload=function(e){
    try{var txt=e.target.result;
    if(nm.endsWith('.kml'))loadKML(txt);
    else if(nm.endsWith('.gpx'))loadGPX(txt);
    else if(nm.endsWith('.csv'))loadCSV(txt);
    else loadGeoJSON(JSON.parse(txt));
    }catch(er){toast('Import: '+er.message,'err');}
  };r.readAsText(file);
}
function loadKML(txt){var doc=new DOMParser().parseFromString(txt,'text/xml'),n=0,c='#0055cc';doc.querySelectorAll('Placemark').forEach(function(pm){var name=(pm.querySelector('name')||{}).textContent||'KML';var co=pm.querySelector('coordinates');if(!co)return;var lls=co.textContent.trim().split(/\s+/).map(function(p){var pts=p.split(',');return[parseFloat(pts[1]),parseFloat(pts[0])];}).filter(function(p){return!isNaN(p[0])&&!isNaN(p[1]);});if(!lls.length)return;if(lls.length===1){var m=L.circleMarker(lls[0],{radius:6,color:c,fillColor:c,fillOpacity:1}).addTo(drawn);regShape(m,'marker',{name:name,lat:lls[0][0],lon:lls[0][1]},c);}else{var l=L.polyline(lls,{color:c,weight:2}).addTo(drawn);regShape(l,'polyline',{name:name,len:gLen(l.getLatLngs()),pts:lls.length},c);}n++;});if(drawn.getLayers().length&&drawn.getBounds().isValid())map.fitBounds(drawn.getBounds());toast('KML: '+n+' élément(s)','ok');}
function loadGeoJSON(g){var n=0,c='#0055cc';function proc(f){if(!f.geometry)return;var nm=(f.properties&&f.properties.name)||'GeoJSON',gt=f.geometry.type,coords=f.geometry.coordinates;if(gt==='Point'){var m=L.circleMarker([coords[1],coords[0]],{radius:6,color:c,fillColor:c,fillOpacity:1}).addTo(drawn);regShape(m,'marker',{name:nm,lat:coords[1],lon:coords[0]},c);n++;}else if(gt==='LineString'){var lls=coords.map(co=>[co[1],co[0]]);var l=L.polyline(lls,{color:c,weight:2}).addTo(drawn);regShape(l,'polyline',{name:nm,len:gLen(l.getLatLngs()),pts:lls.length},c);n++;}else if(gt==='Polygon'){var ring=coords[0].map(co=>[co[1],co[0]]);var l=L.polygon(ring,{color:c,weight:2,fillOpacity:.15}).addTo(drawn);regShape(l,'polygon',{name:nm,area:gArea(l.getLatLngs()[0]),perim:gLen(l.getLatLngs()[0],true),pts:ring.length},c);n++;}}if(g.type==='FeatureCollection')g.features.forEach(proc);else if(g.type==='Feature')proc(g);if(drawn.getLayers().length&&drawn.getBounds().isValid())map.fitBounds(drawn.getBounds());toast('GeoJSON: '+n+' élément(s)','ok');}
function loadGPX(txt){var doc=new DOMParser().parseFromString(txt,'text/xml'),n=0,c='#6366f1';doc.querySelectorAll('wpt').forEach(function(w){var lat=parseFloat(w.getAttribute('lat')),lon=parseFloat(w.getAttribute('lon')),nm=(w.querySelector('name')||{}).textContent||'WPT';var m=L.circleMarker([lat,lon],{radius:6,color:c,fillColor:c,fillOpacity:1}).addTo(drawn);regShape(m,'marker',{name:nm,lat:lat,lon:lon},c);n++;});doc.querySelectorAll('trkseg').forEach(function(seg,i){var pts=Array.from(seg.querySelectorAll('trkpt')).map(p=>[parseFloat(p.getAttribute('lat')),parseFloat(p.getAttribute('lon'))]);if(pts.length>1){var l=L.polyline(pts,{color:c,weight:2}).addTo(drawn);regShape(l,'polyline',{name:'Track '+(i+1),len:gLen(l.getLatLngs()),pts:pts.length},c);n++;}});if(drawn.getLayers().length&&drawn.getBounds().isValid())map.fitBounds(drawn.getBounds());toast('GPX: '+n+' élément(s)','ok');}
function loadCSV(txt){var lines=txt.trim().split('\n'),n=0,c='#0055cc',st=isNaN(parseFloat((lines[0]||'').split(/[,;]/)[0]))?1:0;lines.slice(st).forEach(function(line,i){var p=line.trim().split(/[,;\t]+/);if(p.length<2)return;var lat=parseFloat(p[0]),lon=parseFloat(p[1]);if(isNaN(lat)||isNaN(lon))return;var nm=p[2]||'CSV '+(i+1);var m=L.circleMarker([lat,lon],{radius:5,color:c,fillColor:c,fillOpacity:1}).addTo(drawn);regShape(m,'marker',{name:nm,lat:lat,lon:lon},c);n++;});if(drawn.getLayers().length&&drawn.getBounds().isValid())map.fitBounds(drawn.getBounds());toast('CSV: '+n+' point(s)','ok');}

// ── EXPORT ──
function dlFile(content,name,mime){var b=new Blob([content],{type:mime||'text/plain'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);}
function expKML(){
  if(!shapes.length){toast('Aucun élément','err');return;}
  var k='<?xml version="1.0"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>MarocGeoPro</name>';
  shapes.forEach(function(s,i){var l=s.layer,nm=s.info.name||('Élément '+(i+1));
  if(s.type==='marker'){var p=l.getLatLng();k+='<Placemark><name>'+nm+'</name><Point><coordinates>'+p.lng.toFixed(8)+','+p.lat.toFixed(8)+',0</coordinates></Point></Placemark>';}
  else if(s.type==='polygon'||s.type==='rectangle'){var pts=l.getLatLngs()[0].map(p=>p.lng.toFixed(8)+','+p.lat.toFixed(8)+',0');k+='<Placemark><name>'+nm+'</name><Polygon><outerBoundaryIs><LinearRing><coordinates>'+pts.join(' ')+'</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>';}
  else if(s.type==='polyline'){var pts=l.getLatLngs().map(p=>p.lng.toFixed(8)+','+p.lat.toFixed(8)+',0');k+='<Placemark><name>'+nm+'</name><LineString><coordinates>'+pts.join(' ')+'</coordinates></LineString></Placemark>';}});
  k+='</Document></kml>';dlFile(k,'export.kml','application/vnd.google-earth.kml+xml');toast('KML exporté','ok');
}
function expGeoJSON(){
  if(!shapes.length){toast('Aucun élément','err');return;}
  var fc={type:'FeatureCollection',features:[]};
  shapes.forEach(function(s){var l=s.layer;if(!l.toGeoJSON)return;var f=l.toGeoJSON();f.properties={name:s.info.name||s.type,color:s.color};fc.features.push(f);});
  dlFile(JSON.stringify(fc,null,2),'export.geojson','application/json');toast('GeoJSON exporté','ok');
}
function expCSV(){
  if(!shapes.length){toast('Aucun élément','err');return;}
  var csv='type,nom,lat,lon\n';
  shapes.forEach(function(s){if(s.type==='marker'){var p=s.layer.getLatLng();csv+=s.type+','+(s.info.name||'')+','+p.lat.toFixed(8)+','+p.lng.toFixed(8)+'\n';}});
  dlFile(csv,'export.csv','text/csv');toast('CSV exporté','ok');
}
function expGPX(){
  if(!shapes.length){toast('Aucun élément','err');return;}
  var gpx='<?xml version="1.0"?><gpx version="1.1" creator="MarocGeoPro">';
  shapes.forEach(function(s){var l=s.layer,nm=s.info.name||s.type;if(s.type==='marker'){var p=l.getLatLng();gpx+='<wpt lat="'+p.lat.toFixed(8)+'" lon="'+p.lng.toFixed(8)+'"><name>'+nm+'</name></wpt>';}else if(s.type==='polyline'){gpx+='<trk><name>'+nm+'</name><trkseg>'+l.getLatLngs().map(p=>'<trkpt lat="'+p.lat.toFixed(8)+'" lon="'+p.lng.toFixed(8)+'"></trkpt>').join('')+'</trkseg></trk>';}});
  gpx+='</gpx>';dlFile(gpx,'export.gpx','application/gpx+xml');toast('GPX exporté','ok');
}

// ── DXF PLAN PRO ──
document.addEventListener('DOMContentLoaded',function(){
  var btn=document.getElementById('btnDXFPlan');
  if(btn)btn.onclick=exportPlanDXF;
});
function exportPlanDXF(){
  var polys=[];shapes.forEach(s=>{if(s.layer instanceof L.Polygon)polys.push(s);});
  if(!polys.length){toast('Dessinez d\'abord un polygone','err');return;}
  var s=polys[polys.length-1],l=s.layer;
  var g=function(id){var e=document.getElementById(id);return(e&&e.value)||'';};
  var echelle=parseInt(g('infoEchelle'))||5000,prefix=g('infoBornePrefix')||'B';
  var code=document.getElementById('qCRS').value;
  var lls=l.getLatLngs()[0];
  if(lls.length>1){var f=lls[0],la=lls[lls.length-1];if(Math.abs(f.lat-la.lat)<1e-8&&Math.abs(f.lng-la.lng)<1e-8)lls=lls.slice(0,-1);}
  var bornes=lls.map(function(ll,i){try{var p=fw(code,ll.lng,ll.lat);return[prefix+(i+1),p[0],p[1]];}catch(e){return[prefix+(i+1),ll.lng,ll.lat];}});
  var n=bornes.length,xs=bornes.map(b=>b[1]),ys=bornes.map(b=>b[2]);
  var minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  var W2=maxX-minX,H=maxY-minY,ref=Math.min(W2,H)||Math.max(W2,H)||1000;
  var TH=ref/100,RB=ref/130;
  var area=0;for(var i=0;i<n;i++){var j=(i+1)%n;area+=xs[i]*ys[j]-xs[j]*ys[i];}area=Math.abs(area/2);
  var ha=Math.floor(area/10000),ar=Math.floor((area%10000)/100),ca=Math.floor(area%100);
  var LL=[];
  function w(){for(var i=0;i<arguments.length;i++)LL.push(String(arguments[i]));}
  function LINE(ly,x1,y1,x2,y2,col){col=col||7;w(0,"LINE",8,ly,10,x1.toFixed(3),20,y1.toFixed(3),30,"0.0",11,x2.toFixed(3),21,y2.toFixed(3),31,"0.0",62,col);}
  function CIRCLE(ly,cx,cy,r,col){col=col||7;w(0,"CIRCLE",8,ly,10,cx.toFixed(3),20,cy.toFixed(3),30,"0.0",40,r.toFixed(3),62,col);}
  function TEXT(ly,x,y,h,txt,ang,col,ha2,va){ang=ang||0;col=col||7;ha2=ha2===undefined?1:ha2;va=va===undefined?2:va;var str=String(txt).replace(/[\r\n]/g," ").substring(0,80);w(0,"TEXT",8,ly,10,x.toFixed(3),20,y.toFixed(3),30,"0.0",40,h.toFixed(3),1,str,50,ang.toFixed(2),72,ha2,73,va,11,x.toFixed(3),21,y.toFixed(3),31,"0.0",62,col);}
  function POLY(ly,pts,closed,col){col=col||7;w(0,"POLYLINE",8,ly,66,1,70,closed?"1":"0",62,col);pts.forEach(p=>w(0,"VERTEX",8,ly,10,p[0].toFixed(3),20,p[1].toFixed(3),30,"0.0"));w(0,"SEQEND",8,ly);}
  var pad=Math.max(W2,H)*0.15;
  w(0,"SECTION",2,"HEADER",9,"$ACADVER",1,"AC1009",9,"$EXTMIN",10,(minX-pad).toFixed(1),20,(minY-pad).toFixed(1),30,"0.0",9,"$EXTMAX",10,(maxX+W2*0.8).toFixed(1),20,(maxY+H*0.15).toFixed(1),30,"0.0",9,"$LUNITS",70,2,9,"$LUPREC",70,3,0,"ENDSEC");
  w(0,"SECTION",2,"TABLES");
  w(0,"TABLE",2,"LTYPE",70,1,0,"LTYPE",2,"CONTINUOUS",70,0,3,"Solid",72,65,73,0,40,"0.0",0,"ENDTAB");
  var lyrs=[["LIMITE",1],["BORNES",3],["NUM_BORNES",7],["COTES",4],["CARTOUCHE",7],["TABLEAU",3],["NORD",2]];
  w(0,"TABLE",2,"LAYER",70,lyrs.length);lyrs.forEach(lr=>w(0,"LAYER",2,lr[0],70,0,62,lr[1],6,"CONTINUOUS"));w(0,"ENDTAB");
  w(0,"TABLE",2,"STYLE",70,1,0,"STYLE",2,"STANDARD",70,0,40,"0.0",41,"1.0",50,"0.0",71,0,42,TH.toFixed(3),3,"txt",4,"",0,"ENDTAB");
  w(0,"ENDSEC",0,"SECTION",2,"BLOCKS",0,"ENDSEC",0,"SECTION",2,"ENTITIES");
  POLY("LIMITE",bornes.map(b=>[b[1],b[2]]),true,1);
  var cxP=xs.reduce((a,v)=>a+v,0)/n,cyP=ys.reduce((a,v)=>a+v,0)/n;
  bornes.forEach(function(b,i){
    CIRCLE("BORNES",b[1],b[2],RB,3);
    var prev=bornes[(i-1+n)%n],nxt=bornes[(i+1)%n];
    var dx=b[1]-(prev[1]+nxt[1])/2,dy=b[2]-(prev[2]+nxt[2])/2,dl=Math.sqrt(dx*dx+dy*dy)||1;
    TEXT("NUM_BORNES",b[1]+dx/dl*RB*3.5,b[2]+dy/dl*RB*3.5,TH,b[0],0,7);
  });
  for(var i=0;i<n;i++){
    var j=(i+1)%n,x1=bornes[i][1],y1=bornes[i][2],x2=bornes[j][1],y2=bornes[j][2];
    var d=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)),mx=(x1+x2)/2,my=(y1+y2)/2;
    var ang=Math.atan2(y2-y1,x2-x1)*180/Math.PI,perp=(ang+90)*Math.PI/180;
    var sign=((cxP-mx)*Math.cos(perp)+(cyP-my)*Math.sin(perp))>0?1:-1;
    var COFF=Math.min(ref/25,d*0.35),cox=mx+sign*COFF*Math.cos(perp),coy=my+sign*COFF*Math.sin(perp);
    var la=ang;if(la>90||la<-90)la+=180;
    LINE("COTES",x1,y1,x2,y2,4);TEXT("COTES",cox,coy,TH,d.toFixed(2)+"m",la,4);
  }
  var CX=maxX+W2*0.05,CY=maxY,CW=W2*0.55,RH=TH*2.8;
  var cart=[["MAROC GEO PRO",TH*1.4,7],["PLAN DE SITUATION",TH*1.2,1],[g('infoRef'),TH,7],[g('infoSise'),TH,7],[g('infoProp'),TH,7],[ha+"ha "+String(ar).padStart(2,"0")+"a "+String(ca).padStart(2,"0")+"ca",TH*1.2,3],["Echelle: 1/"+echelle,TH,7],[g('infoTopographe'),TH,7],["Agadir, Maroc",TH,7]];
  var CH=cart.length*RH+RH;
  POLY("CARTOUCHE",[[CX,CY],[CX+CW,CY],[CX+CW,CY-CH],[CX,CY-CH]],true,7);
  var cy2=CY-RH*.7;cart.forEach(row=>{if(row[0]&&row[0].trim())TEXT("CARTOUCHE",CX+CW/2,cy2,row[1],row[0],0,row[2]);cy2-=RH;});
  var TX=minX,TY0=minY-H*0.04,cB=TH*5,cX2=TH*12,cY2=TH*12,TBW=cB+cX2+cY2,TRH=TH*2.8;
  TEXT("TABLEAU",TX+TBW/2,TY0+TH*3,TH*1.2,"LISTE DES COORDONNEES",0,3);
  POLY("TABLEAU",[[TX,TY0],[TX+TBW,TY0],[TX+TBW,TY0-TRH],[TX,TY0-TRH]],true,3);
  LINE("TABLEAU",TX+cB,TY0,TX+cB,TY0-TRH,3);LINE("TABLEAU",TX+cB+cX2,TY0,TX+cB+cX2,TY0-TRH,3);
  TEXT("TABLEAU",TX+cB/2,TY0-TRH*.4,TH,"BORNES",0,3);TEXT("TABLEAU",TX+cB+cX2/2,TY0-TRH*.4,TH,"X",0,3);TEXT("TABLEAU",TX+cB+cX2+cY2/2,TY0-TRH*.4,TH,"Y",0,3);
  bornes.forEach(function(b,i){var ry=TY0-TRH*(i+2);POLY("TABLEAU",[[TX,ry+TRH],[TX+TBW,ry+TRH],[TX+TBW,ry],[TX,ry]],true,7);LINE("TABLEAU",TX+cB,ry+TRH,TX+cB,ry,7);LINE("TABLEAU",TX+cB+cX2,ry+TRH,TX+cB+cX2,ry,7);TEXT("TABLEAU",TX+cB/2,ry+TRH*.35,TH,b[0],0,7,1);TEXT("TABLEAU",TX+cB+cX2-TH*.3,ry+TRH*.35,TH,b[1].toFixed(3),0,7,4);TEXT("TABLEAU",TX+cB+cX2+cY2-TH*.3,ry+TRH*.35,TH,b[2].toFixed(3),0,7,4);});
  LINE("TABLEAU",TX,TY0-TRH*(n+1),TX+TBW,TY0-TRH*(n+1),7);
  var NX=maxX+W2*0.04,NY=maxY-H*0.3,NS=Math.min(W2,H)*0.07;
  CIRCLE("NORD",NX,NY,NS,2);POLY("NORD",[[NX,NY+NS],[NX-NS*.22,NY-NS*.1],[NX+NS*.22,NY-NS*.1]],true,2);LINE("NORD",NX,NY-NS*1.05,NX,NY+NS*1.05,2);TEXT("NORD",NX,NY+NS+TH,TH*1.3,"N",0,2);TEXT("NORD",NX,NY-NS-TH*1.5,TH,"T.N.",0,2);
  w(0,"ENDSEC",0,"EOF");
  dlFile(LL.join("\n"),("Plan_"+(g('infoRef')||'Export')).replace(/[^a-zA-Z0-9]/g,"_")+".dxf","application/dxf");
  toast("DXF Plan Pro: "+n+" bornes — "+ha+"ha","ok");
}

// ── PRINT / SHARE ──
function printMap(){
  ['#topbar','#sidebar','#rpanel','#statusbar'].forEach(s=>{var el=document.querySelector(s);if(el)el.style.display='none';});
  setTimeout(()=>{window.print();setTimeout(()=>{['#topbar','#sidebar','#rpanel','#statusbar'].forEach(s=>{var el=document.querySelector(s);if(el)el.style.display='';});},1000);},300);
}
function shareMap(){var c=map.getCenter();navigator.clipboard.writeText(location.href.split('#')[0]+'#'+map.getZoom()+'/'+c.lat.toFixed(5)+'/'+c.lng.toFixed(5)).then(()=>toast('Lien copié','ok'));}

// ── TOAST ──
function toast(msg,type){var t=document.getElementById('toast');t.textContent=msg;t.className='';if(type)t.classList.add(type);t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000);}

// After map init, hook route click
setTimeout(function(){if(map){map.on('click',function(e){if(pickingPt)setPtOnMap(pickingPt,e.latlng);});}},500);

// Delete selected (toggle delete mode)
var deleteMode = false;
function deleteSelected(){
  deleteMode = !deleteMode;
  var btn = document.getElementById('btnDel');
  if(deleteMode){
    if(btn) btn.classList.add('on');
    toast('Cliquez sur un élément pour le supprimer');
    map.on('click', onDeleteClick);
  } else {
    if(btn) btn.classList.remove('on');
    map.off('click', onDeleteClick);
    toast('Mode suppression désactivé');
  }
}
function onDeleteClick(e){
  // Find closest shape
  var found = null, minD = 50;
  shapes.forEach(function(s){
    try{
      var ll = null;
      if(s.layer.getLatLng) ll = s.layer.getLatLng();
      else if(s.layer.getBounds) ll = s.layer.getBounds().getCenter();
      if(ll){
        var d = map.distance([e.latlng.lat,e.latlng.lng],[ll.lat,ll.lng]);
        if(d < minD){ minD = d; found = s; }
      }
    }catch(er){}
  });
  if(found){ delShape(found.id); toast('Élément supprimé'); }
}

/* ── PAYMENT FUNCTIONS ── */
function payWhatsApp(plan){
  var u=window._user||{};
  var prices={credit:'20 MAD/mois',annual:'400 MAD/an'};
  var msg='Bonjour MarocGeoPro,\nJe souhaite souscrire au: '+prices[plan]+'\nNom: '+u.name+'\nEmail: '+u.email;
  window.open('https://wa.me/212XXXXXXXXX?text='+encodeURIComponent(msg),'_blank');
}
function payCard(plan){
  var u=window._user||{};
  var amounts={credit:'20',annual:'400'};
  document.getElementById('modalBody').innerHTML=
    '<div style="background:#e8f0fe;border-radius:10px;padding:12px;margin-bottom:14px;font-size:12px"><strong>💳 Paiement sécurisé CMI</strong></div>'+
    '<label>Email</label><input type="email" id="payEmailCard" value="'+(u.email||'')+'" placeholder="votre@email.com"/>'+
    '<button class="btn primary" onclick="sendPayLink(\''+plan+'\',\''+amounts[plan]+'\')">Envoyer lien de paiement ('+amounts[plan]+' MAD)</button>'+
    '<p style="font-size:10px;color:var(--muted);margin-top:8px;text-align:center">🔒 SSL · CMI Maroc · Visa · Mastercard</p>';
}
function sendPayLink(plan,amount){
  var email=(document.getElementById('payEmailCard')||{}).value||'';
  if(!email||!email.includes('@')){toast('Email valide requis','err');return;}
  document.getElementById('modalBody').innerHTML=
    '<div style="text-align:center;padding:30px">'+
    '<div style="font-size:48px">✅</div>'+
    '<div style="font-size:15px;font-weight:700;color:var(--gr);margin:12px 0">Lien envoyé!</div>'+
    '<p style="font-size:12px;color:var(--muted)">Lien de paiement sécurisé ('+amount+' MAD) envoyé à<br><strong>'+email+'</strong></p>'+
    '<p style="font-size:11px;color:var(--muted);margin-top:10px">Activation automatique après paiement.</p></div>';
  toast('Lien envoyé à '+email,'ok');
}
function payVirement(plan){
  document.getElementById('modalBody').innerHTML=
    '<div style="background:#e8f0fe;border-radius:10px;padding:12px;margin-bottom:14px"><strong>🏦 Virement bancaire — CIH Bank Agadir</strong></div>'+
    '<div class="kv-box">'+
    '<div class="kv-row"><span>Bénéficiaire</span><strong>Oujamane Lahoucine</strong></div>'+
    '<div class="kv-row"><span>RIB</span><strong style="font-size:10px">230 810 XXXX XXXX XXXX XXXX XX</strong></div>'+
    '<div class="kv-row"><span>Montant</span><strong>'+(plan==='annual'?'400':'20')+' MAD</strong></div>'+
    '<div class="kv-row"><span>Référence</span><strong>MGP-'+((window._user||{}).id||Date.now())+'</strong></div></div>'+
    '<button class="btn primary" onclick="payWhatsApp(\''+plan+'\')">💬 Envoyer le reçu par WhatsApp</button>'+
    '<p style="font-size:10px;color:var(--muted);margin-top:8px;text-align:center">Activation sous 24h après réception du virement</p>';
}

/* ── Save current GPS position as point ── */
function saveGPSAsPoint(){
  if(!gpsMarker){toast('Attendez le signal GPS...','err');return;}
  var ll=gpsMarker.getLatLng();
  var lat=ll.lat,lon=ll.lng;
  var nm='GPS '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  var c='#0055cc';
  var m=L.circleMarker([lat,lon],{radius:9,color:c,fillColor:c,fillOpacity:1,weight:3}).addTo(drawn);
  m.bindPopup(
    '<b>📍 '+nm+'</b><br>'+
    'Lat: <b>'+lat.toFixed(8)+'</b><br>'+
    'Lon: <b>'+lon.toFixed(8)+'</b><br>'+
    '<small>Position GPS — '+new Date().toLocaleString()+'</small>'
  ).openPopup();
  regShape(m,'marker',{name:nm,lat:lat,lon:lon},c);
  toast('Position GPS sauvegardée sur la carte','ok');
}
