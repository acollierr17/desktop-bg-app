/* eslint-disable prefer-const */
export function errorParagraph(message: string, id: string): HTMLParagraphElement {
  const paragraph = document.createElement('p');
  const text = document.createTextNode(message);
  paragraph.id = id;
  paragraph.classList.add('help', 'is-danger');
  paragraph.style.textAlign = 'left';
  paragraph.append(text);
  return paragraph;
}

export function successParagraph(message: string, id: string): HTMLParagraphElement {
  const paragraph = document.createElement('p');
  const text = document.createTextNode(message);
  paragraph.id = id;
  paragraph.classList.add('help', 'is-success');
  paragraph.style.textAlign = 'left';
  paragraph.append(text);
  return paragraph;
}

export function successDiv(message: string, divID: string, buttonID: string): HTMLDivElement {
  const div = document.createElement('div');
  const text = document.createTextNode(message);
  const button = document.createElement('button');
  div.id = divID;
  button.id = buttonID;
  div.classList.add('notification', 'is-success', 'is-light');
  button.classList.add('delete');
  div.append(button);
  div.append(text);
  return div;
}

export function errorDiv(message: string, divID: string, buttonID: string): HTMLDivElement {
  const div = document.createElement('div');
  const text = document.createTextNode(message);
  const button = document.createElement('button');
  div.id = divID;
  button.id = buttonID;
  div.classList.add('notification', 'is-danger', 'is-light');
  button.classList.add('delete');
  div.append(button);
  div.append(text);
  return div;
}

export function removeLoading(element: HTMLElement, time = 3000): void {
  setTimeout(() => {
    element.classList.remove('is-loading');
  }, time);
}

export function newFileName(name?: string): string {
  if (name) return name;
  const fileSaveTime = new Date();
  let text = fileSaveTime.toISOString().split('.');
  text = text[0].split('T');

  const date = text[0].replace(/-/gi, '');
  const time = text[1].replace(/:/gi, '');

  return `img-${date}-${time}.png`;
}

export function isValidImageURL(imageURL: string): boolean {
  const re = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
  return re.test(imageURL);
}

export function getBase64Image(imageURL: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.open('GET', imageURL, true);
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');

    xhr.onload = (): void => {
      let base64: string,
        binary: string,
        bytes: Uint8Array,
        mediaType: string;

      bytes = new Uint8Array(xhr.response);
      binary = [].map.call(bytes, (byte: number) => {
        return String.fromCharCode(byte);
      }).join('');
      mediaType = xhr.getResponseHeader('content-type');
      base64 = [
        'data:',
        mediaType ? `${mediaType};` : '',
        'base64,',
        btoa(binary)
      ].join('');
      resolve(base64);
    };

    xhr.onerror = (error): void => {
      reject(error);
    };
    xhr.send();
  });
}

export async function getImageBuffer(imageURL: string, lucky = false): Promise<Buffer> {
  let data;
  if (lucky) data = await getBase64Image(imageURL);
  else data = imageURL.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(data, 'base64');
}
