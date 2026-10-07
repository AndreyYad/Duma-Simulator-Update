// Builds the English site (repository root) from the Russian source in ru/.
// Русская версия в ru/ — исходник. Английская в корне собирается этим скриптом: node tools/build-en.js
// Перевод строк лежит в tools/dict.json (русская строка → английская; null — оставить как есть).
// Если в ru/ появилась новая русская строка без перевода, сборка остановится и перечислит такие строки.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..'), SRC = f => path.join(root, 'ru', f), OUT = f => path.join(root, f), R = f => fs.readFileSync(SRC(f), 'utf8');
const dict = JSON.parse(fs.readFileSync(path.join(__dirname, 'dict.json'), 'utf8'));

// ── имена персонажей и кандидатов: транслитерация
const ctx0 = {}; vm.createContext(ctx0);
vm.runInContext(R('js/data.js') + R('js/world.js') + ';this.N=[...new Set(Object.values(DUMA_P).flatMap(y=>Object.values(y).flat().map(p=>p[0])).concat(Object.values(PRES).flatMap(p=>p.c.map(c=>c[0]))))];', ctx0);
const FIRST = { 'Александр': 'Alexander', 'Алексей': 'Alexei', 'Юрий': 'Yuri', 'Эмилия': 'Emilia', 'Ксения': 'Ksenia', 'Мария': 'Maria', 'Лидия': 'Lidia', 'Пётр': 'Pyotr', 'Виктор': 'Viktor' };
const CH = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ж: 'zh', з: 'z', и: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', ё: 'yo' };
const VOW = 'аеёиоуыэюяьъ';
function word(w) {
  if (FIRST[w]) return FIRST[w];
  let s = w.toLowerCase().replace(/(ий|ый)$/, '\u0001'), out = '';
  for (let i = 0; i < s.length; i++) { const c = s[i], p = s[i - 1];
    out += c === '\u0001' ? 'y' : c === 'е' ? ((i === 0 || VOW.includes(p)) ? 'ye' : 'e') : c === 'й' ? 'i' : CH[c] !== undefined ? CH[c] : c; }
  return out.charAt(0).toUpperCase() + out.slice(1);
}
const translit = n => n.split(' ').map(part => part.split('-').map(word).join('-')).join(' ');
const nameMap = new Map(ctx0.N.map(n => [n, translit(n)]));

// ── замена русских фрагментов: фрагмент — кусок текста без кавычек и угловых скобок, в котором есть кириллица; комментарии не трогаются
const RUN = /[^'"<>`\n]*[А-Яа-яЁё][^'"<>`\n]*/g, isComment = s => /\/\/|\/\*|\*\//.test(s), left = new Set();
function translate(text) {
  return text.replace(RUN, m => { if (isComment(m)) return m; const core = m.trim(), a = m.indexOf(core), pre = m.slice(0, a), post = m.slice(a + core.length);
    if (nameMap.has(core)) return pre + nameMap.get(core) + post;
    if (!(core in dict)) { left.add(core); return m; }
    return dict[core] === null ? m : pre + dict[core] + post; });
}
const rep = (s, x, y, name, all) => { const n = s.split(x).length - 1; if (!n || (!all && n !== 1)) throw new Error('замена «' + name + '»: найдено ' + n); return s.split(x).join(y); };
const quotes = s => s.replace(/«/g, '“').replace(/»/g, '”');
const between = (s, a, b, y, name) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) throw new Error('нет метки ' + name); return s.slice(0, i) + y + s.slice(j + b.length); };

let app = quotes(translate(R('js/app.js'))), data = quotes(translate(R('js/data.js'))), world = quotes(translate(R('js/world.js')));
// страница: сначала вырезать помеченные вставки (в них остаётся слово «Русский»), потом переводить остальное
let index = R('index.html');
index = between(index, '<!--redirect-->', '<!--/redirect-->', '@@REDIRECT@@', 'redirect');
index = between(index, '<!--lang-->', '<!--/lang-->', '@@LANG@@', 'lang');
index = translate(index);
index = index.replace('@@REDIRECT@@', "<script>try{var w=localStorage.getItem('duma-sim-lang');if(!w&&/^ru/i.test(navigator.language||''))w='ru';if(w==='ru')location.replace('ru/index.html');}catch(e){}</script>")
  .replace('@@LANG@@', "<a class=\"lang\" href=\"ru/index.html\" lang=\"ru\" onclick=\"try{localStorage.setItem('duma-sim-lang','ru')}catch(e){}\">Русский</a>");
index = rep(index, '<html lang="ru">', '<html lang="en">', 'lang');
index = rep(index, '"../', '"', 'пути к общим файлам', true);
if (left.size) { console.error('Нет перевода в tools/dict.json для строк (' + left.size + '):\n' + [...left].map(s => JSON.stringify(s)).join('\n')); process.exit(1); }

