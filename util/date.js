export const durationSince = (timeMS) => {
  const now = Date.now();

  const durationMS = now - timeMS;
  const durationMIN = Math.round(durationMS / 1000 / 60);
  const durationHR = Math.round(durationMIN / 60);

  return { hr: durationHR, min: durationMIN % 60 };
};
