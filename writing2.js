/* Writing Workshop data — three writing modules from the SPPCS worksheets
   Writing 1: My Favourite Place at School (Module 1)
   Writing 2: Rules — Places like Home (Module 1, incl. video Parts A–B)
   Writing 3: A Magazine Article — My Favourite Season (Module 2) */
'use strict';

/* ---------- Writing 3: My Favourite Season ---------- */
const SEASONS = {
  spring: { e: '🌸', adj: 'beautiful', weather: ['warm and wet', 'warm and windy'], eat: ['eat fresh strawberries', 'eat spring rolls'],
    do: ['see flowers blossom', 'see butterflies', 'listen to birds', 'grow flowers'], wear: ['T-shirts', 'light jackets', 'jeans', 'raincoats'],
    fest: ['Easter', 'Chinese New Year'], why: ['the flowers are beautiful and the weather is warm', 'I can see butterflies in the park'] },
  summer: { e: '☀️', adj: 'wonderful', weather: ['hot and sunny', 'hot and wet'], eat: ['eat ice cream', 'eat ice lollies', 'eat watermelon'],
    do: ['swim in the sea', 'go sunbathing', 'build sandcastles', 'go to the beach'], wear: ['T-shirts', 'shorts', 'sunhats', 'sunglasses'],
    fest: ['the Dragon Boat Festival'], why: ['I can swim in the sea with my family', 'we have a long summer holiday'] },
  autumn: { e: '🍁', adj: 'magical', weather: ['cool and windy', 'cool and dry'], eat: ['eat fresh fruit', 'eat mooncakes', 'have a barbecue'],
    do: ['have a barbecue', 'go on a picnic', 'see maple trees', 'fly kites', 'go hiking'], wear: ['sweaters', 'trousers', 'jackets'],
    fest: ['the Mid-Autumn Festival', 'Halloween'], why: ['the weather is cool and the air is fresh', 'I can fly kites with my friends'] },
  winter: { e: '⛄', adj: 'lovely', weather: ['cold and dry', 'cold and windy'], eat: ['eat hot pot', 'drink hot chocolate'],
    do: ['build a snowman', 'go skiing', 'go sledding', 'drink hot chocolate'], wear: ['coats', 'scarves', 'gloves', 'woolly hats'],
    fest: ['Christmas', 'Chinese New Year'], why: ['I can drink hot chocolate with my family', 'Christmas is fun and I get presents'] },
};
const FESTS = {
  'Easter': ['go on an Easter egg hunt', 'eat chocolate eggs'],
  'Chinese New Year': ['have a family reunion dinner', 'get red packets', 'visit our relatives'],
  'the Dragon Boat Festival': ['watch dragon boat races', 'eat rice dumplings'],
  'the Mid-Autumn Festival': ['play with lanterns', 'eat mooncakes', 'look at the full moon'],
  'Halloween': ['go trick-or-treating', 'wear costumes', 'carve pumpkins'],
  'Christmas': ['decorate the Christmas tree', 'see Christmas lights', 'sing Christmas songs'],
};
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

WRITING.t3 = {
  title: 'Writing 3: My Favourite Season', module: 'Module 2: The World Around Us · A Magazine Article',
  model: [
    'My favourite season is autumn.', 'Autumn is a wonderful season.', 'It is windy and cool in autumn.',
    'My friends and I usually eat fresh fruit.', 'We usually go hiking and fly kites, too.', 'We usually wear sweaters and trousers.',
    'During autumn, we celebrate the Mid-Autumn Festival.', 'We have mooncakes and play with lanterns.',
    'I like this time of year very much because autumn and the Mid-Autumn Festival make me smile.', 'I am happy when this season is here!',
  ],
  labels: ['Season', 'Season', 'Weather', 'Food', 'Activities', 'Clothing', 'Festival', 'Festival', 'Reason', 'Feelings'],
  teacherTips: [
    ['Full sentences', 'Write <b>The air is very fresh.</b> — not just "So fresh."'],
    ['Weather words', '<b>The weather is cool.</b> · <b>In autumn, it is cool and windy.</b>'],
    ['Two things', 'Name <b>two</b> activities, <b>two</b> clothing items and <b>two</b> ways to celebrate. Join them with <b>and</b>.'],
    ['because', 'Give a reason: I love autumn <b>because</b> the air is fresh and the weather is cool.'],
    ['Feelings', 'Finish with your feeling: I feel <b>excited</b> when this season is here!'],
  ],
  checklist: ['I write about my favourite season.', 'I use the weather words correctly.', 'I write about what I do there.', 'I spell the words correctly.'],
};

