/* Чистовик VS-16: надстройка. Живая карточка расчёта и волна на кнопках. */

/* волна на кнопках */
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('.v-btn'); if (!b) return;
  var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), x = document.createElement('span');
  x.className = 'x-ripple'; x.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
  b.appendChild(x); setTimeout(function () { x.remove(); }, 700);
});

/* живая карточка: запрос печатается, дальше по очереди встают цена, бригада и дата; три квартиры по кругу.
   Идея с видео Ирины (запрос печатается, под ним проявляется карточка-результат), переложена на расчёт уборки по метражу. */
(function () {
  var root = document.querySelector('[data-x-live]'); if (!root) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; /* остаётся статичный пример из разметки */
  var NB = ' ';
  var q = function (k) { return root.querySelector('[data-live="' + k + '"]'); };
  var field = q('item'), rows = { price: q('price'), crew: q('crew'), date: q('date') };
  var S = [
    { item: 'Студия, 28 м², поддерживающая', price: '3' + NB + '080' + NB + '₽', crew: '1 человек, 2 часа', date: 'завтра, 10:00' },
    { item: '2-к. квартира, 54 м², генеральная', price: '10' + NB + '260' + NB + '₽', crew: '2 человека, 5 часов', date: 'в четверг, 09:00' },
    { item: '3-к. квартира, 78 м², после ремонта', price: '20' + NB + '280' + NB + '₽', crew: '2 человека, 8 часов', date: 'в субботу, 09:00' }
  ];
  var idx = 0, vis = true, timers = [];
  root.classList.add('is-live');
  function wait(ms) { return new Promise(function (r) { timers.push(setTimeout(r, ms)); }); }
  function gate() { return new Promise(function (r) { (function chk() { if (vis && !document.hidden) r(); else setTimeout(chk, 400); })(); }); }
  async function type(node, text, ms) {
    node.textContent = ''; node.classList.add('is-typing');
    for (var i = 1; i <= text.length; i++) { await gate(); node.textContent = text.slice(0, i); await wait(ms + Math.random() * 16); }
    node.classList.remove('is-typing');
  }
  function clear() { field.textContent = ''; Object.keys(rows).forEach(function (k) { rows[k].classList.remove('is-in'); }); }
  function show(k, text) { rows[k].querySelector('b').textContent = text; rows[k].classList.add('is-in'); }
  async function run() {
    clear(); await wait(500);
    while (true) {
      var s = S[idx % S.length]; idx++;
      await gate();
      root.classList.remove('is-swap'); void root.offsetWidth; root.classList.add('is-swap');
      await wait(400);
      await type(field, s.item, 40);
      await wait(450); await gate(); show('price', s.price);
      await wait(520); await gate(); show('crew', s.crew);
      await wait(520); await gate(); show('date', s.date);
      await wait(3600);
      clear(); await wait(380);
    }
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }, { threshold: .1 }).observe(root);
  run();
})();
