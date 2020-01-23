function generateJsonToHTML(block) {
  switch (block.type) {
    case 'paragraph':
      return `<p>${block.data.text}</p>`;
    case 'header':
      return `<h${block.data.level}>${data.text}</h${block.data.level}>`;

    default:
      break;
  }
}

module.exports = { generateJsonToHTML };
