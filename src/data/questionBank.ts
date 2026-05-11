export interface BankQuestion {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correct: number;
}

export const QUESTION_BANK: BankQuestion[] = [
  // ── JavaScript ──────────────────────────────────────────────────────────
  {
    id: 'js_01',
    subject: 'JavaScript',
    question: 'What does `typeof null` return in JavaScript?',
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correct: 2,
  },
  {
    id: 'js_02',
    subject: 'JavaScript',
    question: 'Which method removes and returns the last element of an array?',
    options: ['shift()', 'pop()', 'splice()', 'slice()'],
    correct: 1,
  },
  {
    id: 'js_03',
    subject: 'JavaScript',
    question: 'What is the output of `0.1 + 0.2 === 0.3` in JavaScript?',
    options: ['true', 'false', 'undefined', 'NaN'],
    correct: 1,
  },
  {
    id: 'js_04',
    subject: 'JavaScript',
    question: 'What keyword creates a block-scoped variable that cannot be reassigned?',
    options: ['var', 'let', 'const', 'static'],
    correct: 2,
  },
  {
    id: 'js_05',
    subject: 'JavaScript',
    question: 'Which of these is NOT a falsy value in JavaScript?',
    options: ['0', '""', '[]', 'null'],
    correct: 2,
  },
  {
    id: 'js_06',
    subject: 'JavaScript',
    question: 'What does the `spread` operator (`...`) do?',
    options: [
      'Deletes array elements',
      'Expands an iterable into individual elements',
      'Creates a deep clone of an object',
      'Converts a string to an array',
    ],
    correct: 1,
  },
  {
    id: 'js_07',
    subject: 'JavaScript',
    question: 'What is a closure in JavaScript?',
    options: [
      'A function with no return value',
      'A function that retains access to its outer scope after it returns',
      'A way to close the browser window',
      'An IIFE that runs once',
    ],
    correct: 1,
  },
  {
    id: 'js_08',
    subject: 'JavaScript',
    question: 'Which method converts a JSON string into a JavaScript object?',
    options: ['JSON.stringify()', 'JSON.parse()', 'Object.fromJSON()', 'JSON.decode()'],
    correct: 1,
  },
  {
    id: 'js_09',
    subject: 'JavaScript',
    question: 'What does `Array.prototype.map()` return?',
    options: [
      'The original array modified in place',
      'A new array with results of calling a function on every element',
      'A boolean indicating success',
      'An object with key-value pairs',
    ],
    correct: 1,
  },
  {
    id: 'js_10',
    subject: 'JavaScript',
    question: 'What is the purpose of `Promise.all()`?',
    options: [
      'Runs promises sequentially and returns the first result',
      'Runs all promises in parallel and resolves when all settle',
      'Cancels all pending promises',
      'Runs all promises in parallel and resolves when the first succeeds',
    ],
    correct: 1,
  },
  {
    id: 'js_11',
    subject: 'JavaScript',
    question: 'What does `event.preventDefault()` do?',
    options: [
      'Stops the event from firing',
      'Removes the event listener',
      'Prevents the browser\'s default behavior for the event',
      'Prevents bubbling to parent elements',
    ],
    correct: 2,
  },

  // ── React ────────────────────────────────────────────────────────────────
  {
    id: 'react_01',
    subject: 'React',
    question: 'Which hook is used to manage local component state?',
    options: ['useEffect', 'useContext', 'useState', 'useReducer'],
    correct: 2,
  },
  {
    id: 'react_02',
    subject: 'React',
    question: 'What does an empty dependency array `[]` in `useEffect` mean?',
    options: [
      'Effect runs on every render',
      'Effect runs only on mount (once)',
      'Effect runs only on unmount',
      'Effect is disabled',
    ],
    correct: 1,
  },
  {
    id: 'react_03',
    subject: 'React',
    question: 'What is the Virtual DOM?',
    options: [
      'A direct representation of the browser DOM',
      'A lightweight in-memory copy of the real DOM used for diffing',
      'A special browser API for fast rendering',
      'A server-side rendering technique',
    ],
    correct: 1,
  },
  {
    id: 'react_04',
    subject: 'React',
    question: 'Which hook should you use to fetch data when a component mounts?',
    options: ['useState', 'useCallback', 'useEffect', 'useMemo'],
    correct: 2,
  },
  {
    id: 'react_05',
    subject: 'React',
    question: 'What is the purpose of the `key` prop in a list?',
    options: [
      'To style list items',
      'To uniquely identify elements for efficient re-rendering',
      'To sort the list',
      'To pass data to child components',
    ],
    correct: 1,
  },
  {
    id: 'react_06',
    subject: 'React',
    question: 'What does `React.memo` do?',
    options: [
      'Creates a memoized callback function',
      'Memoizes an expensive calculation',
      'Wraps a component to skip re-render if props didn\'t change',
      'Stores data between renders',
    ],
    correct: 2,
  },
  {
    id: 'react_07',
    subject: 'React',
    question: 'What is prop drilling?',
    options: [
      'A performance optimization technique',
      'Passing props through many layers of components to reach a deeply nested child',
      'A way to delete props from components',
      'Using the Context API to share state',
    ],
    correct: 1,
  },
  {
    id: 'react_08',
    subject: 'React',
    question: 'What hook prevents expensive recalculations on every render?',
    options: ['useCallback', 'useMemo', 'useRef', 'useLayoutEffect'],
    correct: 1,
  },
  {
    id: 'react_09',
    subject: 'React',
    question: 'How do you conditionally render a component in JSX?',
    options: [
      'Using an if statement inside JSX tags',
      'Using ternary operator or &&',
      'Using switch/case',
      'Using a for loop',
    ],
    correct: 1,
  },
  {
    id: 'react_10',
    subject: 'React',
    question: 'What is the difference between controlled and uncontrolled inputs?',
    options: [
      'Controlled inputs are faster',
      'Controlled inputs have their value managed by React state; uncontrolled by the DOM',
      'Uncontrolled inputs cannot be submitted in a form',
      'There is no difference',
    ],
    correct: 1,
  },
  {
    id: 'react_11',
    subject: 'React',
    question: 'What does `useRef` return?',
    options: [
      'A state variable that triggers re-renders',
      'A mutable ref object whose `.current` property persists across renders',
      'A cached function reference',
      'A context value',
    ],
    correct: 1,
  },

  // ── Git & GitHub ─────────────────────────────────────────────────────────
  {
    id: 'git_01',
    subject: 'Git & GitHub',
    question: 'What command stages all changes for commit?',
    options: ['git commit -a', 'git add .', 'git push', 'git stage --all'],
    correct: 1,
  },
  {
    id: 'git_02',
    subject: 'Git & GitHub',
    question: 'What does `git rebase` do?',
    options: [
      'Creates a new branch',
      'Merges two branches with a merge commit',
      'Reapplies commits on top of another base branch',
      'Resets the working directory',
    ],
    correct: 2,
  },
  {
    id: 'git_03',
    subject: 'Git & GitHub',
    question: 'Which command undoes the last commit but keeps the changes staged?',
    options: ['git reset --hard HEAD~1', 'git reset --soft HEAD~1', 'git revert HEAD', 'git checkout HEAD~1'],
    correct: 1,
  },
  {
    id: 'git_04',
    subject: 'Git & GitHub',
    question: 'What is a Pull Request (PR)?',
    options: [
      'A request to pull changes from remote to local',
      'A proposal to merge code from one branch into another for review',
      'A command to fetch branches',
      'A way to request repo access',
    ],
    correct: 1,
  },
  {
    id: 'git_05',
    subject: 'Git & GitHub',
    question: 'What does `git stash` do?',
    options: [
      'Permanently deletes uncommitted changes',
      'Saves uncommitted changes temporarily without committing',
      'Creates a new branch from current changes',
      'Pushes changes to a stash branch',
    ],
    correct: 1,
  },
  {
    id: 'git_06',
    subject: 'Git & GitHub',
    question: 'What is the difference between `git fetch` and `git pull`?',
    options: [
      'They are identical commands',
      'fetch downloads changes but doesn\'t merge; pull downloads AND merges',
      'pull is safer than fetch',
      'fetch only works on the main branch',
    ],
    correct: 1,
  },
  {
    id: 'git_07',
    subject: 'Git & GitHub',
    question: 'What does a `.gitignore` file do?',
    options: [
      'Deletes files from the repository',
      'Specifies files/directories that Git should not track',
      'Marks files as read-only',
      'Lists files that must always be committed',
    ],
    correct: 1,
  },
  {
    id: 'git_08',
    subject: 'Git & GitHub',
    question: 'What command shows the commit history?',
    options: ['git status', 'git diff', 'git log', 'git show'],
    correct: 2,
  },
  {
    id: 'git_09',
    subject: 'Git & GitHub',
    question: 'What is a fork on GitHub?',
    options: [
      'A branch within the same repository',
      'A personal copy of someone else\'s repository under your GitHub account',
      'A way to delete a repo',
      'A tag for a specific commit',
    ],
    correct: 1,
  },
  {
    id: 'git_10',
    subject: 'Git & GitHub',
    question: 'What does `git cherry-pick <hash>` do?',
    options: [
      'Deletes a specific commit',
      'Applies a specific commit from another branch to the current branch',
      'Creates a tag on a specific commit',
      'Reverts a specific commit',
    ],
    correct: 1,
  },

  // ── CS Fundamentals ──────────────────────────────────────────────────────
  {
    id: 'cs_01',
    subject: 'CS Fundamentals',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
    correct: 2,
  },
  {
    id: 'cs_02',
    subject: 'CS Fundamentals',
    question: 'Which data structure uses LIFO (Last In, First Out) order?',
    options: ['Queue', 'Stack', 'Linked List', 'Heap'],
    correct: 1,
  },
  {
    id: 'cs_03',
    subject: 'CS Fundamentals',
    question: 'What is a hash collision?',
    options: [
      'When two hashes are identical by design',
      'When two different keys produce the same hash value',
      'When a hash function fails to run',
      'When a dictionary runs out of memory',
    ],
    correct: 1,
  },
  {
    id: 'cs_04',
    subject: 'CS Fundamentals',
    question: 'What does REST stand for?',
    options: [
      'Remote Execution State Transfer',
      'Representational State Transfer',
      'Resource Entity State Technology',
      'Real-time Event Sync Transfer',
    ],
    correct: 1,
  },
  {
    id: 'cs_05',
    subject: 'CS Fundamentals',
    question: 'What is the worst-case time complexity of QuickSort?',
    options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
    correct: 2,
  },
  {
    id: 'cs_06',
    subject: 'CS Fundamentals',
    question: 'What is a race condition?',
    options: [
      'A performance benchmark test',
      'When multiple processes access shared data concurrently and the result depends on timing',
      'A deadlock between two threads',
      'A CPU scheduling algorithm',
    ],
    correct: 1,
  },
  {
    id: 'cs_07',
    subject: 'CS Fundamentals',
    question: 'What HTTP status code means "Not Found"?',
    options: ['200', '401', '500', '404'],
    correct: 3,
  },
  {
    id: 'cs_08',
    subject: 'CS Fundamentals',
    question: 'What is the difference between SQL and NoSQL databases?',
    options: [
      'SQL is faster than NoSQL',
      'SQL uses structured tables with schemas; NoSQL uses flexible document/key-value structures',
      'NoSQL cannot handle large datasets',
      'SQL databases cannot be scaled horizontally',
    ],
    correct: 1,
  },
  {
    id: 'cs_09',
    subject: 'CS Fundamentals',
    question: 'What does "idempotent" mean in the context of HTTP methods?',
    options: [
      'The request always returns 200 OK',
      'Making the same request multiple times produces the same result',
      'The request cannot be cached',
      'The request modifies state exactly once',
    ],
    correct: 1,
  },
  {
    id: 'cs_10',
    subject: 'CS Fundamentals',
    question: 'Which sorting algorithm has O(n log n) best AND worst case time complexity?',
    options: ['QuickSort', 'BubbleSort', 'MergeSort', 'InsertionSort'],
    correct: 2,
  },
  {
    id: 'cs_11',
    subject: 'CS Fundamentals',
    question: 'What is Big O notation used for?',
    options: [
      'Measuring exact execution time in seconds',
      'Describing the upper-bound growth rate of an algorithm\'s time/space complexity',
      'Counting the number of lines of code',
      'Measuring network latency',
    ],
    correct: 1,
  },
];

/** Shuffle an array using Fisher–Yates */
export const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Pick `count` unique questions not in the excluded IDs list */
export const pickUniqueQuestions = (
  excludedIds: string[],
  count: number
): BankQuestion[] => {
  const pool = QUESTION_BANK.filter(q => !excludedIds.includes(q.id));
  return shuffle(pool).slice(0, count);
};
