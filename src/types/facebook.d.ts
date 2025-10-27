declare global {
  interface Window {
    FB: {
      XFBML: {
        parse: () => void;
      };
      init: (config: any) => void;
    };
  }
}

export {};
