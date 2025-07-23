/*
  html2canvas 1.4.1 <https://html2canvas.hertzen.com>
  Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
  Released under MIT License
*/

// This is a simplified version of html2canvas for the theme comparison tool
// In a real implementation, you would include the full library

const html2canvas = (element, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match the element
      const rect = element.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Draw a white background
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Use browser's built-in capability if available
      if (element instanceof HTMLElement) {
        // Create a temporary container
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        
        // Clone the element
        const clone = element.cloneNode(true);
        tempContainer.appendChild(clone);
        document.body.appendChild(tempContainer);
        
        // Apply computed styles
        const styles = window.getComputedStyle(element);
        for (let i = 0; i < styles.length; i++) {
          const prop = styles[i];
          clone.style[prop] = styles.getPropertyValue(prop);
        }
        
        // Set dimensions
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        
        // Convert to data URL
        html2image(clone, canvas, context, 0, 0, rect.width, rect.height)
          .then(() => {
            // Clean up
            document.body.removeChild(tempContainer);
            resolve(canvas);
          })
          .catch(err => {
            document.body.removeChild(tempContainer);
            reject(err);
          });
      } else {
        reject(new Error('Element is not a valid HTMLElement'));
      }
    } catch (err) {
      reject(err);
    }
  });
};

// Helper function to convert HTML to image
function html2image(element, canvas, context, x, y, width, height) {
  return new Promise((resolve, reject) => {
    try {
      // For this simplified version, we'll use a basic approach
      // In a real implementation, this would be much more complex
      
      // Draw element background
      const bgColor = getComputedStyle(element).backgroundColor;
      if (bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        context.fillStyle = bgColor;
        context.fillRect(x, y, width, height);
      }
      
      // Draw element border
      const borderWidth = parseInt(getComputedStyle(element).borderWidth) || 0;
      if (borderWidth > 0) {
        context.strokeStyle = getComputedStyle(element).borderColor;
        context.lineWidth = borderWidth;
        context.strokeRect(x, y, width, height);
      }
      
      // Draw text content if it's a text node
      if (element.nodeType === Node.TEXT_NODE) {
        const parentStyle = getComputedStyle(element.parentNode);
        context.font = `${parentStyle.fontWeight} ${parentStyle.fontSize} ${parentStyle.fontFamily}`;
        context.fillStyle = parentStyle.color;
        context.fillText(element.textContent, x, y + parseInt(parentStyle.fontSize));
      }
      
      // Process child elements
      const children = element.childNodes;
      let currentY = y;
      
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.nodeType === Node.ELEMENT_NODE) {
          const childRect = child.getBoundingClientRect();
          const childX = x + (childRect.left - element.getBoundingClientRect().left);
          const childY = currentY;
          const childWidth = childRect.width;
          const childHeight = childRect.height;
          
          html2image(child, canvas, context, childX, childY, childWidth, childHeight);
          
          // Update Y position for block elements
          if (getComputedStyle(child).display === 'block') {
            currentY += childHeight;
          }
        } else if (child.nodeType === Node.TEXT_NODE) {
          // Handle text nodes
          const textContent = child.textContent.trim();
          if (textContent) {
            const parentStyle = getComputedStyle(element);
            context.font = `${parentStyle.fontWeight} ${parentStyle.fontSize} ${parentStyle.fontFamily}`;
            context.fillStyle = parentStyle.color;
            context.fillText(textContent, x, currentY + parseInt(parentStyle.fontSize));
            currentY += parseInt(parentStyle.fontSize) * 1.2; // Approximate line height
          }
        }
      }
      
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export default html2canvas;