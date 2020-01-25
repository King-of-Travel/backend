function generateJsonToHTML(block) {
  switch (block.type) {
    case 'paragraph':
      return `
      <div class="block">
        <p>${block.data.text}</p>
      </div>`;
    case 'header':
      return `
      <div class="block">
        <h${block.data.level}>
          ${block.data.text}
        </h${block.data.level}>
      </div>`;
    case 'table':
      return `
        <div class="block">
          <div class="table-wrap">
            <table>
              <tbody>
                ${block.data.content
                  .map(
                    tr => `
                    <tr>
                      ${tr
                        .map(
                          td => `
                            <td>${td}</td>`
                        )
                        .join('')}
                    </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>`;
    case 'list':
      return `
        <div class="block">
          <${block.data.style === 'ordered' ? 'ol' : 'ul'}>
            ${block.data.items.map(item => `<li>${item}</li>`).join('')}
          </${block.data.style === 'ordered' ? 'ol' : 'ul'}>
        </div>`;
    default:
      break;
  }
}

module.exports = { generateJsonToHTML };
