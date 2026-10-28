/* ===========================================================
   Gestión Fábrica — versión de demostración
   Base de datos simulada en memoria. No hay servidor ni nube:
   todo corre dentro del navegador con datos de ejemplo.
   =========================================================== */
(function () {
  'use strict';

  /* ---------- utilidades ---------- */
  var pad = function (n) { return ('0' + n).slice(-2); };
  function fechaDe(off) {
    var d = new Date(); d.setDate(d.getDate() + (off || 0));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  var HOY = fechaDe(0);
  // generador determinista: la demo se ve igual cada vez
  var _s = 20261028;
  function rnd() { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; }
  function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function hhmm(h, m) { return pad(h) + ':' + pad(m); }

  /* ---------- catálogo de referencias ---------- */
  var REFS = [
    ['A1001', 'Camiseta sin costura dama', 12, 158.0, 'Algodón', '30/1', 'L-4412', 72, 'Elastano', '40D', 'L-9031', 28],
    ['A1002', 'Camiseta sin costura hombre', 12, 171.5, 'Algodón', '30/1', 'L-4412', 75, 'Elastano', '40D', 'L-9031', 25],
    ['A1010', 'Top deportivo', 12, 96.4, 'Poliamida', '70/68', 'L-2208', 80, 'Elastano', '40D', 'L-9031', 20],
    ['A1011', 'Top control alto', 12, 108.2, 'Poliamida', '70/68', 'L-2208', 78, 'Elastano', '70D', 'L-9044', 22],
    ['A2005', 'Faja corta moldeadora', 6, 214.0, 'Poliamida', '44/34', 'L-2211', 70, 'Elastano', '70D', 'L-9044', 30],
    ['A2006', 'Faja larga moldeadora', 6, 268.5, 'Poliamida', '44/34', 'L-2211', 68, 'Elastano', '70D', 'L-9044', 32],
    ['A3002', 'Panty clásico', 24, 47.8, 'Algodón', '40/1', 'L-4418', 85, 'Elastano', '20D', 'L-9012', 15],
    ['A3003', 'Panty microfibra', 24, 42.3, 'Poliamida', '70/68', 'L-2208', 82, 'Elastano', '20D', 'L-9012', 18],
    ['A4001', 'Legging deportivo', 6, 236.7, 'Poliamida', '44/34', 'L-2211', 76, 'Elastano', '70D', 'L-9044', 24],
    ['A4002', 'Short deportivo', 12, 142.9, 'Poliamida', '70/68', 'L-2208', 79, 'Elastano', '40D', 'L-9031', 21],
    ['A5001', 'Camisilla control', 12, 166.3, 'Algodón', '30/1', 'L-4412', 74, 'Elastano', '40D', 'L-9031', 26],
    ['A5002', 'Body sin costura', 6, 198.4, 'Poliamida', '44/34', 'L-2211', 72, 'Elastano', '70D', 'L-9044', 28]
  ];
  var TIEMPO = { A1001: 7.4, A1002: 7.9, A1010: 4.6, A1011: 5.2, A2005: 9.8, A2006: 12.1,
                 A3002: 2.3, A3003: 2.1, A4001: 10.7, A4002: 6.5, A5001: 7.7, A5002: 9.1 };
  window.GF_REFS = REFS.map(function (r) {
    return [r[0], r[1], 'santoni', 'SM-Serie 3', r[2], Math.round(TIEMPO[r[0]] * r[2] * 10) / 10];
  });

  /* ---------- máquinas y personas ---------- */
  var MAQS = [], i;
  for (i = 1; i <= 10; i++) MAQS.push({ id: 'S' + i, type: 'santoni', model: 'SM-Serie 3', diam: (i % 3 === 0 ? '15"' : i % 2 === 0 ? '14"' : '13"'), teamId: 'E1', active: true });
  for (i = 11; i <= 20; i++) MAQS.push({ id: 'S' + i, type: 'santoni', model: 'SM-Serie 4', diam: (i % 3 === 0 ? '15"' : i % 2 === 0 ? '14"' : '13"'), teamId: 'E2', active: true });

  var PERS = [
    { id: 'OP01', n: 'Ana Gómez',       c: 'Tejedora',  e: 'E1', g: 'A', rot: 'rota' },
    { id: 'OP02', n: 'Carlos Rivas',    c: 'Tejedor',   e: 'E1', g: 'B', rot: 'rota' },
    { id: 'OP03', n: 'Lucía Peña',      c: 'Tejedora',  e: 'E2', g: 'A', rot: 'rota' },
    { id: 'OP04', n: 'Mario Beltrán',   c: 'Tejedor',   e: 'E2', g: 'B', rot: 'rota' },
    { id: 'OP05', n: 'Sofía Cardona',   c: 'Tejedora',  e: 'E1', g: 'B', rot: 'rota' },
    { id: 'OP06', n: 'Diego Salcedo',   c: 'Tejedor',   e: 'E2', g: 'A', rot: 'rota' },
    { id: 'OP07', n: 'Marta Londoño',   c: 'Revisadora', e: 'E1', g: 'A', rot: 'rota' },
    { id: 'OP08', n: 'Julián Mejía',    c: 'Tejedor',   e: 'E2', g: 'B', rot: 'rota' },
    { id: 'AP01', n: 'Hernán Ospina',   c: 'Mecánico',  e: 'E1', rot: 'dia' },
    { id: 'AP02', n: 'Paula Zuluaga',   c: 'Mecánica',  e: 'E2', rot: 'dia' },
    { id: 'AP03', n: 'Andrés Quintero', c: 'Enconador', e: 'E1', rot: 'noche' },
    { id: 'AP04', n: 'Camila Duarte',   c: 'Planillera', e: 'E2', rot: 'noche' },
    { id: 'AP05', n: 'Rubén Castaño',   c: 'Supervisor', e: 'E1', rot: 'dia' },
    { id: 'AP06', n: 'Valeria Ríos',    c: 'Jefe de información', e: 'E2', rot: 'dia' }
  ];
  var OPS = PERS.filter(function (p) { return p.id.indexOf('OP') === 0; })
                .map(function (p) { return { id: p.id, name: p.n, active: true }; });

  var MOTIVOS = ['Cambio de referencia', 'Rotura de aguja', 'Falta de hilo', 'Ajuste de galga', 'Mantenimiento correctivo'];

  /* ---------- semilla ---------- */
  var ST = {};
  function put(id, d) { d._id = id; ST[id] = d; }

  put('GF-OPS-CONFIG', { ops: OPS, maqs: MAQS, tipo: 'config', _upd: Date.now() });

  // precosteos (fichas técnicas con composición de hilo)
  REFS.forEach(function (r, k) {
    put('SW-' + r[0], {
      tipo: 'precosteo',
      nombrePrenda: r[1],
      header: { referencia: r[0], nombrePrenda: r[1], tubosPorDocena: r[2], cliente: 'Cliente ' + (k % 3 + 1) },
      specs: { pesoUnitarioGramos: r[3], tiempoMin: Math.floor(TIEMPO[r[0]]), tiempoSeg: Math.round((TIEMPO[r[0]] % 1) * 60), galga: 28 },
      fibras: [
        { nombre: r[4], titulo: r[5], lote: r[6], porcentaje: r[7], itemS: 'IT-' + (1000 + k), itemZ: '' },
        { nombre: r[8], titulo: r[9], lote: r[10], porcentaje: r[11], itemS: 'IT-' + (2000 + k), itemZ: '' }
      ],
      _upd: Date.now()
    });
  });

  // lotes abiertos y cerrados de los últimos 6 días
  var nL = 0;
  function lote(maq, op, ref, fecha, abierto, hi, hf, parado) {
    var r = null; for (var z = 0; z < REFS.length; z++) if (REFS[z][0] === ref) r = REFS[z];
    var doc = r[2];
    var dur = abierto ? null : ((parseInt(hf) - parseInt(hi) + 24) % 24) * 60 + (parseInt(hf.slice(3)) - parseInt(hi.slice(3)));
    var pm = abierto ? ri(0, 20) : ri(5, 70);
    var eff = abierto ? null : ri(63, 97);
    var tubos = abierto ? null : Math.max(4, Math.round((dur - pm) * eff / 100 / TIEMPO[ref]));
    var std = tubos ? Math.round(tubos * TIEMPO[ref] * 10) / 10 : null;
    var id = 'LOTE-' + (1761600000000 + (nL++) * 97531);
    put(id, {
      tipo: 'lote', id: id.slice(5), ts: Date.now() - nL * 60000,
      fecha: fecha, maqId: maq, opId: op, turno: parseInt(hi) < 12 ? 'DIA-12' : 'NOC-12',
      refId: ref, lotSize: ri(3, 9) * doc,
      ctrStart: 0, ctrEnd: tubos, tubos: tubos,
      hi: hi, hf: abierto ? null : hf, dur: dur,
      paros: [], parosMin: pm, std: std, eff: eff, obs: '',
      status: abierto ? 'abierto' : 'cerrado',
      parado: parado ? { mot: parado, ini: Date.now() - ri(10, 90) * 60000 } : null,
      _upd: Date.now() - nL * 60000
    });
  }
  // historial
  for (var d = 6; d >= 1; d--) {
    var f = fechaDe(-d);
    MAQS.forEach(function (m, k) {
      if (rnd() < 0.12) return;                       // algún día sin lote
      var op = OPS[(k + d) % OPS.length].id, ref = REFS[(k * 3 + d) % REFS.length][0];
      lote(m.id, op, ref, f, false, hhmm(6, 0), hhmm(18, 0));
      if (rnd() < 0.5) lote(m.id, OPS[(k + d + 3) % OPS.length].id, ref, f, false, hhmm(18, 0), hhmm(6, 0));
    });
  }
  // hoy: cerrados en la mañana y abiertos corriendo
  MAQS.forEach(function (m, k) {
    if (rnd() < 0.3) lote(m.id, OPS[k % OPS.length].id, REFS[(k * 5) % REFS.length][0], HOY, false, hhmm(6, 0), hhmm(13, ri(0, 55)));
    if (k === 4 || k === 13) return;                  // dos máquinas sin lote
    var parado = (k === 2 || k === 9 || k === 16) ? pick(MOTIVOS) : null;
    lote(m.id, OPS[k % OPS.length].id, REFS[(k * 7) % REFS.length][0], HOY, true, hhmm(k < 10 ? 6 : 14, ri(0, 50)), null, parado);
  });

  // hojas de vida de máquinas
  var NOTAS = [
    ['Mantenimiento', 'Lubricación general y revisión de platinas', 'aceite, platinas'],
    ['Cambio de elemento', 'Cambio de agujas del cilindro', 'agujas'],
    ['Reparación', 'Ajuste del tensor de hilo', 'tensor'],
    ['Revisión', 'Revisión de correas y poleas', 'correa'],
    ['Mantenimiento', 'Limpieza de filtros y succión', 'filtros']
  ];
  MAQS.forEach(function (m, k) {
    var n = ri(1, 3);
    for (var j = 0; j < n; j++) {
      var t = NOTAS[(k + j) % NOTAS.length];
      put('MAQNOTA-' + m.id + '-' + j, {
        tipo: 'maq_nota', maqId: m.id, tipoN: t[0], nota: t[1], elem: t[2],
        fecha: fechaDe(-ri(3, 160)), mec: pick(['Hernán Ospina', 'Paula Zuluaga']),
        ts: Date.now() - ri(1, 200) * 86400000
      });
    }
  });

  // desarrollo de producto
  var DEV = [
    ['Camiseta térmica dama', 'circulares', 'alta', 'Pendiente prueba de encogimiento'],
    ['Faja post-quirúrgica', 'ingenieria', 'alta', 'Ajustando compresión en cintura'],
    ['Top juvenil estampado', 'diseno', 'media', 'Esperando arte del cliente'],
    ['Panty seamless infantil', 'tintoreria', 'media', 'Prueba de color en curso'],
    ['Legging alta compresión', 'aprobacion', 'alta', 'Muestra enviada a gerencia'],
    ['Camisilla básica hombre', 'confeccion', 'baja', 'Ajuste de ruedo']
  ];
  DEV.forEach(function (x, k) {
    put('DEV-' + (100 + k), {
      tipo: 'desarrollo', nombre: x[0], categoria: '', prioridad: x[2], etapa: x[1],
      nota: x[3], fecha: fechaDe(ri(5, 40)), createdAt: Date.now() - ri(10, 60) * 86400000,
      updatedAt: Date.now() - ri(1, 9) * 86400000, _upd: Date.now()
    });
  });

  /* ---------- personal ---------- */
  var DIA_T = ['', '08:00-18:00', '06:00-18:00', '06:00-18:00', '06:00-18:00', '06:00-18:00', '06:00-18:00'];
  var NOC_T = ['', '18:00-06:00', '18:00-06:00', '18:00-06:00', '18:00-06:00', '18:00-06:00', '18:00-06:00'];
  var DIA_A = ['', '08:00-17:00', '07:00-17:00', '07:00-17:00', '07:00-16:00', '07:00-16:00', '07:00-12:00'];
  var VAC = ['', '', '', '', '', '', ''];
  PERS.forEach(function (p, k) {
    var tej = p.rot === 'rota';
    put('RH-P-' + p.id, {
      tipo: 'rh_persona', nombre: p.n, cedula: String(1010200300 + k * 137), cargo: p.c, equipo: p.e,
      ingreso: fechaDe(-ri(400, 2800)), tel: '31' + ri(0, 9) + ' ' + ri(100, 999) + ' ' + ri(1000, 9999),
      emerg: pick(['Hermano', 'Madre', 'Esposo(a)']) + ' · 31' + ri(0, 9) + ' ' + ri(100, 999) + ' ' + ri(1000, 9999),
      activo: true, rot: p.rot, grp: p.g || 'A', alm: tej ? 30 : 60,
      d: tej ? DIA_T : (p.rot === 'dia' ? DIA_A : VAC),
      n: tej ? NOC_T : (p.rot === 'noche' ? NOC_T : VAC),
      ts: Date.now()
    });
  });
  // timbradas de los últimos 20 días
  (function () {
    var marc = {}, mesSet = {};
    for (var dd = 20; dd >= 1; dd--) {
      var fe = fechaDe(-dd), mm = fe.slice(0, 7), wd = new Date(+fe.slice(0, 4), +fe.slice(5, 7) - 1, +fe.slice(8)).getDay();
      if (wd === 0) continue;
      mesSet[mm] = 1; marc[mm] = marc[mm] || {};
      PERS.forEach(function (p) {
        var pid = 'RH-P-' + p.id;
        if (rnd() < 0.05) return;                      // marcación perdida
        var noche;
        if (p.rot === 'dia') noche = false;
        else if (p.rot === 'noche') noche = true;
        else {                                         // rota: misma regla que usa el módulo
          var lun = new Date(+fe.slice(0, 4), +fe.slice(5, 7) - 1, +fe.slice(8));
          lun.setDate(lun.getDate() - ((lun.getDay() + 6) % 7));
          var hoyLun = new Date(); hoyLun.setHours(0, 0, 0, 0);
          hoyLun.setDate(hoyLun.getDate() - ((hoyLun.getDay() + 6) % 7));
          var sem = Math.round((lun - hoyLun) / 6048e5), par = ((sem % 2) + 2) % 2;
          noche = !((p.g === 'A') === (par === 0));
        }
        if (!noche && p.rot !== 'rota' && wd === 6 && p.rot === 'dia' && rnd() < 0.4) return;
        var ent = noche ? [18, 0] : (wd === 1 ? [8, 0] : [6, 0]);
        var sal = noche ? [6, 0] : [18, 0];
        if (p.rot === 'dia') { ent = (wd === 1 ? [8, 0] : [7, 0]); sal = (wd >= 4 ? [16, 0] : [17, 0]); }
        var e = hhmm(ent[0], 0) , s2 = hhmm(sal[0], 0);
        var em = ent[1] + ri(-9, 4), sm = sal[1] + ri(-5, 22);
        e = hhmm(ent[0] + (em < 0 ? -1 : 0), (em + 60) % 60);
        s2 = hhmm(sal[0] + (sm >= 60 ? 1 : 0), (sm + 60) % 60);
        (marc[mm][pid] = marc[mm][pid] || []).push(fe + ' ' + e);
        if (rnd() > 0.05) (marc[mm][pid] = marc[mm][pid] || []).push((noche ? fechaDe(-dd + 1) : fe) + ' ' + s2);
      });
    }
    Object.keys(mesSet).forEach(function (mm) {
      var out = {}; Object.keys(marc[mm]).forEach(function (pid) { out[pid] = marc[mm][pid].sort(); });
      put('RH-M-' + mm, { tipo: 'rh_marc', mes: mm, m: out });
    });
    var r = {}; r.i0 = { d: fechaDe(-20), h: fechaDe(-1) };
    put('RH-COB', { tipo: 'rh_cob', r: r });
  })();
  // novedades
  [['OP02', 'Incapacidad', -9, -7, 0, 'Soporte entregado a Gestión Humana'],
   ['OP05', 'Permiso', -5, -5, 4, 'Cita médica familiar'],
   ['OP03', 'Hora extra', -3, -3, 3, 'Apoyo en cierre de pedido'],
   ['AP03', 'Llamado de atención', -6, -6, 0, 'Llegada tarde reiterada'],
   ['OP07', 'Capacitación', -12, -12, 8, 'Control de calidad en tejido'],
   ['AP01', 'Dotación', -30, -30, 0, 'Entrega de uniforme y botas'],
   ['OP08', 'Vacaciones', -16, -10, 0, 'Periodo 2026']
  ].forEach(function (x, k) {
    put('RH-N-' + k, { tipo: 'rh_nov', pid: 'RH-P-' + x[0], tipoN: x[1], desde: fechaDe(x[2]), hasta: fechaDe(x[3]), horas: x[4], nota: x[5], ts: Date.now() - k * 1e6 });
  });

  put('RH-CONFIG', { tipo: 'rh_cfg', pin: 'aaa4bfbaf2a0657dc5f072f3f90e676d3d22bee2de689477efb63415727c2b27' });

  /* ---------- Firestore simulado ---------- */
  var LIS = [];
  function clone(o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); }
  var DEL = { __delete: true };
  function merge(t, s) {
    Object.keys(s).forEach(function (k) {
      var v = s[k];
      if (v === DEL || (v && v.__delete)) { delete t[k]; return; }
      if (v && typeof v === 'object' && !Array.isArray(v)) { t[k] = (t[k] && typeof t[k] === 'object' && !Array.isArray(t[k])) ? t[k] : {}; merge(t[k], v); }
      else t[k] = v;
    });
    return t;
  }
  function fire() { LIS.forEach(function (l) { try { l(); } catch (e) {} }); }
  function snapDoc(id) {
    return { id: id, exists: ST[id] !== undefined, data: function () { return clone(ST[id]); }, get: function (f) { return (ST[id] || {})[f]; } };
  }
  function snapList(ids) {
    return {
      size: ids.length, empty: !ids.length,
      docs: ids.map(snapDoc),
      forEach: function (f) { ids.forEach(function (id) { f(snapDoc(id)); }); }
    };
  }
  function getPath(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function matchAll(conds) {
    return Object.keys(ST).filter(function (id) {
      return conds.every(function (c) {
        var v = c.f === '__name__' ? id : getPath(ST[id], c.f);
        if (c.op === '==') return v === c.v;
        if (c.op === '>=') return v !== undefined && v !== null && v >= c.v;
        if (c.op === '<') return v !== undefined && v !== null && v < c.v;
        if (c.op === '>') return v !== undefined && v !== null && v > c.v;
        if (c.op === '<=') return v !== undefined && v !== null && v <= c.v;
        if (c.op === '!=') return v !== c.v;
        return true;
      });
    }).sort();
  }
  function Query(conds) {
    return {
      where: function (f, op, v) { return Query(conds.concat([{ f: (f && f.__fp) ? '__name__' : f, op: op, v: v }])); },
      orderBy: function () { return Query(conds); },
      limit: function () { return Query(conds); },
      get: function () { return Promise.resolve(snapList(matchAll(conds))); },
      onSnapshot: function (cb) {
        var prev = {};
        var f = function () {
          var ids = matchAll(conds), s = snapList(ids), ahora = {}, ch = [];
          ids.forEach(function (id) {
            var j = JSON.stringify(ST[id]); ahora[id] = j;
            if (prev[id] === undefined) ch.push({ type: 'added', doc: snapDoc(id) });
            else if (prev[id] !== j) ch.push({ type: 'modified', doc: snapDoc(id) });
          });
          Object.keys(prev).forEach(function (id) { if (ahora[id] === undefined) ch.push({ type: 'removed', doc: { id: id, exists: false, data: function () { return undefined; } } }); });
          prev = ahora;
          s.docChanges = function () { return ch; };
          cb(s);
        };
        LIS.push(f); setTimeout(f, 0);
        return function () { var i = LIS.indexOf(f); if (i >= 0) LIS.splice(i, 1); };
      }
    };
  }
  function DocRef(id) {
    return {
      id: id,
      get: function () { return Promise.resolve(snapDoc(id)); },
      set: function (d, o) { if (o && o.merge) { ST[id] = merge(ST[id] || {}, clone(d)); } else ST[id] = clone(d); fire(); return Promise.resolve(); },
      update: function (a, b) {
        var patch = {};
        if (typeof a === 'string') { // soporta rutas con punto: update('rows.x', valor)
          var ks = a.split('.'), cur = patch;
          for (var i = 0; i < ks.length - 1; i++) cur = (cur[ks[i]] = {});
          cur[ks[ks.length - 1]] = b;
        } else patch = a;
        ST[id] = merge(ST[id] || {}, clone(patch)); fire(); return Promise.resolve();
      },
      delete: function () { delete ST[id]; fire(); return Promise.resolve(); },
      onSnapshot: function (cb) {
        var f = function () { cb(snapDoc(id)); };
        LIS.push(f); setTimeout(f, 0);
        return function () { var i = LIS.indexOf(f); if (i >= 0) LIS.splice(i, 1); };
      },
      collection: function () { return Col(); }
    };
  }
  var _auto = 0;
  function Col() {
    var q = Query([]);
    return {
      doc: function (id) { return DocRef(id || ('AUTO-' + (++_auto))); },
      add: function (d) { var id = 'AUTO-' + (++_auto); ST[id] = clone(d); fire(); return Promise.resolve(DocRef(id)); },
      where: q.where, orderBy: q.orderBy, limit: q.limit, get: q.get, onSnapshot: q.onSnapshot
    };
  }
  function Firestore() {
    return {
      collection: function () { return Col(); },
      doc: function (p) { return DocRef(String(p).split('/').pop()); },
      batch: function () {
        var ops = [];
        return {
          set: function (r, d, o) { ops.push(function () { return r.set(d, o); }); },
          update: function (r, d) { ops.push(function () { return r.update(d); }); },
          delete: function (r) { ops.push(function () { return r.delete(); }); },
          commit: function () { ops.forEach(function (f) { f(); }); return Promise.resolve(); }
        };
      },
      runTransaction: function (fn) {
        var tx = {
          get: function (r) { return r.get(); },
          set: function (r, d, o) { r.set(d, o); return tx; },
          update: function (r, d) { r.update(d); return tx; },
          delete: function (r) { r.delete(); return tx; }
        };
        try { return Promise.resolve(fn(tx)); } catch (e) { return Promise.reject(e); }
      },
      enablePersistence: function () { return Promise.resolve(); },
      settings: function () {}
    };
  }
  var _fs = null;
  function fs() { return _fs || (_fs = Firestore()); }

  var APPS = [];
  function app(name) {
    name = name || '[DEFAULT]';
    var a = APPS.filter(function (x) { return x.name === name; })[0];
    if (!a) { a = { name: name, firestore: fs, options: {} }; APPS.push(a); }
    return a;
  }
  var api = function () { return fs(); };
  api.FieldPath = { documentId: function () { return { __fp: true }; } };
  api.FieldValue = { delete: function () { return DEL; }, serverTimestamp: function () { return Date.now(); } };
  api.Timestamp = { now: function () { return { toMillis: function () { return Date.now(); } }; } };

  window.firebase = {
    apps: APPS,
    initializeApp: function (c, n) { return app(n); },
    app: app,
    firestore: api,
    auth: function () { return { onAuthStateChanged: function () {}, currentUser: null }; }
  };
  app();                               // app por defecto disponible desde el inicio


  /* ---------- servidor de hojas simulado (reemplaza Apps Script) ---------- */
  function filasGas() {
    var out = [];
    Object.keys(ST).forEach(function (id) {
      var l = ST[id];
      if (!l || l.tipo !== 'lote' || l.status !== 'cerrado') return;
      var r = null; for (var z = 0; z < REFS.length; z++) if (REFS[z][0] === l.refId) r = REFS[z];
      var eqid = (MAQS.filter(function (m) { return m.id === l.maqId; })[0] || {}).teamId || '';
      var op = OPS.filter(function (o) { return o.id === l.opId; })[0];
      out.push({
        Fecha: l.fecha, Timestamp: l.ts, MaqID: l.maqId, OpID: l.opId, Operario: op ? op.name : l.opId,
        Turno: l.turno, RefID: l.refId, Referencia: r ? r[1] : l.refId, LoteSize: l.lotSize,
        CtrIni: l.ctrStart, CtrFin: l.ctrEnd, Tubos: l.tubos,
        HoraIni: l.hi, HoraFin: l.hf, Duracion: l.dur, Dur: l.dur,
        ParosMin: l.parosMin, ParosDetalle: (l.paros || []).map(function (x) { return x.mot; }).join(', '),
        StdMin: l.std, Std: l.std, Eficiencia: l.eff, Eff: l.eff, Obs: l.obs || '',
        Equipo: eqid === 'E1' ? 'Equipo 1' : eqid === 'E2' ? 'Equipo 2' : eqid
      });
    });
    return out.sort(function (a, b) { return (a.Fecha + a.HoraIni) < (b.Fecha + b.HoraIni) ? 1 : -1; });
  }
  function estadosGas() {
    var out = [];
    Object.keys(ST).forEach(function (id) {
      var l = ST[id];
      if (!l || l.tipo !== 'lote' || l.status !== 'abierto') return;
      var r = null; for (var z = 0; z < REFS.length; z++) if (REFS[z][0] === l.refId) r = REFS[z];
      out.push({ MaqID: l.maqId, RefID: l.refId, Referencia: r ? r[1] : l.refId, RefNombre: r ? r[1] : '',
                 Fecha: l.fecha, HoraIni: l.hi, Estado: l.parado ? 'PARADA' : 'CORRIENDO', OpID: l.opId });
    });
    return out;
  }
  window.GF_FILAS = filasGas;
  var _fetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (u, o) {
    var url = String(u || '');
    if (url.indexOf('action=') >= 0 || url.indexOf('/demo-gas') >= 0) {
      var r = { ok: true };
      if (url.indexOf('action=leer_estado') >= 0) r.estados = estadosGas();
      else if (url.indexOf('action=leer') >= 0) r.filas = filasGas();
      else if (url.indexOf('action=estado') >= 0) r.estados = estadosGas();
      return Promise.resolve({ ok: true, status: 200, json: function () { return Promise.resolve(r); },
                               text: function () { return Promise.resolve(JSON.stringify(r)); } });
    }
    return _fetch ? _fetch(u, o) : Promise.reject(new Error('sin red'));
  };
  try { localStorage.setItem('gf_gas_url', 'demo-gas'); } catch (e) {}
  window.GF_GAS = 'demo-gas';

  /* ---------- aviso de demostración ---------- */
  window.GF_DEMO = true;
  document.addEventListener('DOMContentLoaded', function () {
    if (window.GF_NO_BANNER) return;
    var b = document.createElement('div');
    b.textContent = 'Versión de demostración · datos de ejemplo · los cambios no se guardan';
    b.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#111827;color:#fbbf24;' +
      'font:600 11.5px system-ui,sans-serif;text-align:center;padding:5px 8px;letter-spacing:.3px;pointer-events:none';
    document.body.appendChild(b);
    try { document.body.style.paddingBottom = '30px'; } catch (e) {}
  });
})();
