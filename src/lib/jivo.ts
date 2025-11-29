declare global {
  interface Window {
    jivo_api?: {
      open: () => void;
      close: () => void;
      setContactInfo: (info: any) => void;
    };
    jivo_config?: {
      widget_position?: 'bottom_left' | 'bottom_right';
    };
  }
}

export const openJivoChat = () => {
  if (typeof window !== 'undefined' && window.jivo_api) {
    window.jivo_api.open();
  }
};

export const closeJivoChat = () => {
  if (typeof window !== 'undefined' && window.jivo_api) {
    window.jivo_api.close();
  }
};

export {};
