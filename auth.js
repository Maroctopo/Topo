/* ══ MarocGeoPro — Auth System ══ */
var AUTH = (function(){
  var USERS_KEY = 'mgp_users';
  var SESSION_KEY = 'mgp_session';

  function getUsers(){ return JSON.parse(localStorage.getItem(USERS_KEY)||'[]'); }
  function saveUsers(u){ localStorage.setItem(USERS_KEY,JSON.stringify(u)); }
  function getSession(){ return JSON.parse(localStorage.getItem(SESSION_KEY)||'null'); }
  function saveSession(s){ localStorage.setItem(SESSION_KEY,JSON.stringify(s)); }
  function clearSession(){ localStorage.removeItem(SESSION_KEY); }

  function login(email, pass){
    var users = getUsers();
    var user = users.find(function(u){ return u.email===email && u.pass===btoa(pass); });
    if(!user) throw new Error('Email ou mot de passe incorrect');
    user.lastLogin = new Date().toISOString();
    saveUsers(users);
    saveSession(user);
    return user;
  }

  function register(name, email, phone, pass, plan){
    if(!name||!email||!pass) throw new Error('Champs obligatoires manquants');
    if(!email.includes('@')) throw new Error('Email invalide');
    if(pass.length < 6) throw new Error('Mot de passe: minimum 6 caractères');
    var users = getUsers();
    if(users.find(function(u){ return u.email===email; }))
      throw new Error('Cet email est déjà utilisé');
    var user = {
      id: 'u'+Date.now(),
      name: name, email: email, phone: phone||'',
      pass: btoa(pass), plan: plan||'credit',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      trialEnd: new Date(Date.now()+14*86400000).toISOString(),
      projectCount: 0, exportCount: 0
    };
    users.push(user);
    saveUsers(users);
    saveSession(user);
    return user;
  }

  function demo(){
    return {
      id:'demo', name:'Mode Démo', email:'demo@marocgeopro.ma',
      plan:'demo', trialEnd: new Date(Date.now()+14*86400000).toISOString(),
      projectCount:0, exportCount:0
    };
  }

  function logout(){ clearSession(); }
  function current(){ return getSession(); }

  function trialDaysLeft(user){
    if(!user||!user.trialEnd) return 0;
    return Math.max(0, Math.ceil((new Date(user.trialEnd)-Date.now())/86400000));
  }

  return { login:login, register:register, demo:demo, logout:logout, current:current, trialDaysLeft:trialDaysLeft };
})();
