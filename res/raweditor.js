/* 
 * Copyright 2023 nigjo.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const LOGGER = 'RAWEDITOR';
class RawEditor {
  constructor() {
    document.addEventListener("be.configChanged", () => this.updateEditor());
    if (document.readyState === 'loading') {
      throw 'document not loaded';
    }
  }

  initActions() {
    document.forms.raweditor.onsubmit = () => {
      try {
        this.updateConfig();
      } catch (e) {
        console.error(e);
      }
      return false;
    };
    document.forms.raweditor.addColor.onclick = e => {
      const config = window.currentConfig;
      const defaultColor = '#FF8833';
      config.colors.push(defaultColor);
      this.addColorButton(config.colors.length - 1, defaultColor);
    };
  }

  updateConfig() {
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
    window.dispatchEvent(new CustomEvent('be.updateConfig'));
  }

  setChanged() {
    document.forms.raweditor.apply.classList.remove('disabled');
  }

  createNewConfig() {
  }

  updateEditor() {
    //console.group(LOGGER, "update");
    let config = window.currentConfig;
    //console.debug(LOGGER, document.forms.raweditor);

    document.forms.raweditor.threads.value = config.threads;

    const colorRow = new DocumentFragment();
    //farben
    let colorIdx = 0;
    const rowTpl = document.getElementById("rawedit-color-row");
    for (const color of config.colors) {
      this.addColorButton(colorIdx++, color, colorRow);
    }
    document.getElementById("rawedit-colors").replaceChildren(colorRow);

    let svg = document.getElementById("pattern").shadowRoot.querySelector('svg');
    //console.debug(LOGGER, 1, this);
    svg.onclick = e => this.toggleKnot(e);
    //console.debug(2);

    document.forms.raweditor.apply.classList.add('disabled');

    //console.groupEnd();
  }

  toggleKnot(event) {
    let knot = event.target.closest('.knot');
    if (knot) {
      let row = knot.parentNode;
      let kidx = -1; //first sibling is rowmark
      while (knot = knot.previousElementSibling)
        ++kidx;
      let ridx = 0;
      while (row = row.previousElementSibling)
        ++ridx;
      //console.debug('knot', kidx, ridx);

      let config = window.currentConfig;
      config.pattern[ridx][kidx] = (config.pattern[ridx][kidx] + 1) % 5;
      if (config.pattern[ridx][kidx] === 0)
        config.pattern[ridx][kidx] = 1;

      window.dispatchEvent(new CustomEvent('be.updateConfig'));
    }
  }

  addColorButton(idx, color, parent = null) {
    let colorName = String.fromCharCode(
            'A'.charCodeAt(0) + idx);
    const rowTpl = document.getElementById("rawedit-color-row");
    let rowFragment = rowTpl.content.cloneNode(true);

    let row = rowFragment.firstElementChild;
    row.setAttribute("title", "Faden " + colorName);

    let picker = rowFragment.querySelector('input[type=color]');
    picker.setAttribute("name", "thread-" + colorName);
    picker.setAttribute("value", color);
    picker.onchange = () => this.setChanged();

    let closer = rowFragment.querySelector('button');
    closer.onclick = (e) => {
      //TODO: Farbe aus Liste entfernen
      row.remove();
      this.setChanged();
    };
    //row.q

    if (parent)
      parent.append(rowFragment);
    else
      document.getElementById("rawedit-colors").append(rowFragment);
    this.setChanged();
  }
}

(() => {
  fetch('res/raweditor.html').then(r => {
    if (r.ok)
      return r.text();
    throw r;
  }).then(text => {
    const editor = new RawEditor();
    document.dispatchEvent(new CustomEvent('be.loadExtension', {
      detail: {
        name: 'rawedit',
        displayName: 'Farben und Fäden',
        styles: 'res/raweditor.css',
        pageContent: text,
        selector: '#raweditor',
        init: () => {
          editor.initActions();
          editor.updateEditor();
        }
      }
    }));
    //editor.updateEditor();
  });
})();
