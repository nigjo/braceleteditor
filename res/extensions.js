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
const LOGGER = 'EXT';
export class ExtensionEventData {
  constructor(details) {
    this.name = undefined;
    this.displayName = undefined;
    this.pageContent = undefined;
    this.pageFile = undefined;
    this.selector = undefined;
    this.init = undefined;

    //console.debug(LOGGER, details);

    if (!details) {
      console.warn(LOGGER, "no details");
    } else {
      for (let k of Object.keys(details)) {
        this[k] = details[k];
      }
    }

    //console.debug(LOGGER, this);
  }

  dispatch() {
    document.dispatchEvent(new CustomEvent('be.loadExtension', {
      detail: this
    }));
  }
}

document.addEventListener('be.loadExtension', e => loadExtension(e.detail));
function loadExtension(detail) {
  const extData = new ExtensionEventData(detail);
  const name = extData.name;
  if (!name) {
    throw new TypeError("missing name for extension.");
  }
  if (!extData.pageContent) {
    if (extData.pageFile) {
      console.debug(LOGGER, "try to get pageContent for " + name);
      let fileDetails = extData;
      fetch(extData.pageFile).then(r => {
        if (r.ok)
          return r.text();
        throw r;
      }).then(text => {
        fileDetails.pageContent = text;
        document.dispatchEvent(new CustomEvent('be.loadExtension', {
          detail: fileDetails
        }));
      });
      return;
    } else {
      throw new TypeError("missing pageContent for extension " + name);
    }
  }

  console.group(LOGGER, 'load extension', name);
  let extId = 'extension-' + name;

  //InsertionPoint in menu
  const menuIP = document.getElementById('extensionsItems');
  const menuItem = document.createElement('button');
  menuItem.className = 'dropdown-item';
  menuItem.dataset.bsToggle = 'collapse';
  menuItem.dataset.bsTarget = '#' + extId;
  menuItem.ariaExpanded = false;
  menuItem.ariaControls = extId;
  menuItem.textContent = extData.displayName || name;
  //Insert Item after marker
  menuIP.parentNode.insertBefore(menuItem, menuIP.nextSibling);

  if (extData.styles) {
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.type = 'text/css';
    styles.href = extData.styles;
    document.head.append(styles);
  }

  const extDiv = document.createElement('div');
  extDiv.id = extId;
  extDiv.classList.add('container');
  extDiv.classList.add('collapse');
  extDiv.dataset.bsParent = '#extensions';

  console.debug(LOGGER, typeof (extData.pageContent));
  if (extData.selector) {
    console.debug(LOGGER, extData.selector);
    //const frag = document.createDocumentFragment();
    const div = document.createElement('div');
    div.innerHTML = extData.pageContent;
    console.debug(LOGGER, div);
    console.debug(LOGGER, div.firstElementChild);
    let content = div.querySelector(extData.selector);
    console.debug(LOGGER, extData.selector, content);
    extDiv.replaceChildren(content);
  } else {
    extDiv.innerHTML = extData.pageContent;
  }

  //TODO: Reihenfolge wichtig? Alphabetisch nach "name"?
  document.getElementById('extensions').append(extDiv);

  if (extData.init && typeof (extData.init) === 'function') {
    extData.init();
  }

  console.groupEnd();
}