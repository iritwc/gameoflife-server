const e = require("express");

const toKey = (x, y) => `${x},${y}`;
const fromKey = (key) => key.split(",").map((s) => parseInt(s));

const next2 = (state, n, m) => {
  const stateSet = new Set();
  let [minx, maxx, miny, maxy] = [n, 0, m, 0];

  state.forEach((pos) => {
    const [x, y] = pos;

    stateSet.add(toKey(x, y));

    if (x < minx) {
      minx = x;
    }
    if (x > maxx) {
      maxx = x;
    }
    if (y < miny) {
      miny = y;
    }
    if (y > maxy) {
      maxy = y;
    }
  });

  [minx, maxx, miny, maxy] = [
    Math.max(0, minx - 1),
    Math.min(n, maxx + 1),
    Math.max(0, miny - 1),
    Math.min(m, maxy + 1),
  ];

  const getAdjacents = (state, x, y) => {
    let num = 0;
    const [minx, maxx, miny, maxy] = [
      Math.max(0, x - 1),
      Math.min(x + 2, n),
      Math.max(0, y - 1),
      Math.min(y + 2, m),
    ];
    for (let i = minx; i < maxx; i++) {
      for (let j = miny; j < maxy; j++) {
        if (i !== x || j !== y) {
          if (state.has(toKey(i, j))) {
            num++;
          }
        }
      }
    }
    return num;
  };

  const nextState = [];
  for (let i = minx; i <= maxx; i++) {
    for (let j = miny; j <= maxy; j++) {
      const key = toKey(i, j);
      const num = getAdjacents(stateSet, i, j);
      if (stateSet.has(key)) {
        // 1
        if (num === 2 || num === 3) {
          nextState.push([i, j]);
        }
      } else {
        // 0
        if (num === 3) {
          nextState.push([i, j]);
        }
      }
    }
  }
  return nextState;
};

const next_bfs = (state, n, m) => {
  const stateSet = new Set();
  state.forEach((pos) => {
    const [x, y] = pos;
    stateSet.add(toKey(x, y));
  });
  const nextState = new Set();

  const getAdjacents = (x, y) => {
    let adj = { alive: [], dead: [] };
    const [minx, maxx, miny, maxy] = [
      Math.max(0, x - 1),
      Math.min(x + 2, n),
      Math.max(0, y - 1),
      Math.min(y + 2, m),
    ];
    for (let i = minx; i < maxx; i++) {
      for (let j = miny; j < maxy; j++) {
        if (i !== x || j !== y) {
          if (stateSet.has(toKey(i, j))) {
            adj.alive.push([i, j]);
          } else {
            adj.dead.push([i, j]);
          }
        }
      }
    }
    return adj;
  };
  let processed = {};
  let discovered = {};
  const bfs = (start) => {
    const q = [];
    q.push(start);
    discovered[toKey(...start)] = true;

    while (q.length > 0) {
      const v = q.shift();
      const adjs = getAdjacents(...v);
      for (const adj of adjs.alive) {
        if (!discovered[toKey(...adj)]) {
          discovered[toKey(...adj)] = true;
          q.push(adj);
          // process_discovered()
        }
      }
      // process_processed
      const num = adjs.alive.length;
      if (num === 2 || num === 3) {
        nextState.add(toKey(...v));
      }
      adjs.dead.forEach((d) => {
        if (!processed[toKey(...d)]) {
          processed[toKey(...d)] = true;
          const dAdjs = getAdjacents(...d);
          const num = dAdjs.alive.length;
          if (num === 3) {
            nextState.add(toKey(...d));
          }
        }
      });
      processed[toKey(...v)] = true;
    }
  };

  for (const v of state) {
    const key = toKey(v);
    if (!discovered[key]) {
      bfs(v);
    }
  }

  return [...nextState].map((pos) => fromKey(pos));
};
const next = (state, n, m) => {
  const stateSet = new Set();
  state.forEach((pos) => {
    const [x, y] = pos;
    stateSet.add(toKey(x, y));
  });

  const getAdjacents = (state, x, y) => {
    let num = 0;
    let adj = [];
    const [minx, maxx, miny, maxy] = [
      Math.max(0, x - 1),
      Math.min(x + 2, n),
      Math.max(0, y - 1),
      Math.min(y + 2, m),
    ];
    for (let i = minx; i < maxx; i++) {
      for (let j = miny; j < maxy; j++) {
        if (i !== x || j !== y) {
          if (state.has(toKey(i, j))) {
            num++;
          } else {
            adj.push([i, j]);
          }
        }
      }
    }
    return { num, adj };
  };

  const nextState = new Set();
  for (let i = 0; i < state.length; i++) {
    const pos = state[i];
    const { num, adj } = getAdjacents(stateSet, ...pos);
    if (num === 2 || num === 3) {
      nextState.add(toKey(...pos));
    }
    adj.forEach((empty) => {
      const { num } = getAdjacents(stateSet, ...empty);
      if (num === 3) {
        nextState.add(toKey(...empty));
      }
    });
  }
  return [...nextState].map((pos) => fromKey(pos));
};

const generateDecathlon = (isFull = false) => {
  const state = [];
  [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((i) =>
    [0,1,2].forEach((j) => state.push([i, j]))
  );
  if (isFull) {
    return state;
  }
  return state.filter(([i, j]) => (i !== 1 || j !== 1) && (i !== 7 || j !== 1));
};
const generatePulsar = () => {
  const pulsar = [];
  [2, 3, 4, 8, 9, 10].forEach((i) => {
    [0, 5, 7, 12].forEach((j) => {
      pulsar.push([i, j]);
      pulsar.push([j, i]);
    });
  });
  return pulsar;
};

const InitialState = {
  blinker: { state: [
    [0, 0],
    [1, 0],
    [2, 0],
  ], w: 1, h: 3},
  block: { state: [
    [0, 0],
    [0, 1],
    [1, 0],
  ], h: 2, w: 2},
  beehive:  { state: [
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 3],
    [2, 1],
    [2, 2],
  ],  h: 3, w: 4},
  tube:  { state: [
    [0, 1],
    [1, 0],
    [1, 2],
    [2, 1],
  ],  h: 3, w: 3},
  toad:  { state: [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 0],
    [1, 1],
    [1, 2],
  ],  h: 2, w: 4},
  glider:  { state: [
    [0, 2],
    [1, 2],
    [2, 2],
    [2, 1],
    [1, 0],
  ],  h: 3, w: 3},
  "penta-decathlon-full":  { state: generateDecathlon(true), h: 9, w: 3},
  "penta-decathlon":  { state: generateDecathlon(),  h: 9, w: 3},
  pulsar:  { state: generatePulsar(),  h: 13, w: 13},
};

const get = (N = 10, M = 10, iterations = 50, type) => {
  let {state: nextState, w, h} = InitialState[type];
  const addh = Math.floor((N-h)/2);
  const addw = Math.floor((M-w)/2);
  
  nextState = nextState.map(([i, j]) => [i+addh, j+addw]);
  // const now = () => new Date().getTime();
  const states = [];
  // let total = 0;
  for (let i = 0; i < iterations; i++) {
    // const before = now();
    // console.log(nextState, before);ś
    states.push(nextState); 
    // console.log(nextState)
    nextState = next(nextState, N, M);
    // const after = now();
    // console.log(nextState, after, after - before);
    // total += after - before;
  }
  // console.log("total seconds=", total);
  return states;
};

module.exports = {
  get
};

let states = get(15, 15, 50, "beehive");
// console.log(states);
