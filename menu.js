const DAYS_META = [
  { name: 'Lunes' },
  { name: 'Martes' },
  { name: 'Miercoles' },
  { name: 'Jueves' },
  { name: 'Viernes' },
];

const TAG_CLASS = {
  'Clasico':'tag-clasico','Dieta':'tag-vegan','Fit':'tag-fit',
  'Ensalada':'tag-sin','Especial':'tag-especial','Vegano':'tag-vegan'
};
const TAG_EMOJIS = {
  'Clasico':'🥩','Dieta':'🌿','Fit':'💪','Ensalada':'🥗','Especial':'🔥','Vegano':'🌱'
};
const TAG_OPTS = ['Clasico','Dieta','Fit','Ensalada','Especial','Vegano'];

const DEFAULT_MENU = {
  weekLabel: '2/2 al 6/2',
  days: [
    { name:'Lunes', date:'02/02', platos:[
      {desc:'Hamburguesas napolitanas', sub:'Con fideos con manteca y queso', tag:'Clasico'},
      {desc:'Milanesa de soja con pure de calabaza', sub:'Opcion dieta', tag:'Dieta'},
      {desc:'Ensalada completa', sub:'Arroz, zanahoria, atun, lechuga y aceitunas', tag:'Ensalada'},
    ]},
    { name:'Martes', date:'03/02', platos:[
      {desc:'Milanesa de pollo con pure', sub:'Clasico reconfortante', tag:'Clasico'},
      {desc:'Fideos salteados', sub:'Opcion dieta', tag:'Dieta'},
      {desc:'Ensalada completa', sub:'Chaucha, papa, morron, huevo, jamon y lechuga', tag:'Ensalada'},
    ]},
    { name:'Miercoles', date:'04/02', platos:[
      {desc:'Matambre a la pizza', sub:'Con salteado de arroz, jamon y queso', tag:'Clasico'},
      {desc:'Medallones de merluza', sub:'Con ensalada de lentejas', tag:'Fit'},
      {desc:'Ensalada', sub:'Lentejas, pollo, lechuga, remolacha y cebolla', tag:'Ensalada'},
    ]},
    { name:'Jueves', date:'05/02', platos:[
      {desc:'Albondigas con fileto y arroz blanco', sub:'Clasico casero', tag:'Clasico'},
      {desc:'Tortilla de verduras', sub:'Opcion dieta', tag:'Dieta'},
      {desc:'Ensalada', sub:'Lechuga, zanahoria, tomate, huevo y choclo', tag:'Ensalada'},
    ]},
    { name:'Viernes', date:'06/02', platos:[
      {desc:'Costillitas de cerdo con papas baston', sub:'El favorito de la semana', tag:'Clasico'},
      {desc:'Ensalada del dia', sub:'A confirmar segun temporada', tag:'Ensalada'},
      {desc:'Asado del viernes!', sub:'Pedilo con anticipacion - anotate si queres participar', tag:'Especial'},
    ]},
  ]
};

// ── RENDER ──
function renderMenu(menu) {
  var container = document.getElementById('menu-render');
  var dateEl = document.getElementById('menu-week-date');
  if (dateEl) dateEl.textContent = menu.weekLabel ? ' \u2014 ' + menu.weekLabel : '';
  var out = '';
  for (var di = 0; di < menu.days.length; di++) {
    var day = menu.days[di];
    var platos = '';
    for (var pi = 0; pi < day.platos.length; pi++) {
      var p = day.platos[pi];
      var isSpecial = p.tag === 'Especial';
      var tagCls = TAG_CLASS[p.tag] || 'tag-clasico';
      var icon = TAG_EMOJIS[p.tag] || '🍽️';
      platos += '<div class="plato-row' + (isSpecial ? ' asado-row' : '') + '">' +
        '<span class="plato-icon">' + icon + '</span>' +
        '<div><strong>' + p.desc + '</strong><span>' + p.sub + '</span></div>' +
        '<span class="plato-tag ' + tagCls + '">' + p.tag + '</span>' +
        '</div>';
    }
    out += '<div class="dia-block visible">' +
      '<div class="dia-header">' +
      '<span class="dia-name">' + day.name + '</span>' +
      '<span class="dia-date">' + day.date + '</span>' +
      '</div><div class="dia-platos">' + platos + '</div></div>';
  }
  container.innerHTML = out;
}

// ── EDITOR ──
function editorRowHTML(desc, sub, tag) {
  var opts = '';
  for (var i = 0; i < TAG_OPTS.length; i++) {
    opts += '<option value="' + TAG_OPTS[i] + '"' + (tag === TAG_OPTS[i] ? ' selected' : '') + '>' + TAG_OPTS[i] + '</option>';
  }
  return '<div class="editor-row" style="display:grid;grid-template-columns:1fr 1fr auto auto;gap:0.5rem;align-items:center;">' +
    '<input class="e-desc" value="' + desc + '" placeholder="Nombre del plato" style="border:1px solid rgba(0,0,0,0.1);border-radius:6px;padding:0.45rem 0.7rem;font-size:0.8rem;outline:none;">' +
    '<input class="e-sub" value="' + sub + '" placeholder="Descripcion" style="border:1px solid rgba(0,0,0,0.1);border-radius:6px;padding:0.45rem 0.7rem;font-size:0.8rem;outline:none;">' +
    '<select class="e-tag" style="border:1px solid rgba(0,0,0,0.1);border-radius:6px;padding:0.45rem 0.5rem;font-size:0.75rem;outline:none;background:white;">' + opts + '</select>' +
    '<button onclick="this.closest(\'.editor-row\').remove()" style="background:none;border:none;color:#ccc;font-size:1.1rem;cursor:pointer;padding:0 0.3rem;">✕</button>' +
    '</div>';
}

