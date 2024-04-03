const style = require('./style');

const uc = 'https://undercards.net/images';

module.exports = `<html>
<head>
  <style>${style}</style>
</head>
<body>
  <div class="card">
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
</body>
</html>`;
