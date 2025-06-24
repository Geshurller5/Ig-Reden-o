export const slugify = (text) => {
  if (!text) return '';
  text = text.toString().toLowerCase().trim();

  const from = "ãàáâäẽèéëêìíïîõòóöôùúüûñç·/_,:;";
  const to   = "aaaaaeeeeeiiiiooooouuuunc------";
  for (let i = 0; i < from.length; i++) {
    text = text.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  return text
    .replace(/ & /g, '-and-')
    .replace(/\s+/g, '-') 
    .replace(/[^\w\-]+/g, '') 
    .replace(/\-\-+/g, '-') 
    .replace(/^-+/, '') 
    .replace(/-+$/, ''); 
};