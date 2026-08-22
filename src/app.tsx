import { lazy, Suspense } from 'react';

const Canvas = lazy(() => import('./Canva'));

function App() {
  return (
    <main className="digital-twin-root">
      <Suspense
        fallback={
          <div className="digital-twin-loading" role="status" aria-live="polite">
            场景加载中…
          </div>
        }
      >
        <Canvas />
      </Suspense>
    </main>
  );
}

export default App;
