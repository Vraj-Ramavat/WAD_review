import { FeaturedRepo } from '../types';

export const FEATURED_REPOS: FeaturedRepo[] = [
  {
    id: 'facebook-react',
    name: 'facebook/react',
    shortName: 'react',
    url: 'https://github.com/facebook/react',
    stars: 224000,
    forks: 45200,
    healthScore: 92,
    riskScore: 18,
    position: [0, 2, -15],
    description: 'The library for web and native user interfaces.',
    folders: [
      {
        id: 'packages-react',
        name: 'packages/react',
        path: 'packages/react',
        totalLoc: 14500,
        aggregateRisk: 0.15,
        orbitalRadius: 10,
        orbitalSpeed: 0.2,
        files: [
          { id: 'f-1', name: 'ReactHooks.js', path: 'packages/react/src/ReactHooks.js', loc: 1200, risk_score: 0.12, top_contributor: 'Dan Abramov', commit_count: 84, folderId: 'packages-react', dependencies: ['f-2', 'f-3'] },
          { id: 'f-2', name: 'ReactElement.js', path: 'packages/react/src/ReactElement.js', loc: 2100, risk_score: 0.22, top_contributor: 'Sebastian Markbåge', commit_count: 142, folderId: 'packages-react', dependencies: ['f-3'] },
          { id: 'f-3', name: 'ReactContext.js', path: 'packages/react/src/ReactContext.js', loc: 850, risk_score: 0.08, top_contributor: 'Andrew Clark', commit_count: 45, folderId: 'packages-react', dependencies: [] },
          { id: 'f-4', name: 'ReactLazy.js', path: 'packages/react/src/ReactLazy.js', loc: 940, risk_score: 0.19, top_contributor: 'Luna R.', commit_count: 32, folderId: 'packages-react', dependencies: ['f-1'] },
        ]
      },
      {
        id: 'packages-reconciler',
        name: 'packages/react-reconciler',
        path: 'packages/react-reconciler',
        totalLoc: 42000,
        aggregateRisk: 0.78,
        orbitalRadius: 18,
        orbitalSpeed: 0.12,
        files: [
          { id: 'f-5', name: 'ReactFiberWorkLoop.js', path: 'packages/react-reconciler/src/ReactFiberWorkLoop.js', loc: 6800, risk_score: 0.88, top_contributor: 'Andrew Clark', commit_count: 420, folderId: 'packages-reconciler', dependencies: ['f-6', 'f-7', 'f-1'] },
          { id: 'f-6', name: 'ReactFiberBeginWork.js', path: 'packages/react-reconciler/src/ReactFiberBeginWork.js', loc: 5400, risk_score: 0.76, top_contributor: 'Sebastian Markbåge', commit_count: 310, folderId: 'packages-reconciler', dependencies: ['f-7'] },
          { id: 'f-7', name: 'ReactFiberCompleteWork.js', path: 'packages/react-reconciler/src/ReactFiberCompleteWork.js', loc: 4900, risk_score: 0.69, top_contributor: 'Dan Abramov', commit_count: 240, folderId: 'packages-reconciler', dependencies: [] },
          { id: 'f-8', name: 'ReactChildFiber.js', path: 'packages/react-reconciler/src/ReactChildFiber.js', loc: 3800, risk_score: 0.61, top_contributor: 'Andrew Clark', commit_count: 180, folderId: 'packages-reconciler', dependencies: ['f-5'] },
        ]
      },
      {
        id: 'packages-dom',
        name: 'packages/react-dom',
        path: 'packages/react-dom',
        totalLoc: 28000,
        aggregateRisk: 0.42,
        orbitalRadius: 26,
        orbitalSpeed: 0.08,
        files: [
          { id: 'f-9', name: 'ReactDOMRoot.js', path: 'packages/react-dom/src/client/ReactDOMRoot.js', loc: 1800, risk_score: 0.35, top_contributor: 'Sebastian Markbåge', commit_count: 95, folderId: 'packages-dom', dependencies: ['f-5'] },
          { id: 'f-10', name: 'ReactDOMComponent.js', path: 'packages/react-dom/src/client/ReactDOMComponent.js', loc: 4100, risk_score: 0.48, top_contributor: 'Dan Abramov', commit_count: 160, folderId: 'packages-dom', dependencies: ['f-9'] },
          { id: 'f-11', name: 'ReactDOMEventHandle.js', path: 'packages/react-dom/src/client/ReactDOMEventHandle.js', loc: 2300, risk_score: 0.41, top_contributor: 'Andrew Clark', commit_count: 88, folderId: 'packages-dom', dependencies: [] },
        ]
      },
      {
        id: 'packages-scheduler',
        name: 'packages/scheduler',
        path: 'packages/scheduler',
        totalLoc: 9500,
        aggregateRisk: 0.31,
        orbitalRadius: 34,
        orbitalSpeed: 0.05,
        files: [
          { id: 'f-12', name: 'Scheduler.js', path: 'packages/scheduler/src/Scheduler.js', loc: 1400, risk_score: 0.38, top_contributor: 'Andrew Clark', commit_count: 110, folderId: 'packages-scheduler', dependencies: ['f-5'] },
          { id: 'f-13', name: 'SchedulerMinHeap.js', path: 'packages/scheduler/src/SchedulerMinHeap.js', loc: 600, risk_score: 0.21, top_contributor: 'Sebastian Markbåge', commit_count: 42, folderId: 'packages-scheduler', dependencies: [] },
        ]
      }
    ],
    commits: [
      { id: 'c-1', hash: 'e92f81a', author: 'Andrew Clark', date: '2026-07-28', message: 'Optimize Fiber work loop priority scheduling', type: 'feature', affectedFileIds: ['f-5', 'f-12'] },
      { id: 'c-2', hash: '8a3b11c', author: 'Sebastian Markbåge', date: '2026-07-29', message: 'Fix race condition in concurrent mode hydration', type: 'bugfix', affectedFileIds: ['f-6', 'f-9'] },
      { id: 'c-3', hash: '4f7729d', author: 'Dan Abramov', date: '2026-07-30', message: 'Refactor custom hook context subscription', type: 'refactor', affectedFileIds: ['f-1', 'f-3'] },
      { id: 'c-4', hash: '1b89ef2', author: 'Luna R.', date: '2026-08-01', message: 'Update ReactLazy docs and fallback types', type: 'docs', affectedFileIds: ['f-4'] },
      { id: 'c-5', hash: '9c5510f', author: 'Andrew Clark', date: '2026-08-03', message: 'Add benchmark telemetry for reconciler completeWork', type: 'chore', affectedFileIds: ['f-7'] },
    ],
    contributors: [
      { name: 'Andrew Clark', commitsCount: 1420, linesAdded: 84000, linesDeleted: 32000, color: '#E8A33D' },
      { name: 'Sebastian Markbåge', commitsCount: 1210, linesAdded: 76000, linesDeleted: 29000, color: '#C4573B' },
      { name: 'Dan Abramov', commitsCount: 980, linesAdded: 62000, linesDeleted: 24000, color: '#4C7A9E' },
      { name: 'Luna R.', commitsCount: 310, linesAdded: 15000, linesDeleted: 4000, color: '#B08D57' },
    ],
    metrics: { precision: 0.94, recall: 0.89, f1Score: 0.91, accuracy: 0.93 }
  },

  {
    id: 'vercel-nextjs',
    name: 'vercel/next.js',
    shortName: 'next.js',
    url: 'https://github.com/vercel/next.js',
    stars: 122000,
    forks: 26100,
    healthScore: 88,
    riskScore: 24,
    position: [-22, 5, -28],
    description: 'The React Framework for the Web.',
    folders: [
      {
        id: 'packages-next',
        name: 'packages/next',
        path: 'packages/next',
        totalLoc: 38000,
        aggregateRisk: 0.45,
        orbitalRadius: 12,
        orbitalSpeed: 0.18,
        files: [
          { id: 'f-21', name: 'app-render.tsx', path: 'packages/next/src/server/app-render/app-render.tsx', loc: 4200, risk_score: 0.65, top_contributor: 'Tim Neutkens', commit_count: 210, folderId: 'packages-next', dependencies: ['f-22', 'f-23'] },
          { id: 'f-22', name: 'router-store.ts', path: 'packages/next/src/client/components/router-store.ts', loc: 2900, risk_score: 0.52, top_contributor: 'Shu Ding', commit_count: 180, folderId: 'packages-next', dependencies: [] },
          { id: 'f-23', name: 'image-component.tsx', path: 'packages/next/src/client/image-component.tsx', loc: 1900, risk_score: 0.28, top_contributor: 'JJ Kasper', commit_count: 140, folderId: 'packages-next', dependencies: [] },
        ]
      },
      {
        id: 'packages-font',
        name: 'packages/font',
        path: 'packages/font',
        totalLoc: 8200,
        aggregateRisk: 0.18,
        orbitalRadius: 20,
        orbitalSpeed: 0.1,
        files: [
          { id: 'f-24', name: 'google-font.ts', path: 'packages/font/src/google/font.ts', loc: 1100, risk_score: 0.15, top_contributor: 'Tim Neutkens', commit_count: 65, folderId: 'packages-font', dependencies: [] },
        ]
      }
    ],
    commits: [
      { id: 'c-21', hash: '7f91a22', author: 'Tim Neutkens', date: '2026-07-29', message: 'Enhance App Router streaming response buffering', type: 'feature', affectedFileIds: ['f-21'] },
      { id: 'c-22', hash: '3c19b01', author: 'Shu Ding', date: '2026-07-31', message: 'Fix soft navigation state persistence bug', type: 'bugfix', affectedFileIds: ['f-22'] },
    ],
    contributors: [
      { name: 'Tim Neutkens', commitsCount: 1850, linesAdded: 110000, linesDeleted: 45000, color: '#E8A33D' },
      { name: 'Shu Ding', commitsCount: 940, linesAdded: 54000, linesDeleted: 21000, color: '#4C7A9E' },
      { name: 'JJ Kasper', commitsCount: 820, linesAdded: 49000, linesDeleted: 18000, color: '#C4573B' },
    ],
    metrics: { precision: 0.91, recall: 0.86, f1Score: 0.88, accuracy: 0.90 }
  },

  {
    id: 'mrdoob-threejs',
    name: 'mrdoob/three.js',
    shortName: 'three.js',
    url: 'https://github.com/mrdoob/three.js',
    stars: 101000,
    forks: 34800,
    healthScore: 95,
    riskScore: 12,
    position: [24, -4, -22],
    description: 'JavaScript 3D Library.',
    folders: [
      {
        id: 'src-renderers',
        name: 'src/renderers',
        path: 'src/renderers',
        totalLoc: 24000,
        aggregateRisk: 0.28,
        orbitalRadius: 14,
        orbitalSpeed: 0.15,
        files: [
          { id: 'f-31', name: 'WebGLRenderer.js', path: 'src/renderers/WebGLRenderer.js', loc: 5400, risk_score: 0.42, top_contributor: 'mrdoob', commit_count: 620, folderId: 'src-renderers', dependencies: ['f-32'] },
          { id: 'f-32', name: 'WebGLShaders.js', path: 'src/renderers/webgl/WebGLShaders.js', loc: 3100, risk_score: 0.29, top_contributor: 'mrdoob', commit_count: 290, folderId: 'src-renderers', dependencies: [] },
        ]
      },
      {
        id: 'src-cameras',
        name: 'src/cameras',
        path: 'src/cameras',
        totalLoc: 6500,
        aggregateRisk: 0.11,
        orbitalRadius: 22,
        orbitalSpeed: 0.09,
        files: [
          { id: 'f-33', name: 'PerspectiveCamera.js', path: 'src/cameras/PerspectiveCamera.js', loc: 850, risk_score: 0.09, top_contributor: 'mrdoob', commit_count: 110, folderId: 'src-cameras', dependencies: [] },
        ]
      }
    ],
    commits: [
      { id: 'c-31', hash: '2a11b90', author: 'mrdoob', date: '2026-07-30', message: 'WebGPU renderer shadow map optimizations', type: 'feature', affectedFileIds: ['f-31'] },
    ],
    contributors: [
      { name: 'mrdoob', commitsCount: 4200, linesAdded: 280000, linesDeleted: 110000, color: '#E8A33D' },
    ],
    metrics: { precision: 0.96, recall: 0.92, f1Score: 0.94, accuracy: 0.95 }
  },

  {
    id: 'microsoft-vscode',
    name: 'microsoft/vscode',
    shortName: 'vscode',
    url: 'https://github.com/microsoft/vscode',
    stars: 159000,
    forks: 31200,
    healthScore: 91,
    riskScore: 19,
    position: [-14, -12, -35],
    description: 'Visual Studio Code editor codebase.',
    folders: [
      {
        id: 'src-vs-editor',
        name: 'src/vs/editor',
        path: 'src/vs/editor',
        totalLoc: 65000,
        aggregateRisk: 0.38,
        orbitalRadius: 16,
        orbitalSpeed: 0.14,
        files: [
          { id: 'f-41', name: 'codeEditorWidget.ts', path: 'src/vs/editor/browser/widget/codeEditorWidget.ts', loc: 4800, risk_score: 0.51, top_contributor: 'Alex Dima', commit_count: 340, folderId: 'src-vs-editor', dependencies: ['f-42'] },
          { id: 'f-42', name: 'textModel.ts', path: 'src/vs/editor/common/model/textModel.ts', loc: 6200, risk_score: 0.44, top_contributor: 'Alex Dima', commit_count: 410, folderId: 'src-vs-editor', dependencies: [] },
        ]
      }
    ],
    commits: [
      { id: 'c-41', hash: '5e71a09', author: 'Alex Dima', date: '2026-08-01', message: 'Improve word wrapping algorithm performance for large documents', type: 'feature', affectedFileIds: ['f-41', 'f-42'] },
    ],
    contributors: [
      { name: 'Alex Dima', commitsCount: 2900, linesAdded: 190000, linesDeleted: 85000, color: '#4C7A9E' },
    ],
    metrics: { precision: 0.93, recall: 0.90, f1Score: 0.91, accuracy: 0.92 }
  },

  {
    id: 'tensorflow-tensorflow',
    name: 'tensorflow/tensorflow',
    shortName: 'tensorflow',
    url: 'https://github.com/tensorflow/tensorflow',
    stars: 183000,
    forks: 89000,
    healthScore: 86,
    riskScore: 29,
    position: [18, 14, -32],
    description: 'An Open Source Machine Learning Framework.',
    folders: [
      {
        id: 'tensorflow-core',
        name: 'tensorflow/core',
        path: 'tensorflow/core',
        totalLoc: 88000,
        aggregateRisk: 0.62,
        orbitalRadius: 18,
        orbitalSpeed: 0.11,
        files: [
          { id: 'f-51', name: 'graph.cc', path: 'tensorflow/core/graph/graph.cc', loc: 7200, risk_score: 0.71, top_contributor: 'Jeff Dean', commit_count: 510, folderId: 'tensorflow-core', dependencies: ['f-52'] },
          { id: 'f-52', name: 'executor.cc', path: 'tensorflow/core/common_runtime/executor.cc', loc: 8100, risk_score: 0.79, top_contributor: 'Sanjay Ghemawat', commit_count: 480, folderId: 'tensorflow-core', dependencies: [] },
        ]
      }
    ],
    commits: [
      { id: 'c-51', hash: '9b33a11', author: 'Jeff Dean', date: '2026-07-27', message: 'XLA auto-clustering compiler pass acceleration', type: 'feature', affectedFileIds: ['f-51', 'f-52'] },
    ],
    contributors: [
      { name: 'Jeff Dean', commitsCount: 1650, linesAdded: 140000, linesDeleted: 60000, color: '#C4573B' },
      { name: 'Sanjay Ghemawat', commitsCount: 1420, linesAdded: 120000, linesDeleted: 52000, color: '#E8A33D' },
    ],
    metrics: { precision: 0.89, recall: 0.84, f1Score: 0.86, accuracy: 0.88 }
  },

  {
    id: 'tailwindlabs-tailwindcss',
    name: 'tailwindlabs/tailwindcss',
    shortName: 'tailwindcss',
    url: 'https://github.com/tailwindlabs/tailwindcss',
    stars: 79000,
    forks: 4100,
    healthScore: 96,
    riskScore: 10,
    position: [-8, 16, -18],
    description: 'A utility-first CSS framework for rapid UI development.',
    folders: [
      {
        id: 'packages-tailwindcss',
        name: 'packages/tailwindcss',
        path: 'packages/tailwindcss',
        totalLoc: 16000,
        aggregateRisk: 0.12,
        orbitalRadius: 10,
        orbitalSpeed: 0.22,
        files: [
          { id: 'f-61', name: 'candidate.ts', path: 'packages/tailwindcss/src/candidate.ts', loc: 1400, risk_score: 0.14, top_contributor: 'Adam Wathan', commit_count: 140, folderId: 'packages-tailwindcss', dependencies: ['f-62'] },
          { id: 'f-62', name: 'design-system.ts', path: 'packages/tailwindcss/src/design-system.ts', loc: 2100, risk_score: 0.11, top_contributor: 'Adam Wathan', commit_count: 190, folderId: 'packages-tailwindcss', dependencies: [] },
        ]
      }
    ],
    commits: [
      { id: 'c-61', hash: '1a90c44', author: 'Adam Wathan', date: '2026-08-02', message: 'Oxide CSS engine lightning fast candidate parser', type: 'feature', affectedFileIds: ['f-61', 'f-62'] },
    ],
    contributors: [
      { name: 'Adam Wathan', commitsCount: 2400, linesAdded: 160000, linesDeleted: 70000, color: '#E8A33D' },
    ],
    metrics: { precision: 0.97, recall: 0.94, f1Score: 0.95, accuracy: 0.96 }
  }
];