/* Season planning questions (generic plan engine) */
const SEASON_PLAN = [
  { k: 'season', q: 'Which season do you like most?', opts: () => Object.keys(SEASONS).map(s => [s, SEASONS[s].e]) },
  { k: 'adj', q: 'Describe the season in one word.', opts: () => ['wonderful', 'magical', 'beautiful', 'lovely'] },
  { k: 'weather', q: 'What is the weather like in this season?', opts: P => P.season ? SEASONS[P.season].weather : null },
  { k: 'eat', q: 'What do you usually eat in this season?', opts: P => P.season ? SEASONS[P.season].eat : null },
  { k: 'do', q: 'What do you usually do in this season? (two activities)', multi: 2, opts: P => P.season ? SEASONS[P.season].do : null },
  { k: 'wear', q: 'What do you usually wear in this season? (two clothing items)', multi: 2, opts: P => P.season ? SEASONS[P.season].wear : null },
  { k: 'fest', q: 'Which festival do you celebrate during this season?', opts: P => P.season ? SEASONS[P.season].fest : null },
  { k: 'how', q: 'How do you celebrate this festival? (two activities)', multi: 2, opts: P => P.fest ? FESTS[P.fest] : null },
  { k: 'why', q: 'Why do you like this season?', opts: P => P.season ? SEASONS[P.season].why : null },
  { k: 'feel', q: 'How do you feel when the season is here?', opts: () => ['happy', 'excited', 'cheerful', 'relaxed'] },
];
const two = (a, x) => (a && a.length ? (a.length > 1 ? `${a[0]} and ${a[1]}` : a[0]) : x);
function seasonLines(P) {
  const s = P.season || '___';
  return [
    `My favourite season is ${s}.`,
    `${cap(s)} is a ${P.adj || '___'} season.`,
    `In ${s}, it is ${P.weather || '___'}.`,
    `I usually ${P.eat || '___'}.`,
    `My friends and I usually ${two(P.do, '___')}.`,
    `We usually wear ${two(P.wear, '___')}.`,
    `During ${s}, we celebrate ${P.fest || '___'}.`,
    `We ${two(P.how, '___')}.`,
    `I like ${s} because ${P.why || '___'}.`,
    `I feel ${P.feel || '___'} when this season is here!`,
  ];
}

/* Writing 1 plan via the generic engine (uses WRITING.t1 data) */
const PLACE_PLAN = [
  { k: 'place', q: 'What is your favourite place at school?', opts: () => WRITING.t1.places },
  { k: 'floor', q: 'Where is your favourite place?', opts: () => WRITING.t1.floors },
  { k: 'acts', q: 'What do you and your classmates do there? (two things)', multi: 2, opts: P => P.place ? WRITING.t1.acts[P.place] : null },
  { k: 'teach', q: 'What do your teachers do there?', opts: P => P.place ? [WRITING.t1.teach[P.place], 'help us when we have problems'] : null },
  { k: 'why', q: 'Why do you like this place?', opts: P => P.place ? [WRITING.t1.why[P.place], 'it is fun and I can learn a lot'] : null },
  { k: 'feel', q: 'How do you feel when you are there?', opts: () => WRITING.t1.feels },
];
function placeLines(P) {
  const p = P.place || '___', a = P.acts || [];
  return [
    `My favourite place at school is ${p}.`,
    `It is on ${P.floor || '___'}.`,
    `My classmates and I ${a[0] || '___'} there.`,
    `We also ${a[1] || '___'} together.`,
    `My teachers ${P.teach || '___'}.`,
    `I like ${p} because ${P.why || '___'}.`,
    `I feel ${P.feel || '___'} when I am there.`,
  ];
}

