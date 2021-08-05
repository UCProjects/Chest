const uc = 'https://undercards.net/images';

module.exports = `<html>
<head>
  <style>
    @font-face { font-family: 'DTM-Mono'; src: url('https://firebasestorage.googleapis.com/v0/b/replay.uc.feildmaster.com/o/DTM-Mono.otf?alt=media&token=424020c7-7b2b-4217-971b-333fe1704da4') format('truetype'); }
    body { font-family: 'DTM-Mono'; --dt: rgb(255, 0, 0); --patience: rgb(65, 252, 255); --bravery: rgb(252, 165, 0); --integ: rgb(0, 100, 255); --pers: rgb(213, 53, 217); --kindness: rgb(0, 192, 0); --justice: rgb(255, 255, 0); --font: rgb(255, 255, 255); --border: rgb(255, 255, 255); background-color: black; width: 324px; }
    [data-overlay]::before { content: attr(data-overlay); position: absolute; font-family: segoe ui, monospace; bottom: 0; left: 0; font-size: 11px; color: rgb(255, 255, 255); }
    .outlined { text-shadow: -1px -1px 0 rgb(0, 0, 0), 1px 1px 0 rgb(0, 0, 0), -1px 1px 0 rgb(0, 0, 0), 1px -1px 0 rgb(0, 0, 0); }
    #pack { display: flex; flex-direction: row; flex-wrap: wrap; align-items:flex-start; align-content:flex-start; }
    .row { display: flex; flex-direction: row; justify-content: space-between; }
    .black-bg { background-color: rgb(0, 0, 0); background-clip: padding-box; }
    .center-v { display: flex; align-items: center; }
    .center-h { display: flex; justify-content: center; }
    .shiny { --border: rgb(255, 187, 0); }
    .card { border: 2px solid var(--border); color: var(--font); width: 162px; overflow: hidden; box-sizing: border-box; user-select: none; -moz-user-select: none; -webkit-user-select: none; }
    .card * { margin: 0; box-sizing: border-box; padding: 0; }
    .top, .bottom { height: 30px; }
    .top > * { border-bottom: 2px solid var(--border); }
    .name { flex-grow: 2; padding-left: 3px; white-space: nowrap; overflow: hidden; }
    .cost { width: 40px; border-left: 2px solid var(--border); font-size: 1.2rem; margin-top: -4px; color: rgb(52, 185, 254); }
    .image { position: relative; height: 88px; }
    .avatar { width: 100%; height: 100%; background-color: var(--bgcolor); }
    .status, .tribes { position: absolute; right: 2px; display: flex; }
    .status { top: 4px; }
    .tribes { bottom: 0px; }
    .status > img, .tribes > img, .status > span { margin-right: 2px; }
    .status > span { position: relative; }
    .status img, .tribes img { width: 16px; }
    .description { border-top: 2px solid var(--border); text-align: center; font-size: 0.8rem; padding: 2px 1px; min-height: 80px; }
    .bottom > * { border-top: 2px solid var(--border); }
    .attack { width: 40px; border-right: 2px solid var(--border); color: rgb(255, 0, 0); font-size: 20px; }
    .rarity { flex-grow: 2; padding: 5px 0; }
    .health { width: 40px; border-left: 2px solid var(--border); color: rgb(107, 204, 0); font-size: 20px; }
    .DETERMINATION { color: var(--dt); }
    .LEGENDARY { color: rgb(255, 215, 0); }
    .EPIC { color: var(--pers); }
    .RARE { color: rgb(0, 184, 255); }
    .COMMON { color: var(--font); }
    .BASE { color: rgb(128, 128, 128); }
    .GENERATED, .TOKEN { color: rgb(0, 200, 0); }
    .underlined { text-decoration: underline; }
    .green { color: rgb(102, 204, 0); }
    .red { color: rgb(255, 0, 0); }
    .yellow { color: rgb(255, 215, 0); }
    .blue { color: rgb(0, 184, 255); }
    .PATIENCE { color: var(--patience); }
    .BRAVERY { color: var(--bravery); }
    .INTEGRITY { color: var(--integ); }
    .PERSEVERANCE { color: var(--pers); }
    .KINDNESS { color: var(--kindness); }
    .JUSTICE { color: var(--justice); }
  </style>
</head>
<body>
  <div id="pack">
    {{#each cards}}
      <div class="card {{#if shiny}}shiny{{/if}}">
        <div class="top row">
          <div class="name black-bg center-v {{#if soul}}{{soul.name}}{{/if}}">{{name}}</div>
          <div class="cost black-bg center-v center-h">{{cost}}</div>
        </div>
        <div class="image">
          <img class="avatar" src="${uc}/cards/{{image}}.png">
          <div class="status">
            {{#each status}}
              {{{this}}}
            {{/each}}
          </div>
          <div class="tribes">
            {{#each tribes}}
              <img src="${uc}/tribes/{{this}}.png">
            {{/each}}
          </div>
        </div>
        <div class="description black-bg center-v center-h">
          <span>{{{description}}}</span>
        </div>
        <div class="bottom row">
          {{#unless typeCard}}
            <div class="attack black-bg center-v center-h">{{attack}}</div>
          {{/unless}}
          <div class="rarity black-bg center-v center-h">
            <img src="${uc}/rarity/{{extension}}_{{rarity}}.png">
          </div>
          {{#unless typeCard}}
            <div class="health black-bg center-v center-h">{{hp}}</div>
          {{/unless}}
        </div>
      </div>
    {{/each}}
  </div>
</body>
</html>`;
