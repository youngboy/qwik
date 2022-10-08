import type {
  ContentModule,
  RouteLocation,
  EndpointResponse,
  ResolvedDocumentHead,
  DocumentHeadProps,
  DocumentHeadValue,
  ClientPageData,
} from './types';

export const resolveHead = (
  endpoint: EndpointResponse | ClientPageData | undefined | null,
  routeLocation: RouteLocation,
  contentModules: ContentModule[]
) => {
  const head = createDocumentHead();
  const headProps: DocumentHeadProps = {
    data: endpoint ? endpoint.body : null,
    head,
    ...routeLocation,
  };

  for (let i = contentModules.length - 1; i >= 0; i--) {
    const contentModuleHead = contentModules[i] && contentModules[i].head;
    if (contentModuleHead) {
      if (typeof contentModuleHead === 'function') {
        resolveDocumentHead(head, contentModuleHead(headProps));
      } else if (typeof contentModuleHead === 'object') {
        resolveDocumentHead(head, contentModuleHead);
      }
    }
  }

  return headProps.head;
};

const resolveDocumentHead = (
  resolvedHead: ResolvedDocumentHead,
  updatedHead: DocumentHeadValue
) => {
  if (typeof updatedHead.title === 'string') {
    resolvedHead.title = updatedHead.title;
  }
  mergeArray(resolvedHead.meta, updatedHead.meta);
  mergeArray(resolvedHead.links, updatedHead.links);
  mergeArray(resolvedHead.styles, updatedHead.styles);
};

const mergeArray = (existingArr: { key?: string }[], newArr: { key?: string }[] | undefined) => {
  if (Array.isArray(newArr)) {
    for (const newItem of newArr) {
      if (typeof newItem.key === 'string') {
        const existingIndex = existingArr.findIndex((i) => i.key === newItem.key);
        if (existingIndex > -1) {
          existingArr[existingIndex] = newItem;
          continue;
        }
      }
      existingArr.push(newItem);
    }
  }
};

export const createDocumentHead = (): ResolvedDocumentHead => ({
  title: '',
  meta: [],
  links: [],
  styles: [],
  frontmatter: {},
});
