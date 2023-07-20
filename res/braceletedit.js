import * as view from "./braceletview.js";
const LOGGER = 'EDITOR';

console.group(LOGGER, "INIT in");

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
  console.group(LOGGER, "updatePattern");
  document.dispatchEvent(
          new CustomEvent('be.configChanged', {detail: {config: config}}));
  console.groupEnd();
}

// update storage and "configecho"
document.addEventListener('be.configChanged', updateStorage);
function updateStorage(evt) {
  const config = evt.detail.config;
  let cfgJson = JSON.stringify(config, null, '  ')
          .replaceAll(/\n\s+(\d)(\n\s+)?/gs, '$1');
  sessionStorage.setItem('braceletedit.config', cfgJson);
  document.getElementById("configecho").textContent = cfgJson;
}

// update braceletbook.com link
document.addEventListener('be.configChanged', updateExternalLink);
function updateExternalLink(evt) {
  const config = evt.detail.config;

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

// create SVG Images
document.addEventListener('be.configChanged', updatePatternAndPreview);
function updatePatternAndPreview(evt) {
  const config = evt.detail.config;

  addSvg('pattern', view.createNormalPatternView, config);
  let scale = (sessionStorage.getItem('braceletedit.scale') || '4,5')
          .split(',').map(Number);
  addSvg('preview', cfg => view.createSmallView(cfg, scale[0], scale[1]), config);
}

function addSvg(parentId, generator, config) {

  let patternView = generator(config);

  const patternSvg = patternView.querySelector('svg');
  let width = patternSvg.width.baseVal.value;
  let height = patternSvg.height.baseVal.value;

  patternSvg.style.maxWidth = 'calc(100vw - 2em)';
  patternSvg.style.maxHeight = 'calc((100vw - 2em) / ' + width + ' * ' + height + ')';

  let patternDiv = document.getElementById(parentId);
  patternDiv.style.width = width + 'px';
  patternDiv.style.height = height + 'px';
  patternDiv.style.maxWidth = 'calc(100vw - 2em)';
  patternDiv.style.maxHeight = 'calc((100vw - 2em) / ' + width + ' * ' + height + ')';

  const patternShadow = patternDiv.shadowRoot || patternDiv.attachShadow({mode: "open"});
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
  console.debug(LOGGER, "init page");

  var infile = 'demo';
  var q = new URLSearchParams(location.search);
  if (q.has('pattern'))
    infile = q.get('pattern');

  window.currentPattern = infile;

  Promise.all([
    initKnownPatternList(),
    loadPattern(infile)
  ]).then(_ => {
    console.debug(LOGGER, "config files loaded.");
    document.dispatchEvent(new CustomEvent('be.configLoaded'));
  });

  initScaleMenu();

  console.debug(LOGGER, "waiting for config files to load...");
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
        console.debug(LOGGER, t.name, atleft);
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
        console.debug(LOGGER, t.name, atleft);
        for (let r of config.pattern) {
          r.splice(atleft ? 0 : r.length - 1, 1);
        }
        changed = true;
        break;
      }
      default:
        console.debug(LOGGER, 'handleActions', t.name, t);
    }

    if (changed) {
      updatePattern(config);
    }
  } else {
    console.debug(LOGGER, 'handleActions', t);
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
        console.warn(LOGGER, "invalid scale:", scale);
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

function downloadItemContent(parent) {
  //console.log(LOGGER, parent.dataset);
  let filename = "braceletedit-" + window.currentPattern
          + "-" + parent.dataset.downloadFile;
  const dllink = document.createElement('a');
  let content = parent.innerHTML;
  if (parent.shadowRoot) {
    content = parent.shadowRoot.innerHTML;
  }

  if (content.length === 0) {
    console.warn(LOGGER, "no content for " + filename);
    return;
  }

  dllink.style.display = 'none';
  let mediatype = 'text/plain';
  dllink.href = 'data:' + mediatype
          + ';charset=utf-8,'
          + encodeURIComponent(content);
  dllink.setAttribute("download", filename);
  document.body.append(dllink);
  dllink.click();
  setTimeout(() => dllink.remove(), 10);
  return false;
}

function makeDownloadLinks() {
  if (document.readyState === 'loading') {
    console.debug(LOGGER, 'wait for content loaded');
    document.addEventListener('DOMContentLoaded', makeDownloadLinks);
    return;
  }
  console.debug(LOGGER, 'content loaded');
  /*wn-item" href="#" data-download-file="patternedit.json">
   <svg class="bi theme-icon-active" style="width:.9em;height:.9em" fill="currentColor">
   <use xlink:href="res/bootstrap-icons/bootstrap-icons.svg#download"></use></svg>
   Config</a></li>
   */
  function createDLIcon() {
    const svg = document.createElementNS(view.SVGNS, 'svg');
    svg.classList.add("bi");
    svg.setAttribute('style', "width:.9em;height:.9em;fill:currentColor");
    const use = document.createElementNS(view.SVGNS, 'use');
    use.setAttribute("xlink:href", "res/bootstrap-icons/bootstrap-icons.svg#download");
    svg.append(use);
    return svg;
  }

  let lastMenuItem = document.getElementById('downloadhead');
  let dlItems = document.querySelectorAll('[data-download-file]');
  for (var dlItem of dlItems) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.classList.add("dropdown-item");
    a.href = "#";
    a.onclick = ((element) => {
      return (evt) => {
        console.debug(LOGGER, element);
        downloadItemContent(element);
        return false;
      };
    })(dlItem);

    a.innerHTML = createDLIcon().outerHTML;
    let caption = dlItem.dataset.downloadCaption
            //|| dlItem.id
            || dlItem.dataset.downloadFile;
    a.append(" " + caption);

    li.append(a);

    lastMenuItem.after(li);
    lastMenuItem = li;

    if (dlItem.dataset.downloadFile.endsWith(".svg") && dlItem.id) {
      const pngLi = document.createElement('li');
      const pngLink = document.createElement('a');
      pngLink.classList.add("dropdown-item");
      pngLink.innerHTML = createDLIcon().outerHTML;
      pngLink.append(" " + caption + " (PNG)");
      pngLink.onclick = ((element) => {
        let orgname = element.dataset.downloadFile;
        let filename = "braceletedit-" + window.currentPattern
                + "-" + orgname.substring(0, orgname.lastIndexOf('.'));
        return () => storeAsPng(element.id, filename);
      })(dlItem);

      pngLi.append(pngLink);
      lastMenuItem.after(pngLi);
      lastMenuItem = pngLi;
    }

  }
}