/* ---------- The three workshops ---------- */
const SHOPS = {
  place: {
    id: 'place', n: 1, title: 'My Favourite Place at School', tag: 'Writing 1 · Module 1', col: '#BDE7FF', emo: '🏫', mins: 15,
    task: 'Write about your favourite place at school. Write at least six sentences.',
    prompts: ['What is your favourite place at school?', 'Where is it?', 'What do you and your classmates do there? (two things)', 'What do your teachers do there?', 'Why do you like this place?', 'How do you feel when you are there?'],
    plan: PLACE_PLAN, lines: placeLines,
    model: ['My favourite place at school is the computer room.', 'It is on the fourth floor.', 'My classmates and I draw pictures using computers there.', 'We also have computer lessons together.', 'My teachers teach us how to draw amazing pictures using a drawing programme.', 'I like the computer room because it is wonderful and we can draw beautiful pictures.', 'I feel happy when I am there.'],
    content: ['I wrote the name of my favourite place (with "the").', 'I wrote where it is (on the … floor).', 'I wrote TWO things my classmates and I do there.', 'I wrote what my teachers do there.', 'I wrote why I like it (because …).', 'I wrote how I feel there.'],
    language: ['Date at the top right and title in the middle.', 'I indented the first line.', 'Every sentence starts with a capital letter.', 'Every sentence ends with a full stop.', 'I used "on" for floors and "the" for places.', 'I checked my spelling.'],
    words: ['the computer room', 'the library', 'the music room', 'the art room', 'the playground', 'the hall', 'the first floor', 'the second floor', 'classmates', 'teachers', 'because', 'how to', 'using', 'together', 'happy', 'excited', 'relaxed', 'proud'],
    quiz: 'w2', fix: 'w2fix',
  },
  rules: {
    id: 'rules', n: 2, title: 'Places like Home – Rules', tag: 'Writing 2 · Module 1', col: '#C9F2DC', emo: '🏡', mins: 15,
    task: 'Name three places which you see as your "home". For each place, write TWO rules (We must / We mustn\'t …) and a reason for each rule.',
    prompts: ['Place 1: Rule 1 + reason, Rule 2 + reason', 'Place 2: Rule 1 + reason, Rule 2 + reason', 'Place 3: Rule 1 + reason, Rule 2 + reason', 'Use in / on correctly: in the library, on the platform', 'Reasons say WHY or WHAT WILL HAPPEN: People may fall and get hurt.'],
    model: ['The MTR platform:', 'We mustn\'t push on the MTR platform. It is dangerous and people may fall onto the tracks.', 'We must stand behind the yellow line. It keeps us safe from the train.', 'The library:', 'We must keep quiet in the library. Other people need a quiet place to read.', 'We mustn\'t eat or drink in the library. The food may make the books dirty.', 'The school:', 'We must listen to our teachers. Then we can stay focused and learn new things.', 'We mustn\'t run in the corridors. We may fall and get hurt.'],
    content: ['I named three places like home (with "the").', 'I wrote TWO rules for each place.', 'Each rule has a reason.', 'My reasons say WHAT WILL HAPPEN (people may get hurt / the books may get dirty).'],
    language: ['Did you spell all the words correctly? (litter, corridor, platform)', 'Did you use must / mustn\'t correctly?', 'Did you use prepositions correctly? (in the library, on the train)', 'Every sentence starts with a capital letter and ends with a full stop.'],
    words: ['We must', 'We mustn\'t', 'keep quiet', 'line up', 'stand behind the yellow line', 'push', 'litter', 'eat or drink', 'run', 'in the library', 'on the platform', 'in the corridor', 'on the bus', 'It is dangerous.', 'People may get hurt.', 'It is dirty.', 'Other people are reading.', 'It keeps us safe.'],
    teacherTips: [['Specific reasons', 'Your teacher asked: <b>"What will happen if someone pushes us?"</b> → We may fall onto the tracks.'], ['Think about the place', 'Your teacher asked: <b>"What about the books?"</b> → The food may make <b>the books</b> dirty.'], ['Linking words', '<b>Then</b> we can stay focused and learn new things.']],
    quiz: 'w3', fix: 'w3fix', video: 'w5',
  },
  season: {
    id: 'season', n: 3, title: 'My Favourite Season', tag: 'Writing 3 · Module 2', col: '#FFE1B8', emo: '🍁', mins: 15,
    task: 'Write a magazine article about your favourite season. Write the title "My Favourite Season".',
    prompts: ['What are you writing about? (season)', 'What is the weather like in this season?', 'What do you usually eat / do / wear?', 'Which festival do you celebrate? How do you celebrate it?', 'Why do you like this season?', 'How do you feel?'],
    plan: SEASON_PLAN, lines: seasonLines,
    model: WRITING.t3.model,
    content: ['I wrote my favourite season and described it.', 'I wrote the weather.', 'I wrote what I eat and TWO things I do.', 'I wrote TWO clothing items.', 'I wrote the festival and TWO ways to celebrate it.', 'I wrote why I like it (because …) and how I feel.'],
    language: ['Title "My Favourite Season" in the middle.', 'I used the weather words correctly (hot, cool, windy, sunny).', 'Every sentence starts with a capital letter and ends with a full stop.', 'Plural words have -s: kites, sweaters, lanterns.', 'I wrote full sentences (not just "So fresh.").', 'I spelled the words correctly (autumn, because, festival).'],
    words: ['spring', 'summer', 'autumn', 'winter', 'warm', 'hot', 'cool', 'cold', 'windy', 'sunny', 'see flowers blossom', 'swim in the sea', 'fly a kite', 'have a barbecue', 'go on a picnic', 'build a snowman', 'sweaters', 'trousers', 'shorts', 'coats', 'scarves', 'Mid-Autumn Festival', 'Halloween', 'Christmas', 'Easter', 'mooncakes', 'lanterns', 'because', 'excited'],
    teacherTips: WRITING.t3.teacherTips,
    quiz: 'w4', fix: 'w4fix',
  },
};

