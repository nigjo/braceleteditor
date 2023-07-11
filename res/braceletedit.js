import * as view from "./braceletview.js"
        console.group("INIT in");
function loadPattern(patternName) {
  return fetch('./pattern/'
          + patternName
          .replaceAll('\\', '/')
          .replaceAll('../', '')
          + '.json'
          ).then(r => {
    if (r.ok)
      return r.json();
    throw r;
  }).then(config => {
    if (config._version === 1 &&
            config._format === 'braceletview') {
      window.currentConfig = config;

      updatePattern(config);
    } else {
      throw 'no valid data found';
    }
  });
}

function updatePattern(config) {
  sessionStorage.setItem('braceletedit.config', JSON.stringify(config, ' '));

  let patternDiv = document.getElementById('pattern');
  let patternView =
          view.createNormalPatternView(config);
  const patternSvg = patternView.querySelector('svg');
  patternDiv.style.width = patternSvg.width.baseVal.value + 'px';
  patternDiv.style.height = patternSvg.height.baseVal.value + 'px';
  const patternShadow = patternDiv.attachShadow({ mode: "open" });
  patternShadow.replaceChildren(patternView);

}

function initKnownPatternList() {
  return fetch('pattern/_known.json').then(resp => {
    if (resp.ok)
      return resp.json();
    throw resp;
  }).then(data => {
    if (data.version !== 1)
      throw data;
    const navparent = document.querySelector('nav #knownpattern');
    const items = document.createDocumentFragment();
    for (let info of data.pattern) {
      const item = document.createElement('li');
      if (info.name !== window.currentPattern) {
        const link = document.createElement('a');
        let q = new URLSearchParams();
        q.set('pattern', info.name);
        link.href = '?' + q;
        link.textContent = info.displayName || info.name;
        item.append(link);
      } else {
        item.textContent = info.displayName || info.name;
      }
      items.append(item);
    }
    navparent.replaceChildren(items);
  });
}

function initPage() {
  //console.debug(view);
  console.debug("init page");

  var infile = 'demo';
  var q = new URLSearchParams(location.search);
  if (q.has('pattern'))
    infile = q.get('pattern');

  window.currentPattern = infile;

  Promise.all([
    initKnownPatternList(),
    loadPattern(infile)
  ]).then(_ => {
    console.debug("config files loaded.");
    window.dispatchEvent(new CustomEvent('configLoaded'));
  });
  console.debug("waiting for config files to load...");
}
initPage();
//export default initPage;
//console.groupEnd("INIT out");


window.handleActions = function (event) {
  const t = event.target;
  event.stopPropagation();

  if (t.type && t.type === 'button') {
    const config = window.currentConfig;
    let changed = false;
    switch (t.name) {
      case 'addStringL':
      case 'addStringR':
      {
        let atleft = t.name === 'addStringL';
        config.threads = atleft ? ('AA' + config.threads) : (config.threads + 'AA');
        console.debug(t.name, atleft);
        for (let r of config.pattern) {
          r.splice(atleft ? 0 : r.length, 0, 1);
        }
        changed = true;
        break;
      }
      case 'remStringL':
      case 'remStringR':
      {
        let atleft = t.name === 'remStringL';
        config.threads = atleft ? config.threads.substring(2) : config.threads.substring(0, config.threads.length - 2);
        console.debug(t.name, atleft);
        for (let r of config.pattern) {
          r.splice(atleft ? 0 : r.length - 1, 1);
        }
        changed = true;
        break;
      }
      default:
        console.debug('handleActions', t.name, t);
    }

    if (changed) {
      updatePattern(config);
    }
  } else {
    console.debug('handleActions', t);
  }
};
