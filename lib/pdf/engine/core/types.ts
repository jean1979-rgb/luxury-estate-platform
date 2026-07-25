export type Bounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type TemplateItem = {
  field?: string;
  name?: string;
  layer?: string;
  type?: string;
  text?: string;
  size?: number;
  bounds: Bounds;
};

export type Artboard = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};