function buildEditor(menu) {
  document.getElementById('week-label-input').value = menu.weekLabel || '';
  var grid = document.getElementById('editor-grid');
  var out = '';
  for (var di = 0; di < menu.days.length; di++) {
    var day = menu.days[di];
    var rows = '';
    for (var pi = 0; pi < day.platos.length; pi++) {
      var p = day.platos[pi];
      rows += editorRowHTML(p.desc, p.sub, p.tag);
    }
    out += '<div class="editor-day" id="editor-day-' + di + '" style="background:white;border-radius:10px;padding:1.2rem 1.4rem;border:1px solid rgba(0,0,0,0.07);">' +
      '<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;">' +
      '<span style="font-family:Syne,sans-serif;font-weight:800;font-size:0.88rem;text-transform:uppercase;">' + day.name + '</span>' +
      '<input class="e-date" value="' + day.date + '" style="border:1px solid rgba(0,0,0,0.1);border-radius:4px;padding:0.25rem 0.6rem;font-size:0.75rem;outline:none;width:80px;">' +
      '</div>' +
      '<div class="editor-rows" style="display:flex;flex-direction:column;gap:0.5rem;">' + rows + '</div>' +
      '<button onclick="addRow(' + di + ')" style="margin-top:0.6rem;background:none;border:1px dashed rgba(0,0,0,0.15);border-radius:6px;width:100%;padding:0.4rem;font-size:0.75rem;color:#6B6B6B;cursor:pointer;">+ Agregar plato</button>' +
      '</div>';
  }
  grid.innerHTML = out;
}

function addRow(di) {
  var container = document.querySelector('#editor-day-' + di + ' .editor-rows');
  var div = document.createElement('div');
  div.innerHTML = editorRowHTML('', '', 'Clasico');
  container.appendChild(div.firstElementChild);
}

// ── FIREBASE SAVE / LOAD ──
function saveMenu() {
  var btn = document.querySelector('[onclick="saveMenu()"]');
  btn.textContent = 'Guardando...';
  btn.disabled = true;

  var weekLabel = document.getElementById('week-label-input').value || 'esta semana';
  var days = [];
  for (var di = 0; di < DAYS_META.length; di++) {
    var rows = document.querySelectorAll('#editor-day-' + di + ' .editor-row');
    var platos = [];
    for (var ri = 0; ri < rows.length; ri++) {
      var row = rows[ri];
      var desc = row.querySelector('.e-desc').value;
      if (desc.trim()) {
        platos.push({
          desc: desc,
          sub: row.querySelector('.e-sub').value,
          tag: row.querySelector('.e-tag').value
        });
      }
    }
    var dateInput = document.querySelector('#editor-day-' + di + ' .e-date');
    days.push({ name: DAYS_META[di].name, date: dateInput ? dateInput.value : '', platos: platos });
  }
  var menu = { weekLabel: weekLabel, days: days, updatedAt: Date.now() };

  // Save to Firebase
  firebase.database().ref('menu').set(menu)
    .then(function() {
      renderMenu(menu);
      btn.textContent = 'Guardar menu';
      btn.disabled = false;
      var msg = document.getElementById('save-msg');
      msg.style.display = 'block';
      setTimeout(function() { msg.style.display = 'none'; }, 3000);
    })
    .catch(function(err) {
      console.error(err);
      btn.textContent = 'Guardar menu';
      btn.disabled = false;
      alert('Error al guardar. Revisa la consola.');
    });
}

function toggleEditor() {
  var ed = document.getElementById('menu-editor');
  var btn = document.getElementById('edit-btn');
  var isOpen = ed.style.display !== 'none';
  ed.style.display = isOpen ? 'none' : 'block';
  btn.textContent = isOpen ? 'Editar menu ✎' : 'Cerrar editor ✕';
}

// ── INIT: load from Firebase, fallback to default ──
window.addEventListener('load', function() {
  var loadingHTML = '<p style="color:#6B6B6B;font-size:0.88rem;padding:2rem 0;">Cargando menu...</p>';
  document.getElementById('menu-render').innerHTML = loadingHTML;

  firebase.database().ref('menu').once('value')
    .then(function(snapshot) {
      var menu = snapshot.val();
      if (!menu || !menu.days) menu = DEFAULT_MENU;
      renderMenu(menu);
      buildEditor(menu);
    })
    .catch(function() {
      renderMenu(DEFAULT_MENU);
      buildEditor(DEFAULT_MENU);
    });
});

