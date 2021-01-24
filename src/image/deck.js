module.exports = `<html>
<head>
  <style>
    @font-face { font-family: 'DTM-Mono'; src: url('https://firebasestorage.googleapis.com/v0/b/replay.uc.feildmaster.com/o/DTM-Mono.otf?alt=media&token=424020c7-7b2b-4217-971b-333fe1704da4') format('truetype'); }
    body { font-family: 'DTM-Mono'; width: 200px; background-color: rgb(0, 0, 0); color: rgb(255, 255, 255); font-size: 14px; line-height: 1.42857143; }
    ul { margin: 0; padding: 0; }
    li { border: 1px solid rgb(255, 255, 255); display: block; padding: 0 0 0 5px; height: 21px; }
    li:first-child { border-top-left-radius: 4px; border-top-right-radius: 4px; }
    li:last-child { border-bottom-right-radius: 4px; border-bottom-left-radius: 4px; }
    .BASE { color: rgb(128, 128, 128); }
    .COMMON { color: rgb(255, 255, 255); }
    .RARE { color: rgb(0, 184, 255); }
    .EPIC { color: rgb(213, 53, 217); }
    .LEGENDARY { color: rgb(255, 215, 0); }
    .DETERMINATION { color: rgb(255, 0, 0); }
    .PATIENCE { color: rgb(65, 252, 255); }
    .BRAVERY { color: rgb(252, 165, 0); }
    .INTEGRITY { color: rgb(0, 100, 255); }
    .PERSEVERANCE { color: rgb(213, 53, 217); }
    .KINDNESS { color: rgb(0, 192, 0); }
    .JUSTICE { color: rgb(255, 255, 0); }
  </style>
</head>
<body>
  <div id="deck">
    <p class="{{soul.id}}">{{soul.name}}</p>
    {{#each artifacts}}
      <p class="{{#if legendary}}LEGENDARY{{/if}}"><img style="height: 16px;" src="https://undercards.net/images/artifacts/{{image}}.png" /> {{name}}</p>
    {{/each}}
    <ul>
    {{#each cards}}
      <li><span class="{{rarity}}">{{name}}</span> ({{cost}})</li>
    {{/each}}
    </ul>
  </div>
</body>
</html>`;