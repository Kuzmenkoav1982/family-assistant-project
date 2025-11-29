import { useEffect } from 'react';

export const useJivoWidget = () => {
  useEffect(() => {
    const makeDraggable = () => {
      const jivoFrame = document.querySelector('jdiv[id^="jivo"]') as HTMLElement;
      
      if (!jivoFrame) {
        setTimeout(makeDraggable, 500);
        return;
      }

      let isDragging = false;
      let currentX = 0;
      let currentY = 0;
      let initialX = 0;
      let initialY = 0;

      const onMouseDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'IFRAME') return;
        
        isDragging = true;
        initialX = e.clientX - currentX;
        initialY = e.clientY - currentY;
        
        jivoFrame.style.cursor = 'grabbing';
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        const maxX = window.innerWidth - jivoFrame.offsetWidth;
        const maxY = window.innerHeight - jivoFrame.offsetHeight;

        currentX = Math.max(0, Math.min(currentX, maxX));
        currentY = Math.max(0, Math.min(currentY, maxY));

        jivoFrame.style.transform = `translate(${currentX}px, ${currentY}px)`;
        jivoFrame.style.right = 'auto';
        jivoFrame.style.bottom = 'auto';
        jivoFrame.style.left = '0';
        jivoFrame.style.top = '0';
      };

      const onMouseUp = () => {
        isDragging = false;
        jivoFrame.style.cursor = 'move';
      };

      jivoFrame.style.cursor = 'move';
      jivoFrame.style.transition = 'none';
      jivoFrame.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      return () => {
        jivoFrame.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    };

    const timeoutId = setTimeout(makeDraggable, 1000);
    return () => clearTimeout(timeoutId);
  }, []);
};
