export const emitOrderUpdated = (req, payload) => {
  try {
    req?.app?.locals?.io?.emit('order:updated', payload);
  } catch {
    // Socket delivery is best-effort
  }
};
