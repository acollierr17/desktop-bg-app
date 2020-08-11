import { writeFile } from 'fs';
import { remote } from 'electron';
import wallpaper from 'wallpaper';
import path from 'path';
import os from 'os';
import * as functions from '../functions';

const mainSection = document.getElementById('mainSection') as HTMLElement;
const importBackground = document.getElementById('importBg') as HTMLButtonElement;
const setBackground = document.getElementById('setBg') as HTMLButtonElement;
const feelingLucky = document.getElementById('luckyBg') as HTMLButtonElement;
const linkInput = document.getElementById('bgLink') as HTMLInputElement;
const importedBackground = document.getElementById('importedBg') as HTMLImageElement;
const linkInputDiv = document.getElementById('linkInput') as HTMLDivElement;

const randomUnsplashImage = 'https://source.unsplash.com/random/1920x1080';

let isImported = false;
let isLucky = false;

const success = functions.successParagraph('Successfully imported the image.', 'inputSuccess');
const validURL = functions.successParagraph('This is a valid image url.', 'validURL');

const noImport = functions.errorParagraph('Please import an image before proceeding.', 'noImport');
const error = functions.errorParagraph('Invalid link (valid image format examples: .jpg or .png)', 'inputError');

const successNotif = functions.successDiv('Successfully set the image as your desktop background.', 'successNotif', 'successNotifClose');
const clearImportSuccess = functions.successDiv('Successfully cleared the current imported desktop background.', 'clearImportSuccess', 'clearImportSuccessClose');


linkInput.onchange = e => {
  const evtTarget = e.target as HTMLInputElement;
  const imageURL = evtTarget.value;
  const isURLValid = functions.isValidImageURL(imageURL);

  if (!imageURL || imageURL.length < 1) {
    evtTarget.classList.remove('is-danger');
    evtTarget.classList.remove('is-success');
    if (linkInputDiv.querySelectorAll(`#${error.id}`).length >= 1) linkInputDiv.querySelectorAll(`#${error.id}`)
      .forEach(node => node.remove());
    if (linkInputDiv.querySelectorAll(`#${success.id}`).length >= 1) linkInputDiv.querySelectorAll(`#${success.id}`)
      .forEach(node => node.remove());
    if (linkInputDiv.querySelectorAll(`#${validURL.id}`).length >= 1) linkInputDiv.querySelectorAll(`#${validURL.id}`)
      .forEach(node => node.remove());

    importBackground.disabled = true;
    setBackground.disabled = true;
    return;
  }
  
  if (isURLValid) {
    evtTarget.classList.add('is-success');
    evtTarget.classList.remove('is-danger');
    evtTarget.parentNode.append(validURL);
    
    if (linkInputDiv.querySelectorAll(`#${error.id}`).length >= 1) linkInputDiv.querySelectorAll(`#${error.id}`)
      .forEach(node => node.remove());
    
    importBackground.disabled = false;
    setBackground.disabled = false;
  } else {
    evtTarget.classList.remove('is-success');
    evtTarget.classList.add('is-danger');
    evtTarget.parentNode.append(error);

    if (linkInputDiv.querySelectorAll(`#${success.id}`).length >= 1) linkInputDiv.querySelectorAll(`#${success.id}`)
      .forEach(node => node.remove());
    if (linkInputDiv.querySelectorAll(`#${validURL.id}`).length >= 1) linkInputDiv.querySelectorAll(`#${validURL.id}`)
      .forEach(node => node.remove());

    importBackground.disabled = true;
    setBackground.disabled = true;
  }

  if (!isImported) setBackground.disabled = true;
};

linkInput.onmouseenter = e => {
  const evtTarget = e.target as HTMLButtonElement;
  // if (!evtTarget.classList.contains('is-success')) evtTarget.classList.add('is-info');
  evtTarget.classList.add('is-focused');
};

linkInput.onmouseleave = e => {
  const evtTarget = e.target as HTMLButtonElement;
  // if (evtTarget.classList.contains('is-info')) evtTarget.classList.remove('is-info');
  evtTarget.classList.remove('is-focused');
};