function storeAsPng(svgid, filenamebase) {
  console.debug(LOGGER, svgid, filenamebase);
  console.debug(LOGGER, document.getElementById(svgid));
  console.debug(LOGGER, document.getElementById(svgid)
          .querySelector('svg'));

  const parent = document.getElementById(svgid);
  var svg = (parent.shadowRoot ? parent.shadowRoot : parent)
          .querySelector('svg');
  const canvas = document.createElement('canvas');

  //Source: https://mybyways.com/blog/convert-svg-to-png-using-your-browser
  var img = new Image();
  var blob = new Blob([svg.outerHTML], {type: 'image/svg+xml'});
  var url = URL.createObjectURL(blob);
  img.onload = function () {
    const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    canvas.width = svg.width.baseVal.value;
    canvas.height = svg.height.baseVal.value;
    canvas.getContext('2d').drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    var uri = canvas.toDataURL('image/png').replace('image/png', 'octet/stream');
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = uri;
    a.download = filenamebase + '.png';
    a.click();
    window.URL.revokeObjectURL(uri);
    document.body.removeChild(a);
  };
  img.src = url;
}

class RawEditor {
  constructor() {
    document.addEventListener("be.configChanged", this.updateEditor);
    document.forms.raweditor.onsubmit = () => {
      console.log(LOGGER, "update current view");

      let config = {
        _version: 1,
        _format: 'braceletview',
        meta: {
          modified: new Date().toISOString()
        }
      };
      if ("meta" in window.currentConfig) {
        for (let key of Object.keys(window.currentConfig.meta)) {
          if (!(key in config.meta)) {
            config.meta[key] = window.currentConfig.meta[key];
          }
        }
      }
      config.colors = [];
      for (let colorDef of document.getElementById("rawedit-colors")
              .querySelectorAll('input')) {
        config.colors.push(colorDef.value);
      }

      config.threads = document.forms.raweditor.threads.value.toUpperCase();
      config.pattern = window.currentConfig.pattern; //TODO: get from form
      
      //console.debug(LOGGER, config);
      window.currentConfig = config;
      updatePattern(config);

      return false;
    };
  }

  createNewConfig() {
  }

  updateEditor() {
    console.group(LOGGER, "RawEditor", "update");
    let config = window.currentConfig;
    console.debug(LOGGER, "RawEditor", document.forms.raweditor);

    document.forms.raweditor.threads.value = config.threads;

    const colorRow = new DocumentFragment();
    //farben
    let colorIdx = 0;
    const rowTpl = document.getElementById("rawedit-color-row");
    for (const color of config.colors) {
      let colorName = String.fromCharCode('A'.charCodeAt(0) + colorIdx);
      let row = rowTpl.content.cloneNode(true);
      let picker = row.querySelector('input');
      picker.setAttribute("name", "thread-" + colorName);
      picker.setAttribute("title", "Faden " + colorName);
      picker.setAttribute("value", color);

      colorRow.append(row);
      ++colorIdx;
    }

    document.getElementById("rawedit-colors").replaceChildren(colorRow);
    console.groupEnd();
  }
}

// execute on module load
(() => {
  new RawEditor();
  initPage();
  makeDownloadLinks();
  console.groupEnd();
})();