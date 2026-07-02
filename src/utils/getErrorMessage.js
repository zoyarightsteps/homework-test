export function getErrorMessage(err) {
  const data = err?.response?.data;
  if (data?.errors?.length) {
    return data.errors.map((e) => `${e.field}: ${e.message}`).join('; ');
  }
  return data?.message || err?.message || 'Something went wrong';
}