// Generator for dynamic custom user-searched repos
export function createDynamicRepo(repoUrl: string): FeaturedRepo {
  const cleanUrl = repoUrl.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
  const parts = cleanUrl.split('/');
  const shortName = parts.length > 1 ? parts[1] : parts[0] || 'custom-repo';
  const name = parts.length > 1 ? `${parts[0]}/${parts[1]}` : `github/${shortName}`;
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

  return {
    id,
    name,
    shortName,
    url: repoUrl.startsWith('http') ? repoUrl : `https://github.com/${name}`,
    stars: Math.floor(Math.random() * 45000) + 5000,
    forks: Math.floor(Math.random() * 8000) + 800,
    healthScore: Math.floor(Math.random() * 25) + 75,
    riskScore: Math.floor(Math.random() * 30) + 10,
    position: [0, 0, -8], // Placed front and center!
    description: `Analyzed repository for ${name}`,
    isSearched: true,
    folders: [
      {
        id: `${id}-core`,
        name: 'src/core',
        path: 'src/core',
        totalLoc: 18400,
        aggregateRisk: 0.35,
        orbitalRadius: 12,
        orbitalSpeed: 0.18,
        files: [
          { id: `${id}-f1`, name: 'index.ts', path: 'src/core/index.ts', loc: 1600, risk_score: 0.28, top_contributor: 'Lead Contributor', commit_count: 85, folderId: `${id}-core`, dependencies: [`${id}-f2`] },
          { id: `${id}-f2`, name: 'engine.ts', path: 'src/core/engine.ts', loc: 3400, risk_score: 0.48, top_contributor: 'Lead Contributor', commit_count: 140, folderId: `${id}-core`, dependencies: [] },
        ]
      },
      {
        id: `${id}-components`,
        name: 'src/components',
        path: 'src/components',
        totalLoc: 24000,
        aggregateRisk: 0.22,
        orbitalRadius: 20,
        orbitalSpeed: 0.11,
        files: [
          { id: `${id}-f3`, name: 'App.tsx', path: 'src/components/App.tsx', loc: 2100, risk_score: 0.18, top_contributor: 'UI Engineer', commit_count: 92, folderId: `${id}-components`, dependencies: [`${id}-f1`] },
          { id: `${id}-f4`, name: 'Layout.tsx', path: 'src/components/Layout.tsx', loc: 1200, risk_score: 0.14, top_contributor: 'UI Engineer', commit_count: 45, folderId: `${id}-components`, dependencies: [] },
        ]
      },
      {
        id: `${id}-utils`,
        name: 'src/utils',
        path: 'src/utils',
        totalLoc: 7500,
        aggregateRisk: 0.12,
        orbitalRadius: 28,
        orbitalSpeed: 0.07,
        files: [
          { id: `${id}-f5`, name: 'helpers.ts', path: 'src/utils/helpers.ts', loc: 950, risk_score: 0.09, top_contributor: 'DevOps Lead', commit_count: 38, folderId: `${id}-utils`, dependencies: [] },
        ]
      }
    ],
    commits: [
      { id: `${id}-c1`, hash: 'a1b2c3d', author: 'Lead Contributor', date: '2026-08-04', message: 'Initial architecture setup and state synchronization', type: 'feature', affectedFileIds: [`${id}-f1`, `${id}-f2`] },
      { id: `${id}-c2`, hash: 'e4f5g6h', author: 'UI Engineer', date: '2026-08-05', message: 'Fix component mounting lifecycle edge cases', type: 'bugfix', affectedFileIds: [`${id}-f3`] },
    ],
    contributors: [
      { name: 'Lead Contributor', commitsCount: 450, linesAdded: 32000, linesDeleted: 12000, color: '#E8A33D' },
      { name: 'UI Engineer', commitsCount: 280, linesAdded: 19000, linesDeleted: 7000, color: '#4C7A9E' },
      { name: 'DevOps Lead', commitsCount: 140, linesAdded: 8000, linesDeleted: 2000, color: '#B08D57' },
    ],
    metrics: { precision: 0.92, recall: 0.88, f1Score: 0.90, accuracy: 0.91 }
  };
}
