function generateJsonToHTML({ data, type }) {
  switch (type) {
    case 'paragraph':
      return `
      <div class="block">
        <p>${data.text}</p>
      </div>`;

    case 'header':
      return `
      <div class="block">
        <h${data.level}>
          ${data.text}
        </h${data.level}>
      </div>`;

    case 'table':
      return `
        <div class="block">
          <div class="table-wrap">
            <table>
              <tbody>
                ${data.content
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
          <${data.style === 'ordered' ? 'ol' : 'ul'}>
            ${data.items.map(item => `<li>${item}</li>`).join('')}
          </${data.style === 'ordered' ? 'ol' : 'ul'}>
        </div>`;

    case 'image':
      return `
        <div class="block">
          <img 
            src="${data.file.url}" 
            alt="${data.caption}" 
            class="
              ${data.withBorder ? 'border' : ''} 
              ${data.stretched ? 'stretched' : ''} 
              ${data.withBackground ? 'background' : ''}
            "
            width="${data.stretched ? 870 : ''}"
            loading="lazy"
          />
        </div>
      `;
    default:
      break;
  }
}

module.exports = { generateJsonToHTML };
