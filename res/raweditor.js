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
import {configManager} from './braceletedit.js';
import ExtensionEventData from './extensions.js';
const LOGGER = 'RAWEDITOR';

class RawEditor {

  constructor() {
    if (document.readyState === 'loading') {
      throw 'document not loaded';
    }
    document.addEventListener("be.svgChanged", e => {
      if (e.detail.id === "pattern") {
        this.updateEditor();
      }
    });
  }

  initActions() {
    const raweditor = document.forms.raweditor;
    raweditor.onsubmit = () => {
      try {
        this.updateConfig();
      } catch (e) {
        console.error(e);
      }
      return false;
    };
    raweditor.addColor.onclick = e => {
      const config = configManager.getConfig();
      const defaultColor = '#FF8833';
      config.colors.push(defaultColor);
      this.addColorButton(config.colors.length - 1, defaultColor);
    };
    raweditor.threads.onkeyup = e => {
      let val = raweditor.threads.value;
      //console.debug(LOGGER, val, raweditor.threads.dataset.stored);
      if (val.toUpperCase() !== raweditor.threads.dataset.stored) {
        this.setChanged();
      }
    };
  }

  updateConfig() {
    console.log(LOGGER, "update current view");

    let nextConfig = {
      _version: 1,
      _format: 'braceletview',
      meta: {
        modified: new Date().toISOString()
      }
    };
    const oldConfig = configManager.getConfig();

    if ("meta" in oldConfig) {
      for (let key of Object.keys(oldConfig.meta)) {
        if (!(key in nextConfig.meta)) {
          nextConfig.meta[key] = oldConfig.meta[key];
        }
      }
    }

    nextConfig.colors = [];
    for (let colorDef of document.getElementById("rawedit-colors")
            .querySelectorAll('input')) {
      nextConfig.colors.push(colorDef.value);
    }

    nextConfig.threads = document.forms.raweditor.threads.value.toUpperCase();
    nextConfig.pattern = oldConfig.pattern; //TODO: get from form

    configManager.updateConfig(nextConfig);
  }

  setChanged() {
    document.forms.raweditor.apply.classList.remove('disabled');
  }

  createNewConfig() {
  }

  updateEditor() {
    console.group(LOGGER, "update");
    let config = configManager.getConfig();
    //console.debug(LOGGER, document.forms.raweditor);
    const raweditor = document.forms.raweditor;

    raweditor.threads.value
            = raweditor.threads.dataset.stored
            = config.threads;

    console.debug(LOGGER, config.threads.length, "threads");

    const colorRow = new DocumentFragment();
    //farben
    let colorIdx = 0;
    const rowTpl = document.getElementById("rawedit-color-row");
    for (const color of config.colors) {
      this.addColorButton(colorIdx++, color, colorRow);
    }
    document.getElementById("rawedit-colors").replaceChildren(colorRow);
    console.debug(LOGGER, colorIdx, "defined colors");

    let svg = document.getElementById("pattern").shadowRoot.querySelector('svg');
    //console.debug(LOGGER, 1, this);
    svg.onclick = e => this.toggleKnot(e);
    //console.debug(2);

    document.forms.raweditor.apply.classList.add('disabled');

    console.groupEnd();
  }

  toggleKnot(event) {
    let knot = event.target.closest('.knot');
    if (knot) {
      let row = knot.parentNode;
      let kidx = -1; //first sibling is rowmark
      while ((knot = knot.previousElementSibling))
        ++kidx;
      let ridx = 0;
      while ((row = row.previousElementSibling))
        ++ridx;
      //console.debug('knot', kidx, ridx);

      let config = configManager.getConfig();
      config.pattern[ridx][kidx] = (config.pattern[ridx][kidx] + 1) % 5;
      if (config.pattern[ridx][kidx] === 0)
        config.pattern[ridx][kidx] = 1;

      //doc.dispatchEvent(new CustomEvent('be.updateConfig'));
      configManager.updateConfig(config);
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
    new ExtensionEventData({
        name: 'rawedit',
        displayName: 'Farben und Fäden',
        position: 1000,
        styles: 'res/raweditor.css',
        pageContent: text,
        selector: '#raweditor',
        init: () => {
          editor.initActions();
          const pat = document.getElementById('pattern');
          if (pat.shadowRoot)
            editor.updateEditor();
        }
    }).dispatch();
    //editor.updateEditor();
  });
})();
