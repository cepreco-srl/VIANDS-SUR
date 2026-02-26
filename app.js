// Forzar scroll al top al cargar
window.scrollTo(0,0);
window.addEventListener('load', function(){ window.scrollTo(0,0); });

// Cursor solo en desktop
var isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
var cursor=document.getElementById('cursor');
if(!isTouchDevice){
  document.addEventListener('mousemove',function(e){cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';});
  document.querySelectorAll('a,button,.serv-card,.zona-card,.dif-card,.hero-card,.prob-card').forEach(function(el){
    el.addEventListener('mouseenter',function(){cursor.classList.add('expand');});
    el.addEventListener('mouseleave',function(){cursor.classList.remove('expand');});
  });
} else {
  cursor.style.display='none';
}
var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.08});
document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el);});
window.addEventListener('scroll',function(){document.getElementById('nav').style.borderBottomColor=window.scrollY>20?'rgba(0,0,0,0.12)':'rgba(0,0,0,0.06)';});
function handleNetlifySubmit(e, btn){
  e.preventDefault();
  var form = btn.closest('form');
  btn.textContent = 'Enviando...';
  btn.disabled = true;
  fetch('/', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams(new FormData(form)).toString()
  })
  .then(function(){
    document.getElementById('form-success').style.display = 'block';
    form.reset();
    btn.textContent = '✓ Enviado';
    btn.style.background = '#4A9E5C';
  })
  .catch(function(){
    btn.textContent = 'Solicitá Cotización →';
    btn.disabled = false;
    alert('Error al enviar. Intentá de nuevo.');
  });
}
