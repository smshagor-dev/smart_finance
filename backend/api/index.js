import { handleBackendRequest } from "../lib/vercel-handler.js";

export default {
  async fetch(request) {
    return handleBackendRequest(request);
  },
};