importBackground.onclick = async () => {
  if (isImported) {
    importBackground.textContent = 'Import';
    importBackground.classList.remove('is-danger');
    importBackground.classList.add('is-success');
    importedBackground.removeAttribute('src');
    importedBackground.removeAttribute('style');
    mainSection.insertBefore(clearImportSuccess, importedBackground)
    isImported = false;
    linkInput.classList.remove('is-success');
    if (document.getElementById(success.id)) linkInputDiv.removeChild(success);
    linkInput.value = '';
    linkInput.disabled = false;
    linkInput.readOnly = false;
    setBackground.disabled = true;
    importBackground.disabled = true;
    return;
  }

  const imageURL = linkInput.value;
  const isURLValid = functions.isValidImageURL(imageURL);
  if (!isURLValid || !imageURL) {
    importBackground.disabled = true;
    return;
  } else {
    importBackground.disabled = false;
  }

  try {
    const imageURL = linkInput.value;
    importBackground.classList.add('is-loading');
    importBackground.disabled = true;
    linkInput.disabled = true;
    const base64Image = await functions.getBase64Image(imageURL);
    importBackground.classList.remove('is-loading');
    linkInput.disabled = false;

    importedBackground.src = base64Image;
    linkInput.parentNode.append(success);
    isImported = true;

    if (isImported && document.getElementById(noImport.id)) {
      document.getElementById(noImport.id).remove();
      if (linkInput.classList.contains('is-danger')) linkInput.classList.remove('is-danger');
    }
    if (linkInput.parentNode.contains(validURL)) linkInput.parentNode.append(validURL);
    
    if (isImported && setBackground.disabled) setBackground.disabled = false;
    if (isImported && importBackground.disabled) importBackground.disabled = false;
    if (linkInputDiv.querySelectorAll(`#${validURL.id}`).length >= 1) linkInputDiv.querySelectorAll(`#${validURL.id}`)
      .forEach(node => node.remove());

    importBackground.textContent = 'Clear';
    importBackground.classList.remove('is-success');
    importBackground.classList.add('is-danger');
  } catch (error) {
    console.error(error);
    if (document.querySelectorAll('#errorImport').length >= 1) document.querySelectorAll('#errorImport')
      .forEach(node => node.remove());
    isImported = false;
    importedBackground.src = '';
    const errorImport = functions.errorDiv(`An error has occurred importing the background: ${error.message}`, 'errorImport', 'errorImportClose');
    mainSection.insertBefore(errorImport, importedBackground);
    linkInput.classList.remove('is-success');
    linkInput.classList.add('is-danger');
    if (document.getElementById(success.id)) linkInputDiv.removeChild(success);
    if (document.getElementById(validURL.id)) linkInputDiv.removeChild(validURL);
    importBackground.classList.add('is-loading');
    functions.removeLoading(importBackground);
    importBackground.disabled = false;
  }
};

setBackground.onclick = async () => {
  try {
    const imageURL = linkInput.value;
    const isURLValid = functions.isValidImageURL(imageURL);
    if ((!isURLValid || !imageURL) && !isLucky) {
      setBackground.disabled = true;
      importBackground.disabled = true;
      return;
    } else {
      setBackground.disabled = false;
      importBackground.disabled = false;
    }

    if (!isImported) {
      if (document.getElementById(validURL.id)) {
        document.getElementById(validURL.id).remove();
        if (linkInput.classList.contains('is-success')) linkInput.classList.remove('is-success');
      }
      linkInput.parentNode.append(noImport);
      setBackground.disabled = true;
      return;
    }

    let imageBuffer;
    if (isLucky) imageBuffer = await functions.getImageBuffer(importedBackground.src, isLucky);
    else imageBuffer = await functions.getImageBuffer(importedBackground.src);
    const fileName = functions.newFileName('wallpaper.png');
    let picturePath = path.join(os.homedir(), '/Pictures', fileName);
    picturePath = path.normalize(picturePath);

    setBackground.classList.add('is-loading');
    importBackground.classList.add('is-loading');
    const { filePath, canceled: saveCancelled } = await remote.dialog.showSaveDialog({
      buttonLabel: 'Set background',
      defaultPath: picturePath
    });

    if (saveCancelled) {
      functions.removeLoading(setBackground);
      functions.removeLoading(importBackground);
      return;
    }

    writeFile(filePath, imageBuffer, async (error: Error) => {
      if (error) return console.error(error);
      await wallpaper.set(filePath, { scale: 'stretch' });
      mainSection.insertBefore(successNotif, importedBackground);
    });
    
    functions.removeLoading(setBackground);
    functions.removeLoading(importBackground);
  } catch (error) {
    console.error(error);
    if (document.querySelectorAll('#setBgError').length >= 1) document.querySelectorAll('#setBgError')
      .forEach(node => node.remove());
    const errorBg = functions.errorDiv(`Could not set your desktop background: ${error.message}`, 'setBgError', 'setBgErrorClose');
    mainSection.insertBefore(errorBg, importedBackground)
    functions.removeLoading(setBackground);
    functions.removeLoading(importBackground);
  }
};

