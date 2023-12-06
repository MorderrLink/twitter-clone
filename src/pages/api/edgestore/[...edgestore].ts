import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/pages';

const es = initEdgeStore.create();

const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket({
    maxSize: 1024 * 1024 * 10, // 10MB
    accept: ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/mov"]
  })
  .beforeDelete(({ ctx, fileInfo }) => {
    console.log('beforeDelete', ctx, fileInfo);
    return true; // allow delete
  }),
});

export default createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});



export type EdgeStoreRouter = typeof edgeStoreRouter;