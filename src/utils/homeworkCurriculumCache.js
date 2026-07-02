const keyFor = (homeworkId) => `hw_curriculum:${homeworkId}`;

const saveHomeworkCurriculum = (homeworkId, { yearGroupId, subjectId, topicId }) => {
  try {
    localStorage.setItem(keyFor(homeworkId), JSON.stringify({ yearGroupId, subjectId, topicId }));
  } catch {}
};

const getHomeworkCurriculum = (homeworkId) => {
  try {
    const raw = localStorage.getItem(keyFor(homeworkId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export { saveHomeworkCurriculum, getHomeworkCurriculum };