feelingLucky.onclick = async () => {
  try {
    const luckyImage = randomUnsplashImage;
    
    importBackground.classList.add('is-loading');
    importBackground.disabled = true;
    linkInput.disabled = true;
    const imageBase64 = await functions.getBase64Image(luckyImage);
    isLucky = true;
    importBackground.classList.remove('is-loading');
    linkInput.readOnly = true;
    linkInput.value = 'Feeling lucky, are we?';
    linkInput.classList.add('is-success');

    importedBackground.src = imageBase64;
    linkInput.classList.remove('is-danger');
    linkInput.classList.add('is-success');
    linkInput.parentNode.append(success);
    isImported = true;

    if (isImported && document.getElementById(noImport.id)) {
      document.getElementById(noImport.id).remove();
      if (linkInput.classList.contains('is-danger')) linkInput.classList.remove('is-danger');
    }
    if (linkInput.parentNode.contains(validURL)) linkInput.parentNode.append(validURL);
    
    if (isImported && setBackground.disabled) setBackground.disabled = false;
    if (isImported && importBackground.disabled) importBackground.disabled = false;
    if (linkInputDiv.querySelectorAll(`#${validURL.id}`).length >= 1) linkInputDiv.querySelectorAll(`#${validURL.id}`)
      .forEach(node => node.remove());

    importBackground.textContent = 'Clear';
    importBackground.classList.remove('is-success');
    importBackground.classList.add('is-danger');
  } catch (error) {
    console.error(error);
    if (document.querySelectorAll('#errorImport').length >= 1) document.querySelectorAll('#errorImport')
      .forEach(node => node.remove());
    const errorImport = functions.errorDiv(`An error has occurred importing the background: ${error.message}`, 'errorImport', 'errorImportClose');
    mainSection.insertBefore(errorImport, importedBackground);
    importBackground.disabled = true;
    isImported = false;
    isLucky = false;
  }
};

document.addEventListener('click', e => {
  const evtTarget = e.target as HTMLElement;
  
  if (evtTarget && (evtTarget.id === 'successNotifClose')) {
    document.getElementById('successNotif').remove();
    if (document.getElementById('savedNotif')) document.getElementById('savedNotif').remove();
    return;
  }

  if (evtTarget && (evtTarget.id === 'savedNotifClose')) {
    document.getElementById('savedNotif').remove();
    if (document.getElementById('successNotif')) document.getElementById('successNotif').remove();
    return;
  }

  if (evtTarget && (evtTarget.id === 'clearImportSuccessClose')) {
    document.getElementById('clearImportSuccess').remove();
    if (document.getElementById('successNotif')) document.getElementById('successNotif').remove();
    return;
  }

  if (evtTarget && (evtTarget.id === 'errorImportClose')) {
    if (document.getElementById('errorImport')) document.getElementById('errorImport').remove();
    return;
  }

  if (evtTarget && (evtTarget.id === 'setBgErrorClose')) {
    if (document.getElementById('setBgError')) document.getElementById('setBgError').remove();
    return;
  }
});
