import { useCallback, useEffect, useState } from 'react';

export function useDocumentPiP() {
  const [isSupported, setIsSupported] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  useEffect(() => {
    // eslint-disable-next-line
    setIsSupported('documentPictureInPicture' in window);
  }, []);

  const requestPiP = useCallback(
    async (options?: { width?: number; height?: number }) => {
      if (!('documentPictureInPicture' in window)) {
        alert(
          'Trình duyệt của bạn không hỗ trợ tính năng Xem thu nhỏ (Document Picture-in-Picture). Vui lòng cập nhật Chrome/Edge phiên bản mới nhất.',
        );
        return null;
      }

      try {
        // @ts-expect-error - documentPictureInPicture is not fully strongly typed yet
        const pip = await window.documentPictureInPicture.requestWindow({
          width: options?.width || 320,
          height: options?.height || 240,
        });

        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules]
              .map((rule) => rule.cssText)
              .join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            pip.document.head.appendChild(style);
          } catch {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = styleSheet.type;
            link.media = styleSheet.media.length
              ? styleSheet.media.mediaText
              : 'all';
            link.href = styleSheet.href || '';
            pip.document.head.appendChild(link);
          }
        });

        pip.document.body.style.margin = '0';
        pip.document.body.style.display = 'flex';
        pip.document.body.style.justifyContent = 'center';
        pip.document.body.style.alignItems = 'center';
        pip.document.body.style.minHeight = '100vh';
        pip.document.body.style.background =
          'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)';

        pip.document.documentElement.className =
          document.documentElement.className;
        pip.document.body.className = document.body.className || 'bg-slate-900';

        setPipWindow(pip);

        pip.addEventListener('pagehide', () => {
          setPipWindow(null);
        });

        return pip;
      } catch (error) {
        console.error('Failed to open PiP window:', error);
        alert('Không thể mở cửa sổ thu nhỏ. Vui lòng thử lại.');
        return null;
      }
    },
    [],
  );

  const closePiP = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }
  }, [pipWindow]);

  return {
    isSupported,
    isPiPActive: !!pipWindow,
    pipWindow,
    requestPiP,
    closePiP,
  };
}
