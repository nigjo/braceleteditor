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

  addSvg('pattern', view.createNormalPatternView, config);
  let scale = (sessionStorage.getItem('braceletedit.scale') || '4,5')
          .split(',').map(Number);
  addSvg('preview', cfg => view.createSmallView(cfg, scale[0], scale[1]), config);

  let bbLink = document.getElementById("braceletbook-link");
  if (config.meta && "braceletbook.com-id" in config.meta) {
    //https://www.braceletbook.com/patterns/normal/150421/
    let type = ("braceletbook.com-type" in config.meta) ?
            config.meta["braceletbook.com-type"] : "normal";
    let orgOrVar = ("braceletbook.com-variation" in config.meta)
            && config.meta["braceletbook.com-variation"] ? "variations" : "patterns";
    let linkHref =
            "https://www.braceletbook.com/"
            + orgOrVar + "/"
            + type + "/"
            + config.meta["braceletbook.com-id"] + "/";
    bbLink.href = linkHref;
    bbLink.title = bbLink.dataset.altTitle;
  } else {
    bbLink.href = "https://www.braceletbook.com/";
    bbLink.title = bbLink.dataset.title;
  }
}

function addSvg(parentId, generator, config) {

  let patternView = generator(config);

  const patternSvg = patternView.querySelector('svg');
  addConfigToSvg(patternSvg, config);
  let width = patternSvg.width.baseVal.value;
  let height = patternSvg.height.baseVal.value;

  patternSvg.style.maxWidth = '90vw';
  patternSvg.style.maxHeight = 'calc(90vw / ' + width + ' * ' + height + ')';

  let patternDiv = document.getElementById(parentId);
  patternDiv.style.width = width + 'px';
  patternDiv.style.height = height + 'px';
  patternDiv.style.maxWidth = '90vw';
  patternDiv.style.maxHeight = 'calc(90vw / ' + width + ' * ' + height + ')';

  const patternShadow = patternDiv.shadowRoot || patternDiv.attachShadow({mode: "open"});
  patternShadow.replaceChildren(patternView);
}

function addConfigToSvg(svg, config) {
  let meta = svg.querySelector("defs metadata");
  if (!meta) {
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS(svg.namespaceURI, 'defs');
      svg.insertAdjacentElement("afterbegin", defs);
    }
    meta = document.createElementNS(svg.namespaceURI, 'metadata');
    defs.append(meta);
  }

  const NS_META = 'urn:de.nigjo:threadedit:config';
  let metaConfigElement = document.createElementNS(NS_META, 'config');
  metaConfigElement.setAttribute("xmlns", NS_META);
  let contentText = JSON.stringify(config);
  console.debug(contentText);
  let content = document.createTextNode(contentText);
  metaConfigElement.append(content);

  meta.append(metaConfigElement);
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
        link.classList.add("dropdown-item");
        let q = new URLSearchParams();
        q.set('pattern', info.name);
        link.href = '?' + q;
        link.textContent = info.displayName || info.name;
        item.append(link);
      } else {
        const itemText = document.createElement('span');
        itemText.textContent = info.displayName || info.name;
        itemText.classList.add("dropdown-item");
        itemText.classList.add("active");
        item.append(itemText);
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

  initScaleMenu();

  console.debug("waiting for config files to load...");
}
//initPage();
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


function initScaleMenu() {
  let current = undefined;
  let storedScale = sessionStorage.getItem('braceletedit.scale') || "3,4";
  const scalerItems = document.querySelectorAll("[data-be-scaler]");
  const mapped = new Map([...scalerItems]
          .map(e => [e.dataset.beScaler, e]));
  if (mapped.has(storedScale)) {
    current = mapped.get(storedScale);
    current.classList.add('active');
  }
  for (var scaleItem of scalerItems) {
    scaleItem.onclick = (evt) => {
      let item = evt.target;
      let nextVal = item.dataset.beScaler;
      let scale = nextVal.split(",");
      if (scale.length !== 2) {
        console.warn("EDITOR", "invalid scale:", scale);
        return;
      }
      sessionStorage.setItem('braceletedit.scale', nextVal);

      if (current)
        current.classList.remove("active");
      current = item;
      current.classList.add("active");

      let cfg = JSON.parse(sessionStorage.getItem('braceletedit.config'));
      addSvg('preview', cfg => view.createSmallView(cfg, scale[0], scale[1]), cfg);
    };
  }
}

// execute on module load
(() => {
  initPage();
})();