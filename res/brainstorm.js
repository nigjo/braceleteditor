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
import ExtensionEventData from './extensions.js';

const pageContent = `
  <div class="card card-body">
    <h3 class="card-title">Ideenliste</h3>
    <ul class="card-text">
      <li>Anzeige wie die bracelet SVGs</li>
      <li>Farbänderung per klick auf die Knoten</li>
      <li>Automatische Fadenführung suchen (Hauptzweck)</li>
      <li>"Optimierung" mit möglichst wenig "Wechselknoten"</li>
      <li>Export für braceletbook.com und friendship-bracelets.net</li>
    </ul>
  </div>
`;

new ExtensionEventData({
  name: "brainstorm",
  displayName: "Ideenliste",
  pageContent: pageContent,
  position: 99999
}).dispatch();