/* ---------- New question sets ---------- */
const W4Q = [
  M('In summer, it is ___.', 'hot and sunny', ['cold and snowy', 'cool and windy', 'freezing'], ''),
  M('In winter, it is ___.', 'cold', ['hot', 'sunny and hot', 'warm and wet'], ''),
  M('In autumn, it is ___.', 'cool and windy', ['hot and sunny', 'cold and snowy', 'wet and hot'], ''),
  M('What do we usually wear in winter?', 'coats and scarves', ['shorts and sunhats', 'T-shirts and shorts', 'swimsuits'], ''),
  M('What do we usually wear in autumn?', 'sweaters and trousers', ['swimsuits', 'shorts and sunglasses', 'nothing'], ''),
  M('Which activity is for summer?', 'swim in the sea', ['build a snowman', 'go sledding', 'see maple trees'], ''),
  M('Which activity is for spring?', 'see flowers blossom', ['go skiing', 'build a snowman', 'go trick-or-treating'], ''),
  M('Which activity is for winter?', 'build a snowman', ['go sunbathing', 'build a sandcastle', 'eat ice lollies'], ''),
  M('At the Mid-Autumn Festival, we ___.', 'play with lanterns and eat mooncakes', ['go on an Easter egg hunt', 'watch dragon boat races', 'decorate the Christmas tree'], ''),
  M('At Halloween, we ___.', 'go trick-or-treating and wear costumes', ['play with lanterns', 'have a family reunion dinner', 'eat rice dumplings'], ''),
  M('On Chinese New Year\'s Eve, we ___.', 'have a family reunion dinner', ['go trick-or-treating', 'go on an Easter egg hunt', 'fly kites'], ''),
  M('At the Dragon Boat Festival, we ___.', 'watch dragon boat races', ['see Christmas lights', 'build a snowman', 'play with lanterns'], ''),
  M('At Christmas, we ___.', 'decorate the Christmas tree', ['watch dragon boat races', 'eat mooncakes', 'go on an Easter egg hunt'], ''),
  M('At Easter, we ___.', 'go on an Easter egg hunt', ['have a reunion dinner', 'carve mooncakes', 'go sledding'], ''),
  M('Choose the full sentence.', 'The air is very fresh.', ['So fresh.', 'Very fresh air.', 'Fresh.'], 'Always write full sentences in your article.'),
  M('Choose the best reason: I like autumn because ___.', 'the weather is cool and the air is fresh', ['it is a season', 'autumn', 'I wear'], ''),
  M('I feel ___ when this season is here!', 'excited', ['exciting', 'excite', 'to excite'], 'I feel excited. (The season is exciting.)'),
  M('During autumn, we ___ the Mid-Autumn Festival.', 'celebrate', ['celebrates', 'celebrating', 'celebrated'], ''),
  O('Put the words in order.', ['My', 'favourite', 'season', 'is', 'autumn.'], ''),
  O('Put the words in order.', ['In', 'winter,', 'it', 'is', 'cold.'], ''),
  O('Put the words in order.', ['We', 'usually', 'wear', 'sweaters', 'and', 'trousers.'], ''),
  O('Put the words in order.', ['I', 'feel', 'excited', 'when', 'this', 'season', 'is', 'here!'], ''),
];
const W4FIX = [
  F('My favourite season are autumn.', 3, 'is', 'My favourite season IS autumn.'),
  F('We celebrate the Mid-Autumn Festival in autum.', 6, 'autumn.', 'Spelling: a-u-t-u-m-n.'),
  F('I like summer becaus I can swim in the sea.', 3, 'because', 'Spelling: b-e-c-a-u-s-e.'),
  F('We usually wear sweaters and trouser.', 5, 'trousers.', 'Trousers always has -s.'),
  F('I feels happy when this season is here!', 1, 'feel', 'I feel · she feels.'),
  F('It is windy and cool on autumn.', 5, 'in', 'in autumn · in summer · in winter.'),
  F('My friends and I goes hiking.', 4, 'go', 'My friends and I go.'),
  F('We play with lantern at the Mid-Autumn Festival.', 3, 'lanterns', 'More than one: lanterns.'),
  F('At Halloween, we go trick-or-treating and wear costume.', 7, 'costumes.', 'More than one: costumes.'),
  F('In winter, it is hot and I build a snowman.', 4, 'cold', 'Winter is cold.'),
  F('i like spring because the flowers are beautiful.', 0, 'I', 'Always write a capital I.'),
  F('In summer, I go swim in the sea.', 4, 'swimming', 'go swimming · or: I swim in the sea.'),
];
const W5Q = [
  M('"Home is Where the Heart is": Why is the boy leaving?', 'He has to study abroad.', ['He has to travel.', 'He has to work.', 'He wants to buy food.'], ''),
  M('How does the boy feel when he leaves?', 'He feels sad.', ['He feels excited.', 'He feels angry.', 'He feels bored.'], ''),
  M('Who does the boy miss?', 'He misses his family.', ['He misses his teacher.', 'He misses his dog.', 'He misses the ship.'], ''),
  MU('What challenges does he face? Choose ALL.', ['He has to do everything by himself.', 'He is not used to the weather.', 'He is not used to the food.'], ['He has lots of friends.'], 'These are his difficulties.'),
  M('"He cannot blend into the new environment." This means…', 'He does not feel part of the new place.', ['He loves the new place.', 'He can make juice.', 'He likes the weather.'], ''),
  M('In the story, the dark sky and pouring rain show…', 'the sadness and worries', ['the love from the family', 'the loneliness', 'the difficulties the man faces'], ''),
  M('In the story, the big waves show…', 'the difficulties the man faces', ['the love from the family', 'the sadness and worries', 'the loneliness'], ''),
  M('In the story, the snowy weather shows…', 'the loneliness', ['the love from the family', 'the difficulties the man faces', 'the sadness and worries'], ''),
  M('In the story, the soup made by the young man\'s mum shows…', 'the love from the family', ['the loneliness', 'the difficulties the man faces', 'the sadness and worries'], ''),
  M('Our home is always the special place we ___ the most.', 'love', ['hate', 'leave', 'forget'], ''),
  M('When we face difficulties, our family members ___ us.', 'support and encourage', ['laugh at', 'forget', 'leave'], ''),
];
