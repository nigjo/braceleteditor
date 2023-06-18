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
      let patternView =
              view.createNormalPatternView(config);

      const svg = patternView.querySelector('svg');
      svg.setAttribute('xmlns', "http://www.w3.org/2000/svg");
      svg.setAttribute('version', "1.0");
      //console.debug(svg);
      //console.debug(svg.outerHTML);
      const uri = 'data:'
              + 'image/svg+xml'
              + ';name=pattern.svg'
              + ';base64'
              + ','
              + btoa(unescape(encodeURIComponent(svg.outerHTML)));
      //const frame = document.createElement('img');
      const frame = document.createElement('object');
      //frame.src = uri;
      frame.data = uri;
      //frame.setAttribute('download', 'pattern.svg');
      frame.type = 'image/svg+xml';
      frame.width = svg.width.baseVal.value;
      frame.height = svg.height.baseVal.value;
      //frame.alt = 'Pattern';

      document.getElementById('pattern').append(frame);
    } else {
      throw 'no valid data found';
    }
  });
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
