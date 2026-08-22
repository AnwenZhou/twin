import React, { createContext, useContext } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';

export const initialValues = {
  visible: false,
  cameraStatus: false,
  cameraCtrls: {
    choiceCtrls: '1',
    autoCruise: false,
  },
};

interface ThreeState {
  visible: boolean;
  cameraStatus: boolean;
  cameraCtrls: Record<string, any>;
}

export interface ThreeStore extends ThreeState {
  setVisible: (visible: boolean) => void;
  setCameraStatus: (cameraStatus: boolean) => void;
  setCameraCtrls: (cameraCtrls: Record<string, any>) => void;
}

interface ThreeStoreContextValue {
  threeStore: ThreeStore;
}

export const ThreeStoreContext = createContext<ThreeStoreContextValue | null>(null);

export function ThreeStoreProvider({ children }: { children: React.ReactNode }) {
  const threeStore = useLocalObservable<ThreeStore>(() => ({
    ...initialValues,
    setVisible(visible: boolean) {
      threeStore.visible = visible;
    },
    setCameraStatus(cameraStatus: boolean) {
      threeStore.cameraStatus = cameraStatus;
    },
    setCameraCtrls(cameraCtrls: Record<string, any>) {
      threeStore.cameraCtrls = cameraCtrls;
    },
  }));

  return (
    <ThreeStoreContext.Provider value={{ threeStore }}>{children}</ThreeStoreContext.Provider>
  );
}

export function useThreeStore() {
  const context = useContext(ThreeStoreContext);
  if (!context) {
    throw new Error('useThreeStore must be used within ThreeStoreProvider.');
  }
  return context.threeStore;
}

export { observer };
