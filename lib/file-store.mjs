// File storage for photos and customer design files, backed by Workers KV.
//
// Exposes the small subset of the R2 bucket API the shop uses (put, get, head,
// delete with a content type), so the store can move back to R2 later by
// swapping this adapter for the R2 binding.
//
// KV free-plan limits: 25 MiB per file, 1 GB total, 1,000 writes per day.

export function fileStore(kv) {
  if (!kv) return undefined;
  return {
    async put(key, bytes, options = {}) {
      const contentType = options.httpMetadata?.contentType || 'application/octet-stream';
      await kv.put(key, bytes, { metadata: { contentType } });
    },
    async get(key) {
      const { value, metadata } = await kv.getWithMetadata(key, { type: 'arrayBuffer' });
      if (value === null) return null;
      const httpMetadata = { contentType: metadata?.contentType };
      return { body: value, httpMetadata, arrayBuffer: async () => value };
    },
    async head(key) {
      const { value, metadata } = await kv.getWithMetadata(key, { type: 'stream' });
      if (value === null) return null;
      await value.cancel();
      return { httpMetadata: { contentType: metadata?.contentType } };
    },
    async delete(key) {
      await kv.delete(key);
    },
  };
}
