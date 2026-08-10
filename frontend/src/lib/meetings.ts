// Meet link generator (mock).
export const newMeetLink = () => {
  const part = () => Math.random().toString(36).slice(2, 6);
  return `https://meet.google.com/${part()}-${part()}-${part()}`;
};
