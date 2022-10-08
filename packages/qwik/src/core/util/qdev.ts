export const qDev = globalThis.qDev === true;
export const qSerialize = globalThis.qSerialize !== false;
export const qDynamicPlatform = globalThis.qDynamicPlatform !== false;
export const qTest = globalThis.qTest === true;
export const qRuntimeQrl = globalThis.qRuntimeQrl === true;

export const seal = (obj: any) => {
  if (qDev) {
    Object.seal(obj);
  }
};

declare const globalThis: any;