// правила английского: множественное число, точка в дробях, сортировка, своё хранилище, разбор процента из описания партии
app = rep(app, "const plural=(n,a,b,c)=>{ const m=Math.abs(n)%100, k=m%10; return m>10&&m<20?c:k===1?a:k>=2&&k<=4?b:c; };", "const plural=(n,a,b,c)=>Math.abs(n)===1?a:c; // English: singular for 1, plural otherwise (the middle form is unused)", 'plural');
app = rep(app, ".replace('.',',')", "", 'десятичная запятая', true);
app = rep(app, ",'ru'))", ",'en'))", 'сортировка');
app = rep(app, "/По списку — ([\\d,]+)%/", "/Party-list vote: ([\\d.]+)%/", 'процент по списку');
app = rep(app, "const KEY='svoy-parlament-v5', PKEY='svoy-parlament-presets';", "const KEY='duma-simulator-en-v1', PKEY='duma-simulator-en-presets';", 'ключи хранилища');

// ── ключи фотографий и логотипов: те же имена и названия, что в переведённых данных
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(R('js/photos.js') + R('js/logos.js'), ctx);
const remap = (o, f, what) => { const r = {}; Object.keys(o).forEach(k => { const nk = f(k); if (nk === undefined || nk === null) throw new Error('нет перевода ключа ' + what + ': ' + k); r[nk] = o[k]; }); return r; };
const pName = k => nameMap.get(k), lName = k => dict[k];
const PH = remap(ctx.window.PHOTO, pName, 'фото'), PHS = remap(ctx.window.PHOTO_SRC, pName, 'фото'), LG = remap(ctx.window.LOGO, lName, 'лого'), LGS = remap(ctx.window.LOGO_SRC, lName, 'лого');

fs.writeFileSync(OUT('js/app.js'), app); fs.writeFileSync(OUT('js/data.js'), data); fs.writeFileSync(OUT('js/world.js'), world); fs.writeFileSync(OUT('index.html'), index);
fs.writeFileSync(OUT('js/photos.js'), '// Character photos: free images from Wikipedia and Wikimedia Commons. Author and licence of each image are in PHOTO_SRC.\nwindow.PHOTO=' + JSON.stringify(PH) + ';\nwindow.PHOTO_SRC=' + JSON.stringify(PHS) + ';\n');
fs.writeFileSync(OUT('js/logos.js'), '// Party logos: images from Wikimedia Commons. Author and licence of each file are in LOGO_SRC.\nwindow.LOGO=' + JSON.stringify(LG) + ';\nwindow.LOGO_SRC=' + JSON.stringify(LGS) + ';\n');

// ── credits.html
const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const row = (n, x) => '<li>' + esc(n) + ': <a href="https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(x[0].replace(/ /g, '_')) + '">' + esc(x[0]) + '</a>' + (x[1] ? ', author: ' + esc(x[1]) : '') + (x[2] ? ', licence: ' + esc(x[2]) : '') + '</li>';
fs.writeFileSync(OUT('credits.html'), '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Duma Simulator — sources</title>\n<style>body{font:15px/1.5 system-ui,sans-serif;max-width:860px;margin:0 auto;padding:24px 20px;color:#151a2b;background:#fff}li{margin:3px 0;overflow-wrap:anywhere}h2{margin-top:28px}</style>\n</head>\n<body>\n<h1>Sources</h1>\n<p>The questions of the standard test and the method of dividing party-list seats come from the Spanish test “Tu hemiciclo” (<a href="https://objetivo176.es/test">objetivo176.es/test</a>). The chamber diagram is drawn by the <a href="https://github.com/geoffreybr/d3-parliament">d3-parliament</a> library (MIT licence). Region outlines come from Natural Earth open data.</p>\n<h2>Photos</h2>\n<p>Images from Wikipedia and Wikimedia Commons under free licences.</p>\n<ul>\n' + Object.keys(PHS).sort().map(n => row(n, PHS[n])).join('\n') + '\n</ul>\n<h2>Party logos</h2>\n<ul>\n' + Object.keys(LGS).sort().map(n => row(n, LGS[n])).join('\n') + '\n</ul>\n<p><a href="./">← Back to the test</a></p>\n</body>\n</html>\n');

const cyr = s => s.split('\n').filter(l => /[А-Яа-яЁё]/.test(l) && !isComment(l)).length;
console.log('English build written. Cyrillic lines outside comments: app ' + cyr(app) + ', data ' + cyr(data) + ', world ' + cyr(world) + ', index ' + cyr(index) + ' (index keeps the word «Русский» on the language switch)');
